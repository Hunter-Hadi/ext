import dayjs from 'dayjs'
import random from 'lodash-es/random'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  DEFAULT_AI_OUTPUT_LANGUAGE_ID,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { chromeExtensionArkoseTokenGenerator } from '@/features/chatgpt/core/chromeExtensionArkoseTokenGenerator'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_APP_NAME,
  SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER,
  SEARCH_WITH_AI_PROMPT,
} from '@/features/searchWithAI/constants'
import { IAIForSearchStatus } from '@/features/searchWithAI/types'
import { setSearchWithAISettings } from '@/features/searchWithAI/utils/searchWithAISettings'
import generatePromptAdditionalText from '@/features/shortcuts/actions/chat/ActionAskChatGPT/generatePromptAdditionalText'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import {
  crawlingSearchResults,
  ICrawlingSearchResult,
} from '@/features/shortcuts/utils/searchEngineCrawling'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

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

// 不同 provider 的超时时间
const PROVIDER_TIMEOUT_DURATION: Record<ISearchWithAIProviderType, number> = {
  MAXAI_FREE: 10000,
  OPENAI: 15000,
  USE_CHAT_GPT_PLUS: 20000,
  MAXAI_CLAUDE: 20000,
  OPENAI_API: 10000,
  CLAUDE: 10000,
  BING: 10000,
  BARD: 20000,
}

// 显示Free用户每隔n次调用Search with AI时，提示m次高流量
const FREE_USER_HIGH_TRAFFIC_SAVE_KEY = 'FREE_USER_HIGH_TRAFFIC_PROMPT'
const FREE_USER_HIGH_TRAFFIC_PROMPT_INTERVAL = [2, 3, 4]
const FREE_USER_HIGH_TRAFFIC_PROMPT_TIMES = [1, 2]
/**
 * 重置Free用户高流量提示
 */
const resetFreeUserHighTrafficPrompt = async () => {
  const interval =
    FREE_USER_HIGH_TRAFFIC_PROMPT_INTERVAL[
      random(0, FREE_USER_HIGH_TRAFFIC_PROMPT_INTERVAL.length - 1)
    ]
  const times =
    FREE_USER_HIGH_TRAFFIC_PROMPT_TIMES[
      random(0, FREE_USER_HIGH_TRAFFIC_PROMPT_TIMES.length - 1)
    ]
  await Browser.storage.local.set({
    [FREE_USER_HIGH_TRAFFIC_SAVE_KEY]: {
      interval,
      times,
    },
  })
}
/**
 * 获取Free用户是否需要提示高流量
 */
const getFreeUserIsHighTrafficPrompt = async () => {
  const data = await Browser.storage.local.get(FREE_USER_HIGH_TRAFFIC_SAVE_KEY)
  if (!data[FREE_USER_HIGH_TRAFFIC_SAVE_KEY]) {
    await resetFreeUserHighTrafficPrompt()
    return false
  }
  const { interval, times } = data[FREE_USER_HIGH_TRAFFIC_SAVE_KEY]
  // 如果interval为0，则代表进入下一个周期
  if (interval <= 0) {
    if (times <= 1) {
      await resetFreeUserHighTrafficPrompt()
    }
    // 如果times为0，则代表不需要提示高流量,返回false
    return times > 0
  } else {
    // 此时interval不为0，说明这个周期还没结束
    if (times > 0) {
      // 如果times大于0，说明还需要提示高流量
      const isHighTraffic = Math.random() > 0.5
      await Browser.storage.local.set({
        [FREE_USER_HIGH_TRAFFIC_SAVE_KEY]: {
          interval: interval - 1,
          times: isHighTraffic ? times - 1 : times,
        },
      })
      return isHighTraffic
    } else {
      // 如果times为0，说明不需要提示高流量
      await Browser.storage.local.set({
        [FREE_USER_HIGH_TRAFFIC_SAVE_KEY]: {
          interval: interval - 1,
          times,
        },
      })
      return false
    }
  }
}

