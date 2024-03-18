import merge from 'lodash-es/merge'
import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { IAIProviderType } from '@/background/provider/chat'
import { openAIAPISystemPromptGenerator } from '@/background/src/chat/OpenAIApiChat/types'
import { MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import {
  IChatConversation,
  IChatConversationMeta,
} from '@/background/src/chatConversations'
import {
  getChromeExtensionLocalStorage,
  MAXAI_DEFAULT_AI_PROVIDER_CONFIG,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import {
  clientChatConversationModifyChatMessages,
  clientUpdateChatConversation,
} from '@/features/chatgpt/utils/clientChatConversation'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ClientWritingMessageState } from '@/features/sidebar/store'
import { ISidebarConversationType } from '@/features/sidebar/types'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
  IPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'
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

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [clientWritingMessage, setClientWritingMessage] = useRecoilState(
    ClientWritingMessageState,
  )
  const { getAIProviderModelDetail } = useAIProviderModelsMap()
  const {
    currentSidebarConversationType,
    currentSidebarConversationId,
    updateSidebarSettings,
    sidebarSettings,
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
      let currentAIProvider = appLocalStorage.sidebarSettings?.common
        ?.currentAIProvider as IAIProviderType
      // 如果是MAXAI_DALLE，那么就用默认的AIProvider
      if (currentAIProvider === 'MAXAI_DALLE') {
        currentAIProvider = MAXAI_DEFAULT_AI_PROVIDER_CONFIG.AIProvider
      }
      // 获取当前AIProvider的model
      const currentModel =
        appLocalStorage.thirdProviderSettings?.[currentAIProvider]?.model || ''
      // 获取当前AIProvider的model的maxTokens
      console.log('新版Conversation ', currentAIProvider, currentModel)
      const baseMetaConfig: Partial<IChatConversationMeta> = {
        AIProvider: currentAIProvider,
        AIModel: currentModel,
        maxTokens:
          getAIProviderModelDetail(currentAIProvider, currentModel)
            ?.maxTokens || 4096,
      }
      // 如果是OPENAI_API，那么就加上systemPrompt
      if (currentAIProvider === 'OPENAI_API') {
        baseMetaConfig.systemPrompt =
          openAIAPISystemPromptGenerator(currentModel)
      }
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Chat',
            title: 'Ask AI anything',
            meta: baseMetaConfig,
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
        PAGE_SUMMARY: 'Summarize & ask on page',
        DEFAULT_EMAIL_SUMMARY: 'Summarize & ask on email',
        PDF_CRX_SUMMARY: 'Summarize & ask on PDF',
        YOUTUBE_VIDEO_SUMMARY: 'Summarize & ask on video',
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
    if (clientWritingMessage.loading) {
      return
    }
    console.log(
      '新版Conversation 清除conversation',
      currentSidebarConversationType,
      currentConversationIdRef.current,
    )
    getInputMediator('floatingMenuInputMediator').updateInputValue('')
    getInputMediator('chatBoxInputMediator').updateInputValue('')
    if (currentSidebarConversationType === 'Chat') {
      if (sidebarSettings?.chat?.conversationId) {
        if (
          (await clientGetConversation(sidebarSettings?.chat?.conversationId))
            ?.messages.length === 0
        ) {
          // 如果已经是空的了，那么就不用清除了
          return
        }
      }
      await updateSidebarSettings({
        chat: {
          conversationId: await createConversation('Chat'),
        },
      })
    } else if (currentSidebarConversationType === 'Summary') {
      await clientChatConversationModifyChatMessages(
        'delete',
        getPageSummaryConversationId(),
        99999999,
        [],
      )
      // 清除pageSummary的conversationId
      await updateSidebarSettings({
        summary: {
          conversationId: '',
        },
      })
    } else if (currentSidebarConversationType === 'Search') {
      if (sidebarSettings?.search?.conversationId) {
        if (
          (await clientGetConversation(sidebarSettings?.search?.conversationId))
            ?.messages.length === 0
        ) {
          // 如果已经是空的了，那么就不用清除了
          return
        }
      }
      // 清除search的conversationId
      await updateSidebarSettings({
        search: {
          conversationId: await createConversation('Search'),
        },
      })
    } else if (currentSidebarConversationType === 'Art') {
      if (sidebarSettings?.art?.conversationId) {
        if (
          (await clientGetConversation(sidebarSettings?.art?.conversationId))
            ?.messages.length === 0
        ) {
          // 如果已经是空的了，那么就不用清除了
          return
        }
      }
      // 清除search的conversationId
      await updateSidebarSettings({
        art: {
          conversationId: await createConversation('Art'),
        },
      })
    }
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
    getConversation: clientGetConversation,
    getCurrentConversation,
  }
}

type IClientConversationEngine = ReturnType<typeof useClientConversation>

export { IClientConversationEngine, useClientConversation }
