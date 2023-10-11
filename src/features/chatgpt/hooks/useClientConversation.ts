import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  SidebarConversationIdSelector,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { AppLocalStorageState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IChatConversation } from '@/background/src/chatConversations'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { IAIProviderType } from '@/background/provider/chat'
import { getAIProviderConversationMetaConfig } from '@/features/chatgpt/utils/getAIProviderConversationMetaConfig'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { clientChatConversationUpdate } from '@/features/chatgpt/utils/clientChatConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import cloneDeep from 'lodash-es/cloneDeep'
import merge from 'lodash-es/merge'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [, setAppLocalStorage] = useRecoilState(AppLocalStorageState)
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const [sidebarSettings, updateSidebarSettings] = useRecoilState(
    SidebarSettingsState,
  )
  const {
    currentAIProviderDetail,
    currentAIProviderModelDetail,
  } = useAIProviderModels()
  const sidebarConversationId = useRecoilValue(SidebarConversationIdSelector)
  const createConversation = async () => {
    let currentSidebarConversationId = sidebarConversationId
    let currentAIProvider =
      currentAIProviderDetail?.value || 'USE_CHAT_GPT_PLUS'
    let currentAIProviderModel =
      currentAIProviderModelDetail?.value || 'gpt-3.5-turbo'
    let conversationId = ''
    if (sidebarSettings.type === 'Chat') {
      // NOTE: 之所以这么写是因为Shorcuts在运行之前拿到的ai provider和model是已经决定好的了,导致conversationID错误
      // ===开始
      // 之前导致的bug: 选择Bing，选择prompt，切换到chatgpt，聊天记录加到bing去了
      const appLocalStorage = await getChromeExtensionLocalStorage()
      if (
        appLocalStorage.currentAIProvider &&
        appLocalStorage.currentAIProvider !== currentAIProvider
      ) {
        currentAIProvider = appLocalStorage.currentAIProvider
        currentAIProviderModel =
          appLocalStorage.thirdProviderSettings?.[
            appLocalStorage.currentAIProvider
          ]?.model || currentAIProviderModel
        currentSidebarConversationId = md5TextEncrypt(
          currentAIProvider + currentAIProviderModel,
        )
      }
      // ===结束
      if (currentSidebarConversationId) {
        // 确保conversation存在
        if (await clientGetConversation(currentSidebarConversationId)) {
          return currentSidebarConversationId
        }
      }
      const id = md5TextEncrypt(currentAIProvider + currentAIProviderModel)
      console.log(
        '新版Conversation 生成chat conversation id',
        id,
        currentAIProvider,
        currentAIProviderModel,
      )
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id,
            type: 'Chat',
            meta: {
              maxTokens: currentAIProviderModelDetail?.maxTokens || 4096,
              ...(await getAIProviderConversationMetaConfig(currentAIProvider)),
            },
          } as Partial<IChatConversation>,
        },
      })
      if (result.success && result.data.conversationId) {
        conversationId = result.data.conversationId
        await setChromeExtensionLocalStorage({
          chatTypeConversationId: result.data.conversationId,
        })
        setAppLocalStorage((prev) => {
          return {
            ...prev,
            chatTypeConversationId: result.data.conversationId,
          }
        })
      }
    } else if (sidebarSettings.type === 'Summary') {
      if (getPageSummaryConversationId()) {
        // 确保conversation存在
        if (await clientGetConversation(getPageSummaryConversationId())) {
          return currentSidebarConversationId
        }
      }
      // const pageSummaryData = await generatePageSummaryData()
      // console.log('usePageUrlChange', pageSummaryData)
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id: getPageSummaryConversationId(),
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
      conversationId = result.data.conversationId
      updateSidebarSettings((prev) => {
        return {
          ...prev,
          summaryConversationId: result.data.conversationId,
        }
      })
    }
    return conversationId
  }

  const cleanConversation = async () => {
    console.log(
      '新版Conversation 清除conversation',
      sidebarSettings.type,
      sidebarConversationId,
    )
    port
      .postMessage({
        event: 'Client_removeChatGPTConversation',
        data: {
          conversationId: sidebarConversationId,
        },
      })
      .then()
      .catch()
    if (sidebarSettings.type === 'Chat') {
      setAppLocalStorage((prevState) => {
        return {
          ...prevState,
          chatTypeConversationId: '',
        }
      })
      // 清空本地储存的conversationId
      await setChromeExtensionLocalStorage({
        chatTypeConversationId: '',
      })
    } else {
      // 清除pageSummary的conversationId
      updateSidebarSettings((prevState) => {
        return {
          ...prevState,
          summaryConversationId: '',
        }
      })
    }
    updateConversationMap((prev) => {
      const newConversationMap = cloneDeep(prev)
      delete newConversationMap[sidebarConversationId]
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
  ) => {
    const result = await port.postMessage({
      event: 'Client_switchAIProvider',
      data: {
        provider,
      },
    })
    return result.success
  }
  const changeConversation = async (conversationId: string) => {
    if (conversationId) {
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
    return false
  }
  const updateConversation = async (
    conversation: Partial<IChatConversation>,
    conversationId: string,
  ) => {
    await clientChatConversationUpdate(
      conversationId || sidebarConversationId,
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
