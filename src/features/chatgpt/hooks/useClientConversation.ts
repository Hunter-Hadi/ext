import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  ISidebarConversationType,
} from '@/features/sidebar/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IChatConversation } from '@/background/src/chatConversations'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'
import { IAIProviderType } from '@/background/provider/chat'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { clientChatConversationUpdate } from '@/features/chatgpt/utils/clientChatConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import cloneDeep from 'lodash-es/cloneDeep'
import merge from 'lodash-es/merge'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getAIProviderConversationMetaConfig } from '@/features/chatgpt/utils/getAIProviderConversationMetaConfig'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { IAIProviderModel } from '@/features/chatgpt/types'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const {
    currentSidebarConversationType,
    currentSidebarConversationId,
    updateSidebarSettings,
  } = useSidebarSettings()
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
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Chat',
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
      // 如果没有，那么就创建一个
      await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id: conversationId,
            type: 'Summary',
            meta: merge({
              AIProvider: 'USE_CHAT_GPT_PLUS',
              AIModel: 'gpt-3.5-turbo',
              maxTokens: 16384, // gpt-3.5-16k
              pageSummaryType: getPageSummaryType(),
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
        // 如果已经存在了，并且有AI消息，那么就不用创建了
        return searchCacheConversationId
      }
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Search',
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

  const cleanConversation = async () => {
    console.log(
      '新版Conversation 清除conversation',
      currentSidebarConversationType,
      currentSidebarConversationId,
    )
    port
      .postMessage({
        event: 'Client_removeChatGPTConversation',
        data: {
          conversationId: currentSidebarConversationId,
        },
      })
      .then()
      .catch()
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
  const changeConversation = async (conversationId: string) => {
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
  return {
    cleanConversation,
    createConversation,
    changeConversation,
    updateConversation,
    switchBackgroundChatSystemAIProvider,
  }
}
export { useClientConversation }
