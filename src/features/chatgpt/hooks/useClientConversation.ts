import { useEffect, useMemo, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import {
  clientChatConversationModifyChatMessages,
  clientUpdateChatConversation,
} from '@/features/chatgpt/utils/clientChatConversation'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import { ClientWritingMessageStateFamily } from '@/features/sidebar/store'
import { ISidebarConversationType } from '@/features/sidebar/types'

export const SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG: {
  [key in ISidebarConversationType]: {
    AIProvider: IAIProviderType
    AIModel: string
    maxTokens: number
    hidden?: boolean
  }
} = {
  Chat: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 16384,
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
  Memo: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 4096,
    hidden: true,
  },
  FAQ: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 16384,
    hidden: true,
  },
  ContextMenu: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 16384,
    hidden: true,
  },
}

const useClientConversation = () => {
  const {
    conversationId: currentConversationId,
    createConversation,
    conversationStatus,
    updateConversationStatus,
    resetConversation,
  } = useChatPanelContext()
  const clientConversationMap = useRecoilValue(ClientConversationMapState)
  const clientConversation: IChatConversation | undefined =
    currentConversationId
      ? clientConversationMap[currentConversationId]
      : undefined
  const [clientWritingMessage, setClientWritingMessage] = useRecoilState(
    ClientWritingMessageStateFamily(currentConversationId || ''),
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

  const clientConversationMessages = useMemo(() => {
    if (currentConversationId) {
      return clientConversationMap[currentConversationId]?.messages || []
    }
    return []
  }, [currentConversationId, clientConversationMap])
  const disposeBackgroundChatSystem = async (conversationId?: string) => {
    const port = new ContentScriptConnectionV2()
    // 复原background conversation
    const result = await port.postMessage({
      event: 'Client_disposeChatSystem',
      data: {
        conversationId: conversationId || currentConversationId,
      },
    })
    return result.success
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
   * 更新当前conversation的loading
   * @param loading
   */
  const updateClientConversationLoading = (loading: boolean) => {
    setClientWritingMessage((prevState) => {
      return {
        ...prevState,
        loading,
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

  const authAIProvider = async () => {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_AuthAIProvider',
      data: {
        conversationId: currentConversationId,
      },
    })
    return result.success
  }

  return {
    conversationStatus,
    updateConversationStatus,
    clientConversationMessages,
    authAIProvider,
    clientWritingMessage,
    resetConversation,
    createConversation,
    disposeBackgroundChatSystem,
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
    updateClientConversationLoading,
    getConversation: clientGetConversation,
    getCurrentConversation,
  }
}

type IClientConversationEngine = ReturnType<typeof useClientConversation>

export { IClientConversationEngine, useClientConversation }
