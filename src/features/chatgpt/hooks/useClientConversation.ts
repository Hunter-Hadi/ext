import merge from 'lodash-es/merge'
import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { IAIProviderType } from '@/background/provider/chat'
import { IChatConversation } from '@/background/src/chatConversations'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import {
  clientChatConversationModifyChatMessages,
  clientChatConversationUpdate,
} from '@/features/chatgpt/utils/clientChatConversation'
import { getAIProviderConversationMetaConfig } from '@/features/chatgpt/utils/getAIProviderConversationMetaConfig'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import {
  ChatGPTConversationState,
  ISidebarConversationType,
} from '@/features/sidebar/store'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
  IPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'

export const SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG: {
  [key in ISidebarConversationType]: {
    AIProvider: IAIProviderType
    AIModel: string
    maxTokens: number
  }
} = {
  Chat: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: 'gpt-3.5-turbo',
    maxTokens: 4096,
  },
  Summary: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: 'gpt-3.5-turbo',
    maxTokens: PAGE_SUMMARY_MAX_TOKENS,
  },
  Search: {
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: 'gpt-3.5-turbo',
    maxTokens: 16384,
  },
  Art: {
    AIProvider: 'MAXAI_DALLE',
    AIModel: 'dall-e-3',
    maxTokens: 16384,
  },
}

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [conversation, setConversation] = useRecoilState(
    ChatGPTConversationState,
  )

  const { getAIProviderModelDetail } = useAIProviderModelsMap()
  const {
    currentSidebarConversationType,
    currentSidebarConversationId,
    updateSidebarSettings,
  } = useSidebarSettings()
  const currentConversationIdRef = useRef(currentSidebarConversationId)
  const currentConversationTypeRef = useRef(currentSidebarConversationType)
  useEffect(() => {
    currentConversationIdRef.current = currentSidebarConversationId
  }, [currentSidebarConversationId])
  useEffect(() => {
    currentConversationTypeRef.current = currentSidebarConversationType
  }, [currentConversationTypeRef])
  const createConversation = async (
    overwriteConversationType?: ISidebarConversationType,
  ): Promise<string> => {
    let conversationId: string = ''
    // 因为从外部打开sidebar的时候conversationId和type都是有延迟的，所以直接从localStorage拿
    const conversationType =
      overwriteConversationType || currentSidebarConversationType
    if (conversationType === 'Chat') {
      const appLocalStorage = await getChromeExtensionLocalStorage()
      // 获取当前AIProvider
      const currentAIProvider = appLocalStorage.sidebarSettings?.common
        ?.currentAIProvider as IAIProviderType
      // 获取当前AIProvider的model
      const currentModel =
        appLocalStorage.thirdProviderSettings?.[currentAIProvider]?.model || ''
      // 获取当前AIProvider的model的maxTokens
      console.log('新版Conversation ', currentAIProvider, currentModel)
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Chat',
            title: 'Ask AI anything',
            meta: {
              maxTokens:
                getAIProviderModelDetail(currentAIProvider, currentModel)
                  ?.maxTokens || 4096,
              ...(await getAIProviderConversationMetaConfig(currentAIProvider)),
            },
          } as Partial<IChatConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
        await updateSidebarSettings({
          chat: {
            conversationId,
          },
        })
      }
    } else if (conversationType === 'Summary') {
      conversationId = getPageSummaryConversationId()
      // 如果已经存在了，并且有AI消息，那么就不用创建了
      if (conversationId && (await clientGetConversation(conversationId))) {
        return conversationId
      }
      const conversationTitleMap: {
        [key in IPageSummaryType]: string
      } = {
        PAGE_SUMMARY: 'Page summary & chat',
        DEFAULT_EMAIL_SUMMARY: 'Email summary & chat',
        PDF_CRX_SUMMARY: 'PDF summary & chat',
        YOUTUBE_VIDEO_SUMMARY: 'Video summary & chat',
      }
      const pageSummaryType = getPageSummaryType()
      // 如果没有，那么就创建一个
      await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id: conversationId,
            type: 'Summary',
            title: conversationTitleMap[pageSummaryType],
            meta: merge({
              ...SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Summary,
              pageSummaryType,
              //               pageSummaryId: pageSummaryData.pageSummaryId,
              //               pageSummaryType: pageSummaryData.pageSummaryType,
              //               systemPrompt: `The following text delimited by triple backticks is the context text:
              // \`\`\`
              // ${pageSummaryData.pageSummaryContent}
              // \`\`\``,
            }),
          } as Partial<IChatConversation>,
        },
      })
      await updateSidebarSettings({
        summary: {
          conversationId,
        },
      })
    } else if (conversationType === 'Search') {
      const searchCacheConversationId = (await getChromeExtensionLocalStorage())
        .sidebarSettings?.search?.conversationId
      // 如果search板块已经有conversationId了
      if (
        searchCacheConversationId &&
        (await clientGetConversation(searchCacheConversationId))
      ) {
        console.log(
          '新版Conversation chatCacheConversationId',
          searchCacheConversationId,
        )
        // 如果已经存在了，并且有AI消息，那么就不用创建了
        return searchCacheConversationId
      }
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Search',
            title: 'AI-powered search',
            meta: merge(SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Search),
          } as Partial<IChatConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
        await updateSidebarSettings({
          search: {
            conversationId,
          },
        })
      }
    } else if (conversationType === 'Art') {
      const chatCacheConversationId = (await getChromeExtensionLocalStorage())
        .sidebarSettings?.art?.conversationId
      // 如果chat板块已经有conversationId了
      if (
        chatCacheConversationId &&
        (await clientGetConversation(chatCacheConversationId))
      ) {
        console.log(
          '新版Conversation chatCacheConversationId',
          chatCacheConversationId,
        )
        // 如果已经存在了，并且有AI消息，那么就不用创建了
        return chatCacheConversationId
      }
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Art',
            title: 'AI-powered image generate',
            meta: merge(SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Art),
          } as Partial<IChatConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
        await updateSidebarSettings({
          art: {
            conversationId,
          },
        })
      }
    }
    return conversationId
  }

  const cleanConversation = async () => {
    if (conversation.loading) {
      return
    }
    console.log(
      '新版Conversation 清除conversation',
      currentSidebarConversationType,
      currentConversationIdRef.current,
    )
    if (currentSidebarConversationType === 'Chat') {
      await updateSidebarSettings({
        chat: {
          conversationId: await createConversation('Chat'),
        },
      })
    } else if (currentSidebarConversationType === 'Summary') {
      // 清除pageSummary的conversationId
      await updateSidebarSettings({
        summary: {
          conversationId: await createConversation('Summary'),
        },
      })
    } else if (currentSidebarConversationType === 'Search') {
      // 清除search的conversationId
      await updateSidebarSettings({
        search: {
          conversationId: await createConversation('Search'),
        },
      })
    } else if (currentSidebarConversationType === 'Art') {
      // 清除search的conversationId
      await updateSidebarSettings({
        art: {
          conversationId: await createConversation('Art'),
        },
      })
    }
    setConversation({
      model: '',
      writingMessage: null,
      loading: false,
    })
  }
  const switchBackgroundChatSystemAIProvider = async (
    provider: IAIProviderType,
  ) => {
    const result = await port.postMessage({
      event: 'Client_switchAIProvider',
      data: {
        provider,
      },
    })
    return result.success
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
  ) => {
    await clientChatConversationUpdate(
      conversationId || currentConversationIdRef.current || '',
      conversation,
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
    setConversation((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    })
  }
  const hideConversationLoading = () => {
    setConversation((prevState) => {
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
    setConversation((prevState) => {
      return {
        ...prevState,
        writingMessage: message,
      }
    })
  }
  /**
   * 更新当前conversation的lastMessageId
   * @description - 用来stop和context menu的draft
   * @param messageId
   */
  const updateClientConversationLastMessageId = (messageId: string) => {
    setConversation((prevState) => {
      return {
        ...prevState,
        lastMessageId: messageId,
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
    conversation,
    cleanConversation,
    createConversation,
    switchConversation,
    updateConversation,
    switchBackgroundChatSystemAIProvider,
    currentSidebarConversationId,
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
    updateClientConversationLastMessageId,
    getConversation: clientGetConversation,
    getCurrentConversation,
  }
}

type IClientConversationEngine = ReturnType<typeof useClientConversation>

export { IClientConversationEngine, useClientConversation }
