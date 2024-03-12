import { useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_DEFAULT_AI_PROVIDER_CONFIG } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import {
  clientChatConversationModifyChatMessages,
  clientUpdateChatConversation,
} from '@/features/chatgpt/utils/clientChatConversation'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import { ClientWritingMessageState } from '@/features/sidebar/store'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'
import { getInputMediator } from '@/store/InputMediator'

export const SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG: {
  [key in ISidebarConversationType]: {
    AIProvider: IAIProviderType
    AIModel: string
    maxTokens: number
  }
} = {
  Chat: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 4096,
  },
  Summary: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: PAGE_SUMMARY_MAX_TOKENS,
  },
  Search: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 16384,
  },
  Art: {
    AIProvider: 'MAXAI_DALLE',
    AIModel: 'dall-e-3',
    maxTokens: 16384,
  },
}

const useClientConversation = () => {
  const { conversationId: currentConversationId, createConversation } =
    useChatPanelContext()
  const clientConversationMap = useRecoilValue(ClientConversationMapState)
  const clientConversation: IChatConversation | undefined =
    currentConversationId
      ? clientConversationMap[currentConversationId]
      : undefined
  const [clientWritingMessage, setClientWritingMessage] = useRecoilState(
    ClientWritingMessageState,
  )
  const currentSidebarConversationType = clientConversation?.type || 'Chat'
  const currentConversationIdRef = useRef(currentConversationId)
  const currentConversationTypeRef = useRef(clientConversation?.type)
  useEffect(() => {
    currentConversationIdRef.current = currentConversationId
  }, [currentConversationId])
  useEffect(() => {
    currentConversationTypeRef.current = clientConversation?.type
  }, [currentConversationTypeRef])

  const cleanConversation = async () => {
    if (clientWritingMessage.loading) {
      return
    }
    getInputMediator('floatingMenuInputMediator').updateInputValue('')
    getInputMediator('chatBoxInputMediator').updateInputValue('')
    console.log(
      '新版Conversation 清除conversation',
      currentConversationTypeRef.current,
      currentConversationIdRef.current,
    )
    const currentConversation = currentConversationIdRef.current
      ? await clientGetConversation(currentConversationIdRef.current)
      : undefined
    if (currentConversation?.type === 'Chat') {
      if (currentConversation?.messages.length === 0) {
        // 如果已经是空的了，那么就不用清除了
        return
      }
    } else if (currentConversation?.type === 'Summary') {
      await clientChatConversationModifyChatMessages(
        'delete',
        getPageSummaryConversationId(),
        99999999,
        [],
      )
    } else if (currentConversation?.type === 'Search') {
      if (currentConversation?.messages.length === 0) {
        // 如果已经是空的了，那么就不用清除了
        return
      }
    } else if (currentConversation?.type === 'Art') {
      if (currentConversation?.messages.length === 0) {
        // 如果已经是空的了，那么就不用清除了
        return
      }
    }
    await createConversation(
      currentConversation?.type || 'Chat',
      currentConversation?.meta.AIProvider ||
        MAXAI_DEFAULT_AI_PROVIDER_CONFIG.Chat.AIProvider,
      currentConversation?.meta.AIProvider ||
        MAXAI_DEFAULT_AI_PROVIDER_CONFIG.Chat.AIModel,
    )
    setClientWritingMessage({
      writingMessage: null,
      loading: false,
    })
  }
  const switchConversation = async (conversationId: string) => {
    if (conversationId && currentConversationIdRef.current !== conversationId) {
      const port = new ContentScriptConnectionV2()
      // 复原background conversation
      const result = await port.postMessage({
        event: 'Client_changeConversation',
        data: {
          conversationId: conversationId,
        },
      })
      return result.success
    }
    return true
  }
  const updateConversation = async (
    conversation: Partial<IChatConversation>,
    conversationId: string,
    syncConversationToDB = false,
  ) => {
    await clientUpdateChatConversation(
      conversationId || currentConversationIdRef.current || '',
      conversation,
      syncConversationToDB,
    )
  }
  const pushMessage = async (
    newMessage: IChatMessage,
    conversationId?: string,
  ) => {
    if (conversationId || currentConversationIdRef.current) {
      await clientChatConversationModifyChatMessages(
        'add',
        conversationId || currentConversationIdRef.current || '',
        0,
        [newMessage],
      )
    }
  }
  const updateMessage = async (
    message: IChatMessage,
    conversationId?: string,
  ) => {
    if (conversationId && message.messageId) {
      await clientChatConversationModifyChatMessages(
        'update',
        conversationId,
        0,
        [message],
      )
    }
  }
  const deleteMessage = async (count: number, conversationId?: string) => {
    if (conversationId || currentConversationIdRef.current) {
      await clientChatConversationModifyChatMessages(
        'delete',
        conversationId || currentConversationIdRef.current || '',
        count,
        [],
      )
    }
  }
  const showConversationLoading = () => {
    setClientWritingMessage((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    })
  }
  const hideConversationLoading = () => {
    setClientWritingMessage((prevState) => {
      return {
        ...prevState,
        loading: false,
      }
    })
  }
  const pushPricingHookMessage = async (
    permissionSceneType: PermissionWrapperCardSceneType,
  ) => {
    if (currentConversationIdRef.current) {
      await clientChatConversationModifyChatMessages(
        'add',
        currentConversationIdRef.current,
        0,
        [
          {
            type: 'system',
            text: 'Upgrade to Pro',
            messageId: uuidV4(),
            parentMessageId: '',
            meta: {
              systemMessageType: 'needUpgrade',
              permissionSceneType: permissionSceneType,
            },
          },
        ],
      )
    }
  }
  /**
   * 更新当前conversation的writingMessage
   * @param message
   */
  const updateClientWritingMessage = (message: IAIResponseMessage | null) => {
    setClientWritingMessage((prevState) => {
      return {
        ...prevState,
        writingMessage: message,
      }
    })
  }
  /**
   * 获取当前conversation
   */
  const getCurrentConversation = async () => {
    const conversationId = currentConversationIdRef.current
    if (conversationId) {
      return (await clientGetConversation(conversationId)) || null
    }
    return null
  }
  return {
    clientWritingMessage,
    cleanConversation,
    createConversation,
    switchConversation,
    updateConversation,
    currentConversationId,
    clientConversation,
    currentConversationIdRef,
    currentSidebarConversationType,
    currentConversationTypeRef,
    showConversationLoading,
    hideConversationLoading,
    pushMessage,
    pushPricingHookMessage,
    deleteMessage,
    updateMessage,
    updateClientWritingMessage,
    getConversation: clientGetConversation,
    getCurrentConversation,
  }
}

type IClientConversationEngine = ReturnType<typeof useClientConversation>

export { IClientConversationEngine, useClientConversation }
