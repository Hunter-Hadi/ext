import cloneDeep from 'lodash-es/cloneDeep'
import merge from 'lodash-es/merge'
import { useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { IChatConversation } from '@/background/src/chatConversations'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import {
  permissionCardToChatMessage,
  PermissionWrapperCardSceneType,
} from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import {
  IAIProviderModel,
  IAIResponseMessage,
  IChatMessage,
} from '@/features/chatgpt/types'
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

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [conversation, setConversation] = useRecoilState(
    ChatGPTConversationState,
  )
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const permissionCardMap = usePermissionCardMap()
  const {
    currentSidebarConversationType,
    currentSidebarConversationId,
    updateSidebarSettings,
  } = useSidebarSettings()
  const currentConversationIdRef = useRef(currentSidebarConversationId)
  useEffect(() => {
    currentConversationIdRef.current = currentSidebarConversationId
  }, [currentSidebarConversationId])
  const { AI_PROVIDER_MODEL_MAP, updateAIProviderModel } = useAIProviderModels()
  const createConversation = async (
    overwriteConversationType?: ISidebarConversationType,
  ): Promise<string> => {
    let conversationId: string = ''
    // 因为从外部打开sidebar的时候conversationId和type都是有延迟的，所以直接从localStorage拿
    const conversationType =
      overwriteConversationType || currentSidebarConversationType
    if (conversationType === 'Chat') {
      const chatCacheConversationId = (await getChromeExtensionLocalStorage())
        .sidebarSettings?.chat?.conversationId
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
      // 如果没有，那么就创建一个
      const appLocalStorage = await getChromeExtensionLocalStorage()
      // 获取当前AIProvider
      const currentAIProvider = appLocalStorage.sidebarSettings?.common
        ?.currentAIProvider as IAIProviderType
      // 获取当前AIProvider的model
      const currentModel =
        appLocalStorage.thirdProviderSettings?.[currentAIProvider]?.model || ''
      // 获取当前AIProvider的model的maxTokens
      const maxTokens =
        ((AI_PROVIDER_MODEL_MAP as any)?.[currentAIProvider] || []).find(
          (model: IAIProviderModel) => model?.value === currentModel,
        )?.maxTokens || 4096
      console.log('新版Conversation ', currentAIProvider, currentModel)
      // 看看有没有cache的Conversation
      const cacheChatConversationId =
        appLocalStorage.sidebarSettings?.cache?.chatConversationCache?.[
          currentAIProvider + currentModel
        ]
      if (cacheChatConversationId) {
        // 如果有，那么就直接用
        conversationId = cacheChatConversationId
        // 如果已经存在了，并且有AI消息，那么就不用创建了
        if (conversationId && (await clientGetConversation(conversationId))) {
          await updateSidebarSettings({
            chat: {
              conversationId,
            },
          })
          return conversationId
        }
      }
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Chat',
            title: 'Ask AI anything',
            meta: {
              maxTokens,
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
              AIProvider: 'USE_CHAT_GPT_PLUS',
              AIModel: 'gpt-3.5-turbo',
              maxTokens: PAGE_SUMMARY_MAX_TOKENS,
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
            meta: merge({
              AIProvider: 'USE_CHAT_GPT_PLUS',
              AIModel: 'gpt-3.5-turbo',
              maxTokens: 16384, // gpt-3.5-16k
            }),
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
    }
    return conversationId
  }

  const cleanConversation = async (saveConversationCache = false) => {
    console.log(
      '新版Conversation 清除conversation',
      currentSidebarConversationType,
      currentSidebarConversationId,
    )
    // 让用户在切换回对应model的时候保留聊天记录
    if (
      currentSidebarConversationType === 'Chat' &&
      currentSidebarConversationId
    ) {
      // 拿到当前conversation的AIProvider和AIModel
      const waitRemoveConversation = await clientGetConversation(
        currentSidebarConversationId,
      )
      const waitRemoveConversationAIProvider =
        waitRemoveConversation?.meta?.AIProvider
      const waitRemoveConversationAIModel =
        waitRemoveConversation?.meta?.AIModel
      // 基于当前AIProvider和AIModel，更新cache
      if (waitRemoveConversationAIProvider && waitRemoveConversationAIModel) {
        if (saveConversationCache) {
          await updateSidebarSettings({
            cache: {
              chatConversationCache: {
                [waitRemoveConversationAIProvider +
                waitRemoveConversationAIModel]: currentSidebarConversationId,
              },
            },
          })
        } else {
          await updateSidebarSettings({
            cache: {
              chatConversationCache: {
                [waitRemoveConversationAIProvider +
                waitRemoveConversationAIModel]: '',
              },
            },
          })
        }
      }
    }
    await port.postMessage({
      event: 'Client_removeChatGPTConversation',
      data: {
        conversationId: currentSidebarConversationId,
      },
    })
    if (currentSidebarConversationType === 'Chat') {
      await updateSidebarSettings({
        chat: {
          conversationId: '',
        },
      })
    } else if (currentSidebarConversationType === 'Summary') {
      // 清除pageSummary的conversationId
      await updateSidebarSettings({
        summary: {
          conversationId: '',
        },
      })
    } else if (currentSidebarConversationType === 'Search') {
      // 清除search的conversationId
      await updateSidebarSettings({
        search: {
          conversationId: '',
        },
      })
    }
    updateConversationMap((prev) => {
      const newConversationMap = cloneDeep(prev)
      delete newConversationMap[currentSidebarConversationId || '']
      return newConversationMap
    })
    setConversation({
      model: '',
      writingMessage: null,
      loading: false,
    })
  }
  const switchBackgroundChatSystemAIProvider = async (
    provider: IAIProviderType,
    model?: string,
  ) => {
    const result = await port.postMessage({
      event: 'Client_switchAIProvider',
      data: {
        provider,
      },
    })
    if (result.success && model) {
      await updateAIProviderModel(model)
    }
    return result.success
  }
  const switchConversation = async (conversationId: string) => {
    if (conversationId && currentSidebarConversationId !== conversationId) {
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
      conversationId || currentSidebarConversationId || '',
      conversation,
    )
  }
  const pushMessage = async (
    newMessage: IChatMessage,
    conversationId?: string,
  ) => {
    if (conversationId || currentSidebarConversationId) {
      await clientChatConversationModifyChatMessages(
        'add',
        conversationId || currentSidebarConversationId || '',
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
    if (conversationId || currentSidebarConversationId) {
      await clientChatConversationModifyChatMessages(
        'delete',
        conversationId || currentSidebarConversationId || '',
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
    pricingHookSceneType: PermissionWrapperCardSceneType,
  ) => {
    if (currentConversationIdRef.current) {
      await clientChatConversationModifyChatMessages(
        'add',
        currentConversationIdRef.current,
        0,
        [permissionCardToChatMessage(permissionCardMap[pricingHookSceneType])],
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
  return {
    conversation,
    cleanConversation,
    createConversation,
    switchConversation,
    updateConversation,
    switchBackgroundChatSystemAIProvider,
    currentSidebarConversationType,
    currentConversationId: currentConversationIdRef.current,
    showConversationLoading,
    hideConversationLoading,
    pushMessage,
    pushPricingHookMessage,
    deleteMessage,
    updateMessage,
    updateClientWritingMessage,
    updateClientConversationLastMessageId,
  }
}

type IClientConversationEngine = ReturnType<typeof useClientConversation>

export { IClientConversationEngine, useClientConversation }