const useSearchWithAICore = (question: string, siteName: ISearchPageKey) => {
  const { isPayingUser, currentUserPlan } = useUserInfo()

  const [status, setStatus] = useState<IAIForSearchStatus>('idle')
  const loadingRef = useRef(false)

  const taskId = useRef('')
  const timer = useRef(0)

  // 是否使用了缓存
  const [isUseCache, setIsUseCache] = useState(false)

  const { getSearchWithAICacheData, setSearchWithAICacheData } =
    useSearchWithAICache()

  const { searchWithAISettings } = useSearchWithAISettings()

  const [conversation, setConversation] = useRecoilState(
    SearchWithAIConversationAtom,
  )

  const setAutoTriggerAskEnable = useSetRecoilState(AutoTriggerAskEnableAtom)

  const { startSourcesLoading, clearSources, setSources } =
    useSearchWithAISources()

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
    console.log(currentUserPlan)
    if (!isPayingUser && (await getFreeUserIsHighTrafficPrompt())) {
      setStatus('error')
      mixpanelTrack('paywall_showed', {
        logType: `SEARCH_WITH_AI_HIGH_TRAFFIC(Free)`,
        sceneType: 'SEARCH_WITH_AI_HIGH_TRAFFIC',
      })
      updateConversation({
        loading: false,
        errorMessage: 'SEARCH_WITH_AI_HIGH_TRAFFIC',
        writingMessage: '',
      })
      return
    }

    // 0.确认语言
    let userSelectedLanguage =
      (await clientGetLiteChromeExtensionDBStorage()).userSettings?.language ||
      DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
    // NOTE: 历史遗留问题
    if (userSelectedLanguage === DEFAULT_AI_OUTPUT_LANGUAGE_ID) {
      userSelectedLanguage = DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
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
      const additionalText = await generatePromptAdditionalText({
        PAGE_CONTENT: expandContent,
        AI_RESPONSE_LANGUAGE: userSelectedLanguage,
      })
      if (additionalText.addPosition === 'start') {
        template = additionalText.data + '\n\n' + template
      } else {
        template += '\n\n' + additionalText.data
      }
    } else {
      const additionalText = await generatePromptAdditionalText({
        PAGE_CONTENT: question,
        AI_RESPONSE_LANGUAGE: userSelectedLanguage,
      })
      if (additionalText.addPosition === 'start') {
        template = additionalText.data + '\n\n' + template
      } else {
        template += '\n\n' + additionalText.data
      }
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
          conversationId,
          host: getCurrentDomainHost(),
          aiProvide: searchWithAISettings.aiProvider,
          aiModel:
            SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER[
              searchWithAISettings.aiProvider
            ],
        },
      })
    }
    if (searchWithAISettings.aiProvider === 'OPENAI') {
      const result = await clientFetchAPI(
        'https://chat.openai.com/api/auth/session',
        {
          method: 'GET',
        },
      )
      if (result?.data?.accessToken) {
        // 先调用chatRequirements
        const chatRequirementsResult = await clientFetchAPI(
          `https://chat.openai.com/backend-api/sentinel/chat-requirements`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${result.data.accessToken}`,
            },
            body: JSON.stringify({
              conversation_mode_kind: 'primary_assistant',
            }),
          },
        )
        const chatRequirementsToken = chatRequirementsResult?.data?.token || ''
        const dx = chatRequirementsResult?.data?.arkose?.dx || ''
        if (dx) {
          const arkoseToken =
            await chromeExtensionArkoseTokenGenerator.generateToken('gpt_4', dx)
          await setSearchWithAISettings({
            arkoseToken,
            chatRequirementsToken,
          })
        } else {
          await setSearchWithAISettings({
            arkoseToken: '',
            chatRequirementsToken,
          })
        }
      }
    }

    timer.current && window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      // console.error('in timeout')
      const PROVIDER_ERROR_MESSAGE: Record<string, string> = {
        MAXAI_FREE:
          'It seems like the system is experiencing some trouble right now. Please switch to other premium AI models now to enjoy high-quality experiences, or try again later.',
      }

      const timeoutErrorMessage =
        PROVIDER_ERROR_MESSAGE[searchWithAISettings.aiProvider] ||
        'It seems like the system is experiencing some trouble right now. Please try again.'

      setStatus('error')
      isTimeout = true
      updateConversation({
        loading: false,
        errorMessage: timeoutErrorMessage,
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
        type: 'user',
        text: template,
        messageId,
        conversationId,
      },
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
          currentAIProvider: searchWithAISettings.aiProvider,
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
    conversation: conversation,
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
