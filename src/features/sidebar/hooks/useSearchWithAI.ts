import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { IAIProviderType } from '@/background/provider/chat'
import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { generateSearchWithAIActions } from '@/features/sidebar/utils/searchWithAIHelper'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'

const useSearchWithAI = () => {
  const { currentSidebarConversationType, updateSidebarConversationType } =
    useSidebarSettings()
  const {
    currentConversationId,
    updateClientConversationLoading,
    clientConversationMessages,
    clientConversation,
  } = useClientConversation()
  const { isPayingUser } = useUserInfo()
  const { askAIWIthShortcuts } = useClientChat()
  const { createConversation, pushPricingHookMessage, getConversation } =
    useClientConversation()
  const isFetchingRef = useRef(false)
  const lastMessageIdRef = useRef('')
  const [waitRunActions, setWaitRunActions] = useState<ISetActionsType>([])

  const memoPrevQuestions = useMemo(() => {
    const memoQuestions = []
    // 从后往前，直到include_history为false
    for (let i = clientConversationMessages.length - 1; i >= 0; i--) {
      const message = clientConversationMessages[i] as IAIResponseMessage
      // search里chat的时候只会带有originalMessage的ai message
      // 其他消息，比如use prompt的时候不应该携带进来
      if (message?.originalMessage) {
        memoQuestions.unshift(
          message?.originalMessage?.metadata?.title?.title ||
            message.text ||
            '',
        )
      }
      if (message.type === 'ai') {
        if (message?.originalMessage?.metadata?.includeHistory === false) {
          break
        }
      }
    }
    return memoQuestions
  }, [clientConversationMessages])

  const createSearchWithAI = async (
    query: string,
    includeHistory: boolean,
    runActionsImmediately: boolean = false,
  ) => {
    if (isFetchingRef.current) {
      return
    }
    if (query.trim() === '') {
      return
    }
    if (!isShowChatBox()) {
      showChatBox()
    }
    if (currentSidebarConversationType !== 'Search') {
      updateSidebarConversationType('Search')
    }
    // 进入loading
    updateClientConversationLoading(true)
    if (
      currentConversationId &&
      (await getConversation(currentConversationId))
    ) {
      // conversation存在
    } else {
      console.log('新版Conversation 创建searchWithAI')
      // conversation不存在
      await createConversation('Search')
    }
    try {
      console.log('新版Conversation search with AI 开始创建')
      // 如果是免费用户
      if (!isPayingUser) {
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
          authEmitPricingHooksLog('show', 'SIDEBAR_SEARCH_WITH_AI', {
            conversationId: currentConversationId,
            paywallType: 'RESPONSE',
          })
          updateClientConversationLoading(false)
          return
        }
      }
      const { messageId, actions } = await generateSearchWithAIActions(
        query,
        memoPrevQuestions,
        includeHistory,
      )
      lastMessageIdRef.current = messageId
      if (runActionsImmediately) {
        runSearchActions(actions)
      } else {
        setWaitRunActions(actions)
      }
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
  const continueInSearchWithAI = async (
    startMessage: IAIResponseMessage,
    aiProvider: IAIProviderType,
    aiModel: string,
  ) => {
    if (!isShowChatBox()) {
      showChatBox()
    }
    if (currentSidebarConversationType !== 'Search') {
      await updateSidebarConversationType('Search')
    }
    let cacheConversationId = await getSearchWithAIConversationId()
    let conversation: IConversation | null = null
    if (cacheConversationId) {
      conversation = await ClientConversationManager.getConversationById(
        cacheConversationId,
      )
    }
    if (
      conversation &&
      conversation.meta.AIProvider === aiProvider &&
      conversation.meta.AIModel === aiModel
    ) {
      // do nothing
    } else {
      cacheConversationId = await createConversation(
        'Search',
        aiProvider,
        aiModel,
      )
    }
    await ClientConversationMessageManager.addMessages(cacheConversationId, [
      startMessage,
    ])
  }

  const regenerateSearchWithAI = async (
    runActionsImmediately: boolean = false,
  ) => {
    try {
      if (currentConversationId) {
        const lastAIResponse: IAIResponseMessage | null =
          (await ClientConversationMessageManager.getMessageByMessageType(
            currentConversationId,
            'ai',
            'latest',
          )) as IAIResponseMessage
        const needDeleteMessageIds = lastAIResponse?.messageId
          ? [lastAIResponse.messageId]
          : []
        // const needDeleteMessageIds =
        //   await ClientConversationMessageManager.getDeleteMessageIds(
        //     currentConversationId,
        //     lastAIResponse.messageId,
        //     'latest',
        //   )
        const lastQuestion =
          lastAIResponse?.originalMessage?.metadata?.title?.title ||
          lastAIResponse?.text ||
          ''
        if (lastQuestion) {
          await ClientConversationMessageManager.deleteMessages(
            currentConversationId,
            needDeleteMessageIds,
          )
          setTimeout(async () => {
            await createSearchWithAIRef.current(
              lastQuestion,
              lastAIResponse?.originalMessage?.metadata?.includeHistory ||
                false,
              runActionsImmediately,
            )
          }, 200)
        } else {
          // 如果没有找到last question，那么就重新生成Conversation
          // 删除全部消息
          await ClientConversationMessageManager.deleteMessages(
            currentConversationId,
            await ClientConversationMessageManager.getMessageIds(
              currentConversationId,
            ),
          )
        }
      }
    } catch (e) {
      console.log('重新生成Conversation失败', e)
    }
  }

  const runSearchActions = useCallback(
    async (searchActions: ISetActionsType) => {
      if (
        searchActions.length > 0 &&
        !isFetchingRef.current &&
        clientConversation?.type === 'Search'
      ) {
        isFetchingRef.current = true
        try {
          await askAIWIthShortcuts(searchActions)
        } catch (err) {
          console.error(err)
        } finally {
          isFetchingRef.current = false
        }
      }
    },
    [askAIWIthShortcuts, clientConversation],
  )

  useEffect(() => {
    // 等到了Search板块再开始请求
    if (
      waitRunActions.length > 0 &&
      !isFetchingRef.current &&
      clientConversation?.type === 'Search'
    ) {
      runSearchActions(waitRunActions).finally(() => {
        setWaitRunActions([])
      })
    }
  }, [askAIWIthShortcuts, clientConversation, waitRunActions])

  return {
    createSearchWithAIRef,
    createSearchWithAI,
    regenerateSearchWithAI,
    continueInSearchWithAI,
  }
}
export default useSearchWithAI
