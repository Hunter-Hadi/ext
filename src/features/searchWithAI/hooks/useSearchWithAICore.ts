import { crawlingSearchResults } from '@/features/shortcuts/utils/searchEngineCrawling'
import dayjs from 'dayjs'
import random from 'lodash-es/random'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  // SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT,
  SEARCH_WITH_AI_PROMPT,
} from '../constants'
import { searchWithAIAskQuestion, ISearchPageKey } from '../utils'
import { ISearchWithAISettings } from '../utils/searchWithAISettings'
import useSearchWithAISettings from './useSearchWithAISettings'
import useSourcesStatus from './useSourcesStatus'
import { v4 as uuidV4 } from 'uuid'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useSetRecoilState } from 'recoil'
import { AutoTriggerAskEnableAtom } from '../store'
import { getCurrentDomainHost } from '@/utils'
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
export type IAIForSearchStatus =
  // 初始化状态
  | 'idle'
  // 等待 AI 的回复
  | 'waitingAnswer'
  // AI 正在回复，但是还没有回复完毕
  | 'answering'
  // AI 回复完毕
  | 'success'
  // 报错
  | 'error'

const useSearchWithAICore = (question: string, siteName: ISearchPageKey) => {
  const [status, setStatus] = useState<IAIForSearchStatus>('idle')
  const loadingRef = useRef(false)

  const taskId = useRef('')

  const {
    searchWithAISettings,
    setSearchWithAISettings,
  } = useSearchWithAISettings()

  const conversation = searchWithAISettings.conversation

  const setAutoTriggerAskEnable = useSetRecoilState(AutoTriggerAskEnableAtom)

  const { startSourcesLoading, clearSources, setSources } = useSourcesStatus()

  const updateConversation = (
    newConversationData: Partial<ISearchWithAISettings['conversation']>,
  ) => {
    setSearchWithAISettings((pre) => ({
      ...pre,
      conversation: {
        ...pre.conversation,
        ...newConversationData,
      },
    }))
  }

  const completedAnswer = useMemo(() => {
    if (conversation.loading) {
      return null
    }

    return conversation.completedMessage
  }, [conversation.completedMessage, conversation.loading])

  const isAnswering = useMemo(
    () => conversation.loading && !!conversation.writingMessage,
    [conversation.loading, conversation.writingMessage],
  )

  const handleAskQuestion = useCallback(async () => {
    if (loadingRef.current) {
      return
    }

    const webAccessPrompt = searchWithAISettings.webAccessPrompt

    let template = question

    setStatus('waitingAnswer')
    loadingRef.current = true

    // 1. GET_CONTENTS_OF_HTML
    if (webAccessPrompt) {
      // 开启 webAccessPrompt 时才获取 sources
      startSourcesLoading()
      const results = await crawlingSearchResults({
        html: document.body.innerHTML,
        limit: 6,
        searchEngine: siteName,
        fullSearchURL: location.href,
        query: question,
      })
      // 由于获取 sources 的过程都比较快，所以这里 模拟一个 800ms ~ 500ms 的loading
      setTimeout(() => {
        setSources(results)
      }, random(500, 800))

      // 2. SEARCH_RESULTS_EXPAND
      let expandContent = ''
      for (let i = 0; i < results.length; i++) {
        const searchResult = results[i]
        expandContent += `NUMBER:${i + 1}\nURL: ${searchResult.url}\nTITLE: ${
          searchResult.title
        }\nCONTENT: ${searchResult.body}\n\n`
      }

      template = generatePromptTemplate(question, expandContent)
    }

    // 3. ASK_CHATGPT
    const messageId = uuidV4()
    const conversationId = uuidV4()
    updateConversation({
      conversationId,
      loading: true,
    })
    taskId.current = messageId

    // 为了控制 第一次 onmessage 时，setStatus('answering') 不重复set
    // console.log(
    //   `searchWithAISettings.aiProvider`,
    //   searchWithAISettings.aiProvider,
    // )
    let answered = false
    let message = ''
    let hasError = false
    let errorMessage = ''
    port.postMessage({
      event: 'Client_logCallApiRequest',
      data: {
        name: 'SEARCH_WITH_AI',
        id: 'SEARCH_WITH_AI',
        provider: searchWithAISettings.aiProvider,
        host: getCurrentDomainHost(),
      },
    })
    await searchWithAIAskQuestion(
      {
        messageId,
        parentMessageId: '',
        conversationId,
        question: template,
      },
      {},
      {
        onMessage: (msg) => {
          if (!answered) {
            setStatus('answering')
            answered = true
          }
          message = msg.text
          updateConversation({
            loading: true,
            writingMessage: msg.text,
          })
        },
        onError: async (error: any) => {
          hasError = true
          errorMessage =
            error?.message || error || 'Error detected. Please try again.'

          // 手动暂停不算报错
          if (errorMessage === 'manual aborted request.') {
            hasError = false
            errorMessage = ''
          }

          if (typeof errorMessage !== 'string') {
            errorMessage = 'Network error. Please try again.'
          }
        },
      },
    )

    if (hasError && errorMessage) {
      setStatus('error')
      updateConversation({
        loading: false,
        errorMessage: errorMessage,
        writingMessage: '',
      })
    } else {
      setStatus('success')
      updateConversation({
        loading: false,
        completedMessage: message,
        writingMessage: '',
      })
    }
    loadingRef.current = false
  }, [
    question,
    searchWithAISettings?.webAccessPrompt,
    status,
    searchWithAISettings?.aiProvider,
  ])

  const handleResetStatus = useCallback(async () => {
    clearSources()

    // 重置 auto trigger 状态
    setAutoTriggerAskEnable(true)
    setStatus('idle')
  }, [])

  const handleStopGenerate = useCallback(async () => {
    if (taskId.current) {
      await port.postMessage({
        event: 'SWAI_abortAskChatGPTQuestion',
        data: {
          taskId: taskId.current,
        },
      })
    }
    // setStatus('idle')
  }, [conversation.conversationId])

  useEffect(() => {
    return () => {
      port.postMessage({
        event: 'SWAI_abortAskChatGPTQuestion',
        data: {
          taskId: taskId.current,
        },
      })
    }
  }, [])

  return {
    status,
    completedAnswer,
    isAnswering,
    loading: conversation.loading,
    conversation,
    handleResetStatus,
    handleAskQuestion,
    handleStopGenerate,
  }
}

const generatePromptTemplate = (query: string, content: string) => {
  let promptTemplate = SEARCH_WITH_AI_PROMPT
  const date = dayjs().format('YYYY-MM-DD HH:mm:ss')

  promptTemplate = promptTemplate.replace(/{query}/g, query)
  promptTemplate = promptTemplate.replace(/{web_results}/g, content)
  promptTemplate = promptTemplate.replace(/{current_date}/g, date)

  return promptTemplate
}

export default useSearchWithAICore
