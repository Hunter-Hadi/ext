import dayjs from 'dayjs'
import random from 'lodash-es/random'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { chromeExtensionArkoseTokenGenerator } from '@/features/chatgpt/core/chromeExtensionArkoseTokenGenerator'
import { setSearchWithAISettings } from '@/features/searchWithAI/utils/searchWithAISettings'
import {
  crawlingSearchResults,
  ICrawlingSearchResult,
} from '@/features/shortcuts/utils/searchEngineCrawling'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_APP_NAME,
  // SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT,
  SEARCH_WITH_AI_PROMPT,
} from '../constants'
import {
  AutoTriggerAskEnableAtom,
  ISearchWithAIConversationType,
  SearchWithAIConversationAtom,
} from '../store'
import { ISearchPageKey, searchWithAIAskQuestion } from '../utils'
import useSearchWithAICache from './useSearchWithAICache'
import useSearchWithAISettings from './useSearchWithAISettings'
import useSearchWithAISources from './useSearchWithAISources'

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
  // 停止
  | 'stop'

// 不同 provider 的超时时间
const PROVIDER_TIMEOUT_DURATION: Record<ISearchWithAIProviderType, number> = {
  OPENAI: 10000,
  USE_CHAT_GPT_PLUS: 10000,
  MAXAI_CLAUDE: 10000,
  OPENAI_API: 10000,
  CLAUDE: 10000,
  BING: 10000,
  BARD: 20000,
}

