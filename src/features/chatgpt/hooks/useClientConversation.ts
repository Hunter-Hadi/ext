import { useRecoilState, useRecoilValue } from 'recoil'
import {
  ChatGPTConversationState,
  SidebarConversationIdSelector,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { IChatConversation } from '@/background/src/chatConversations'
import {
  generatePageSummaryData,
  getPageSummaryConversationId,
} from '@/features/sidebar/utils/pageSummaryHelper'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
  const [sidebarSettings, updateSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const { currentAIProviderModelDetail } = useAIProviderModels()
  const sidebarConversationId = useRecoilValue(SidebarConversationIdSelector)
  const createConversation = async () => {
    let conversationId = ''
    if (sidebarSettings.type === 'Chat') {
      if (sidebarConversationId) {
        return sidebarConversationId
      }
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Chat',
            meta: {
              maxTokens: currentAIProviderModelDetail?.maxTokens || 4096,
            },
          } as Partial<IChatConversation>,
        },
      })
      if (result.success && result.data.conversationId) {
        conversationId = result.data.conversationId
        setChromeExtensionSettings({
          conversationId: result.data.conversationId,
        })
        setAppSettings((prev) => {
          return {
            ...prev,
            conversationId: result.data.conversationId,
          }
        })
      }
    } else if (sidebarSettings.type === 'Summary') {
      const pageSummaryData = await generatePageSummaryData(12000)
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id: getPageSummaryConversationId(),
            type: 'Summary',
            meta: {
              AIProvider: 'USE_CHAT_GPT_PLUS',
              AIModel: 'gpt-3.5-turbo',
              systemPrompt:
                'The following text delimited by triple backticks is the context:\n' +
                '```\n' +
                `${pageSummaryData.pageSummaryContent}\n` +
                '```',
              maxTokens: 16384, // gpt-3.5-16k
              pageSummaryId: pageSummaryData.pageSummaryId,
              pageSummaryType: pageSummaryData.pageSummaryType,
            },
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
    const cache = await clientGetLiteChromeExtensionSettings()
    port
      .postMessage({
        event: 'Client_removeChatGPTConversation',
        data: {
          conversationId: cache.conversationId,
        },
      })
      .then()
      .catch()
    if (sidebarSettings.type === 'Chat') {
      setAppSettings((prevState) => {
        return {
          ...prevState,
          conversationId: '',
        }
      })
      // 清空本地储存的conversationId
      await setChromeExtensionSettings({
        conversationId: '',
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
    setConversation({
      model: appSettings.currentModel || '',
      writingMessage: null,
      loading: false,
    })
  }
  return {
    cleanConversation,
    createConversation,
  }
}
export { useClientConversation }
