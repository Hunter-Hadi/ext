import { useEffect, useRef } from 'react'
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { PAYWALL_MODAL_VARIANT } from '@/features/abTester/constants'
import { getChromeExtensionUserABTest } from '@/features/abTester/utils'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { AuthState } from '@/features/auth/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import {
  ClientConversationStateFamily,
  PaginationConversationMessagesStateFamily,
} from '@/features/chatgpt/store'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import {
  IAIResponseMessage,
  IChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import { ClientWritingMessageStateFamily } from '@/features/sidebar/store'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'

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
    updateConversationId,
    createConversation,
    conversationStatus,
    updateConversationStatus,
    resetConversation,
  } = useChatPanelContext()
  const clientConversation = useRecoilValue(
    ClientConversationStateFamily(currentConversationId || ''),
  )
  const [clientWritingMessage, setClientWritingMessage] = useRecoilState(
    ClientWritingMessageStateFamily(currentConversationId || ''),
  )
  const [clientConversationMessages] = useRecoilState(
    PaginationConversationMessagesStateFamily(currentConversationId || ''),
  )
  const { isLogin } = useRecoilValue(AuthState)
  const currentSidebarConversationType = clientConversation?.type || 'Chat'
  const currentConversationIdRef = useRef(currentConversationId)
  const currentConversationTypeRef = useRef(clientConversation?.type)
  useEffect(() => {
    currentConversationIdRef.current = currentConversationId
  }, [currentConversationId])
  useEffect(() => {
    currentConversationTypeRef.current = clientConversation?.type
  }, [currentConversationTypeRef])
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
    conversation: Partial<IConversation>,
    conversationId: string,
    syncConversationToDB = false,
  ) => {
    await ClientConversationManager.addOrUpdateConversation(
      conversationId || currentConversationIdRef.current || '',
      conversation,
      {
        syncConversationToDB,
      },
    )
  }
  const pushMessage = async (
    newMessage: IChatMessage,
    conversationId?: string,
  ) => {
    if (
      (conversationId || currentConversationIdRef.current) &&
      newMessage.messageId
    ) {
      await ClientConversationMessageManager.addMessages(
        conversationId || currentConversationIdRef.current || '',
        [newMessage],
      )
    }
  }
  const updateMessage = async (
    message: IChatMessage,
    conversationId?: string,
  ) => {
    if (
      (conversationId || currentConversationIdRef.current) &&
      message.messageId
    ) {
      await ClientConversationMessageManager.updateMessage(
        conversationId || currentConversationIdRef.current || '',
        message,
      )
    }
  }
  const deleteMessage = async (
    messageIds: string[],
    conversationId?: string,
  ) => {
    if (
      (conversationId || currentConversationIdRef.current) &&
      messageIds.length > 0
    ) {
      await ClientConversationMessageManager.deleteMessages(
        conversationId || currentConversationIdRef.current || '',
        messageIds,
      )
    }
  }
  const showConversationLoading = useRecoilCallback(
    ({ set }) =>
      (
        conversationId: string | undefined = currentConversationIdRef.current,
      ) => {
        set(
          ClientWritingMessageStateFamily(conversationId || ''),
          (prevState) => {
            return {
              ...prevState,
              loading: true,
            }
          },
        )
      },
    [],
  )
  const hideConversationLoading = useRecoilCallback(
    ({ set }) =>
      (
        conversationId: string | undefined = currentConversationIdRef.current,
      ) => {
        set(
          ClientWritingMessageStateFamily(conversationId || ''),
          (prevState) => {
            return {
              ...prevState,
              loading: false,
            }
          },
        )
      },
    [],
  )
  const pushPricingHookMessage = async (
    permissionSceneType: PermissionWrapperCardSceneType,
  ) => {
    const addToConversationId = currentConversationIdRef.current
    if (currentSidebarConversationType !== 'ContextMenu') {
      // 非context menu下应该show sidebar，防止sidebar被关闭
      showChatBox()
    }
    if (addToConversationId) {
      // 判断是否是paywall test version
      const { paywallVariant } = await getChromeExtensionUserABTest()
      if (paywallVariant === PAYWALL_MODAL_VARIANT && isLogin) {
        window.postMessage({
          event: 'MAX_AI_PRICING_MODAL',
          type: 'show',
          data: {
            conversationId: addToConversationId,
            permissionSceneType,
          },
        })
      }
      await ClientConversationMessageManager.addMessages(addToConversationId, [
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
      ])
    }
  }
  /**
   * 更新当前conversation的writingMessage
   * @param message
   */
  const updateClientWritingMessage = (
    message:
      | IAIResponseMessage
      | null
      | ((prevMessage: IChatMessage | null) => IChatMessage | null),
  ) => {
    console.log(`MemoizedMarkdown8 updateClientWritingMessage`, message)
    setClientWritingMessage((prevState) => {
      const newMessage =
        typeof message === 'function'
          ? message(prevState.writingMessage)
          : message
      return {
        ...prevState,
        writingMessage: newMessage,
      }
    })
  }
  /**
   * 更新当前conversation的loading
   * @param loading
   */
  const updateClientConversationLoading = useRecoilCallback(
    ({ set }) =>
      (
        loading: boolean,
        conversationId: string | undefined = currentConversationIdRef.current,
      ) => {
        set(
          ClientWritingMessageStateFamily(conversationId || ''),
          (prevState) => {
            return {
              ...prevState,
              loading,
            }
          },
        )
      },
    [],
  )

  /**
   * 获取当前conversation
   */
  const getCurrentConversation = async (
    conversationId = currentConversationIdRef.current,
  ) => {
    if (conversationId) {
      return (
        (await ClientConversationManager.getConversationById(conversationId)) ||
        null
      )
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
    updateConversationId,
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
    getConversation: ClientConversationManager.getConversationById,
    getCurrentConversation,
  }
}

type IClientConversationEngine = ReturnType<typeof useClientConversation>

export { IClientConversationEngine, useClientConversation }
