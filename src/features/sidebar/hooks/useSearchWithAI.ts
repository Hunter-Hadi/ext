import { useEffect, useMemo, useRef, useState } from 'react'
import { useSetRecoilState } from 'recoil'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { generateSearchWithAIActions } from '@/features/sidebar/utils/searchWithAIHelper'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'

const useSearchWithAI = () => {
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
    currentSidebarConversationMessages,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  const { currentUserPlan } = useUserInfo()
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat()
  const [runActions, setRunActions] = useState<ISetActionsType>([])
  const { createConversation, pushPricingHookMessage } = useClientConversation()
  const isFetchingRef = useRef(false)
  const lastMessageIdRef = useRef('')
  const memoPrevQuestions = useMemo(() => {
    const memoQuestions = []
    // 从后往前，直到include_history为false
    for (let i = currentSidebarConversationMessages.length - 1; i >= 0; i--) {
      const message = currentSidebarConversationMessages[
        i
      ] as IAIResponseMessage
      memoQuestions.unshift(
        message?.originalMessage?.metadata?.title?.title || message.text || '',
      )
      if (message.type === 'ai') {
        if (message?.originalMessage?.metadata?.includeHistory === false) {
          break
        }
      }
    }
    return memoQuestions
  }, [currentSidebarConversationMessages])
  const createSearchWithAI = async (query: string, includeHistory: boolean) => {
    if (isFetchingRef.current) {
      return
    }
    if (!isShowChatBox()) {
      showChatBox()
    }
    if (currentSidebarConversationType !== 'Search') {
      await updateSidebarConversationType('Search')
    }
    console.log('新版Conversation 创建searchWithAI')
    //切换至Search的时候把ChatGPT（MaxAI）的provider的onboarding check设置为true
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_USE_CHAT_GPT_PLUS',
      true,
    )
    updateConversation((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    })
    try {
      console.log('新版Conversation search with AI 开始创建')
      // 进入loading
      await createConversation('Search')
      updateConversation((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      })
      // 如果是免费用户
      if (currentUserPlan.name !== 'pro' && currentUserPlan.name !== 'elite') {
        // 判断lifetimes free trial是否已经用完
        const searchLifetimesQuota =
          Number(
            (await getChromeExtensionOnBoardingData())
              .ON_BOARDING_RECORD_SEARCH_FREE_TRIAL_TIMES,
          ) || 0
        if (searchLifetimesQuota > 0) {
          // 如果没有用完，那么就减一
          await setChromeExtensionOnBoardingData(
            'ON_BOARDING_RECORD_SEARCH_FREE_TRIAL_TIMES',
            searchLifetimesQuota - 1,
          )
        } else {
          await pushPricingHookMessage('SIDEBAR_SEARCH_WITH_AI')
          authEmitPricingHooksLog('show', 'SIDEBAR_SEARCH_WITH_AI')
          return
        }
      }
      const { messageId, actions } = await generateSearchWithAIActions(
        query,
        memoPrevQuestions,
        includeHistory,
      )
      lastMessageIdRef.current = messageId
      setRunActions(actions)
    } catch (e) {
      console.log('创建Conversation失败', e)
    }
  }
  // 因为在regenerate的时候消息更更新不及时，所以需要一个ref确保历史记录是最新的
  const createSearchWithAIRef = useRef(createSearchWithAI)
  useEffect(() => {
    createSearchWithAIRef.current = createSearchWithAI
  }, [createSearchWithAI])
  const getSearchWithAIConversationId = async () => {
    return (
      (await getChromeExtensionLocalStorage())?.sidebarSettings?.search
        ?.conversationId || ''
    )
  }
  /**
   * 专门搜索引擎的search with ai板块往sidebar继续聊天的入口
   */
  const continueInSearchWithAI = async (startMessage: IAIResponseMessage) => {
    if (!isShowChatBox()) {
      showChatBox()
    }
    if (currentSidebarConversationType !== 'Search') {
      await updateSidebarConversationType('Search')
    }
    let cacheConversationId = await getSearchWithAIConversationId()
    if (
      cacheConversationId &&
      (await clientGetConversation(cacheConversationId))
    ) {
      // nothing
    } else {
      cacheConversationId = await createConversation('Search')
    }
    await clientChatConversationModifyChatMessages(
      'add',
      cacheConversationId,
      0,
      [startMessage],
    )
  }
  const regenerateSearchWithAI = async () => {
    try {
      if (currentSidebarConversationId) {
        let lastAIResponse: IAIResponseMessage | null = null
        let deleteCount = 0
        for (
          let i = currentSidebarConversationMessages.length - 1;
          i >= 0;
          i--
        ) {
          const message = currentSidebarConversationMessages[i]
          deleteCount++
          if (message.type === 'ai') {
            lastAIResponse = message as IAIResponseMessage
            break
          }
        }
        const lastQuestion =
          lastAIResponse?.originalMessage?.metadata?.title?.title ||
          lastAIResponse?.text ||
          ''
        if (lastQuestion) {
          await clientChatConversationModifyChatMessages(
            'delete',
            currentSidebarConversationId,
            deleteCount,
            [],
          )
          setTimeout(async () => {
            await createSearchWithAIRef.current(
              lastQuestion,
              lastAIResponse?.originalMessage?.metadata?.includeHistory ||
                false,
            )
          }, 200)
        } else {
          // 如果没有找到last question，那么就重新生成Conversation
          await clientChatConversationModifyChatMessages(
            'delete',
            currentSidebarConversationId,
            9999,
            [],
          )
        }
      }
    } catch (e) {
      console.log('重新生成Conversation失败', e)
    }
  }
  useEffect(() => {
    if (
      runActions.length > 0 &&
      !isFetchingRef.current &&
      currentSidebarConversationType === 'Search' &&
      currentSidebarConversationId
    ) {
      isFetchingRef.current = true
      if (setShortCuts(runActions)) {
        runShortCuts()
          .then()
          .catch()
          .finally(async () => {
            isFetchingRef.current = false
            setRunActions([])
            const conversationId = await getSearchWithAIConversationId()
            if (conversationId && lastMessageIdRef.current) {
              // 因为整个过程不一定是成功的
              // 更新消息的isComplete/sources.status
              clientChatConversationModifyChatMessages(
                'update',
                conversationId,
                0,
                [
                  {
                    messageId: lastMessageIdRef.current,
                    originalMessage: {
                      metadata: {
                        sources: {
                          status: 'complete',
                        },
                        isComplete: true,
                      },
                    },
                  } as IAIResponseMessage,
                ],
              )
                .then()
                .catch()
            }
          })
      } else {
        setRunActions([])
        isFetchingRef.current = false
      }
    }
  }, [
    runShortCuts,
    setRunActions,
    currentSidebarConversationType,
    currentSidebarConversationId,
    runActions,
  ])
  return {
    createSearchWithAI,
    regenerateSearchWithAI,
    continueInSearchWithAI,
  }
}
export default useSearchWithAI