const useSearchWithAICore = (question: string, siteName: ISearchPageKey) => {
  const [status, setStatus] = useState<IAIForSearchStatus>('idle')
  const loadingRef = useRef(false)

  const taskId = useRef('')
  const timer = useRef(0)

  // 是否使用了缓存
  const [isUseCache, setIsUseCache] = useState(false)

  const {
    getSearchWithAICacheData,
    setSearchWithAICacheData,
  } = useSearchWithAICache()

  const { searchWithAISettings } = useSearchWithAISettings()

  const [conversation, setConversation] = useRecoilState(
    SearchWithAIConversationAtom,
  )

  const setAutoTriggerAskEnable = useSetRecoilState(AutoTriggerAskEnableAtom)

  const {
    startSourcesLoading,
    clearSources,
    setSources,
  } = useSearchWithAISources()

  const updateConversation = (
    newConversationData: Partial<ISearchWithAIConversationType>,
  ) => {
    setConversation((pre) => ({
      ...pre,
      ...newConversationData,
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

    const cacheData = await getSearchWithAICacheData(
      siteName,
      searchWithAISettings.aiProvider,
      question,
      webAccessPrompt,
    )

    if (cacheData) {
      setStatus('success')
      updateConversation({
        loading: false,
        completedMessage: cacheData.completedMessage,
        writingMessage: '',
      })
      setSources(cacheData.sources)
      loadingRef.current = false
      setIsUseCache(true)
      return
    } else {
      setIsUseCache(false)
    }

    // 1. GET_CONTENTS_OF_HTML
    let sources: ICrawlingSearchResult[] = []
    if (webAccessPrompt) {
      // 开启 webAccessPrompt 时才获取 sources
      startSourcesLoading()
      const results = crawlingSearchResults({
        html: document.body.innerHTML,
        searchEngine: siteName,
        searchQuery: question,
      })

      // search with ai 中 source 只取6个
      const slicedResults = results.slice(0, 6)

      // 由于获取 sources 的过程都比较快，所以这里 模拟一个 800ms ~ 500ms 的loading
      setTimeout(() => {
        setSources(slicedResults)
        sources = slicedResults
      }, random(500, 800))

      // 2. SEARCH_RESULTS_EXPAND
      let expandContent = ''
      for (let i = 0; i < results.length; i++) {
        const searchResult = results[i]
        expandContent += `NUMBER:${i + 1}\nURL: ${searchResult.url}\nTITLE: ${
          searchResult.title
        }\nCONTENT: ${searchResult.body}\n\n`
      }

      template = await generatePromptTemplate(question, expandContent)
    }

    // 3. ASK_CHATGPT
    const messageId = uuidV4()
    const conversationId = uuidV4()
    updateConversation({
      conversationId,
      loading: true,
    })
    taskId.current = messageId
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__search_with_AI_running_task_id = messageId

    // 为了控制 第一次 onmessage 时，setStatus('answering') 不重复set
    // console.log(
    //   `searchWithAISettings.aiProvider`,
    //   searchWithAISettings.aiProvider,
    // )
    let answered = false
    let message = ''
    let hasError = false
    let errorMessage = ''
    let isTimeout = false
    if (SEARCH_WITH_AI_APP_NAME === 'maxai') {
      port.postMessage({
        event: 'Client_logCallApiRequest',
        data: {
          name: 'SEARCH_WITH_AI',
          id: 'SEARCH_WITH_AI',
          provider: searchWithAISettings.aiProvider,
          host: getCurrentDomainHost(),
        },
      })
    }
    if (searchWithAISettings.aiProvider === 'OPENAI') {
      const arkoseToken = await chromeExtensionArkoseTokenGenerator.generateToken(
        'gpt_3_5',
      )
      await setSearchWithAISettings({
        arkoseToken,
      })
    }

    timer.current && window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      // console.error('in timeout')
      setStatus('error')
      isTimeout = true
      updateConversation({
        loading: false,
        errorMessage:
          'It seems like the system is experiencing some trouble right now. Please try again.',
        writingMessage: '',
      })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__search_with_AI_running_task_id = null

      loadingRef.current = false
      return
    }, PROVIDER_TIMEOUT_DURATION[searchWithAISettings.aiProvider])

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
          if (isTimeout) {
            return
          }
          timer.current && window.clearTimeout(timer.current)
          if (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.__search_with_AI_running_task_id === msg.parentMessageId
          ) {
            if (!answered) {
              setStatus('answering')
              answered = true
            }
            message = msg.text
            updateConversation({
              loading: true,
              writingMessage: msg.text,
            })
          }
        },
        onError: async (error: any) => {
          if (isTimeout) {
            return
          }
          timer.current && window.clearTimeout(timer.current)
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
    if (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__search_with_AI_running_task_id === taskId.current &&
      !isTimeout
    ) {
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

        setSearchWithAICacheData({
          searchPage: siteName,
          aiProvider: searchWithAISettings.aiProvider,
          query: question,
          completedMessage: message,
          sources,
          webAccess: webAccessPrompt,
        })
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__search_with_AI_running_task_id = null
      loadingRef.current = false
    }
  }, [
    question,
    searchWithAISettings?.webAccessPrompt,
    status,
    searchWithAISettings?.aiProvider,
  ])

  const handleResetStatus = useCallback(async () => {
    timer.current && window.clearTimeout(timer.current)

    clearSources()

    // 重置 auto trigger 状态
    setAutoTriggerAskEnable(true)
    setStatus('idle')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__search_with_AI_running_task_id = null
  }, [])

  const handleStopGenerate = useCallback(async () => {
    timer.current && window.clearTimeout(timer.current)

    if (taskId.current) {
      await port.postMessage({
        event: 'SWAI_abortAskChatGPTQuestion',
        data: {
          taskId: taskId.current,
        },
      })
    }

    if (conversation.writingMessage) {
      setStatus('success')
    } else {
      setStatus('stop')
      clearSources()
    }

    updateConversation({
      loading: false,
    })
    loadingRef.current = false
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__search_with_AI_running_task_id = null
  }, [conversation.conversationId, conversation.writingMessage])

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
    isUseCache,
    handleResetStatus,
    handleAskQuestion,
    handleStopGenerate,
  }
}

const generatePromptTemplate = async (query: string, content: string) => {
  let promptTemplate = SEARCH_WITH_AI_PROMPT
  const date = dayjs().format('YYYY-MM-DD HH:mm:ss')
  promptTemplate = promptTemplate.replace(/{query}/g, query)
  promptTemplate = promptTemplate.replace(/{web_results}/g, content)
  promptTemplate = promptTemplate.replace(/{current_date}/g, date)

  return promptTemplate
}

export default useSearchWithAICore
