import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  SidebarConversationIdSelector,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IChatConversation } from '@/background/src/chatConversations'
import {
  generatePageSummaryData,
  getPageSummaryConversationId,
} from '@/features/sidebar/utils/pageSummaryHelper'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { IAIProviderType } from '@/background/provider/chat'
import { getAIProviderConversationMetaConfig } from '@/features/chatgpt/types/getAIProviderConversationMetaConfig'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { clientChatConversationUpdate } from '@/features/chatgpt/utils/clientChatConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import cloneDeep from 'lodash-es/cloneDeep'
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useClientConversation = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const [sidebarSettings, updateSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const { currentAIProviderDetail, currentAIProviderModelDetail } =
    useAIProviderModels()
  const sidebarConversationId = useRecoilValue(SidebarConversationIdSelector)
  const createConversation = async () => {
    let conversationId = ''
    if (sidebarSettings.type === 'Chat') {
      if (sidebarConversationId) {
        // 确保conversation存在
        if (await clientGetConversation(sidebarConversationId)) {
          return sidebarConversationId
        }
      }
      const id = md5TextEncrypt(
        (currentAIProviderDetail?.value || '') +
          (currentAIProviderModelDetail?.value || ''),
      )
      console.log(
        '新版Conversation 生成chat conversation id',
        id,
        currentAIProviderDetail?.value,
        currentAIProviderModelDetail?.value,
      )
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id,
            type: 'Chat',
            meta: {
              maxTokens: currentAIProviderModelDetail?.maxTokens || 4096,
              ...(await getAIProviderConversationMetaConfig(
                currentAIProviderDetail?.value,
              )),
            },
          } as Partial<IChatConversation>,
        },
      })
      if (result.success && result.data.conversationId) {
        conversationId = result.data.conversationId
        await setChromeExtensionSettings({
          chatTypeConversationId: result.data.conversationId,
        })
        setAppSettings((prev) => {
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
          return sidebarConversationId
        }
      }
      const pageSummaryData = await generatePageSummaryData()
      console.log('usePageUrlChange', pageSummaryData)
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            id: getPageSummaryConversationId(),
            type: 'Summary',
            meta: {
              AIProvider: 'USE_CHAT_GPT_PLUS',
              AIModel: 'gpt-3.5-turbo',
              systemPrompt: `The following text delimited by triple backticks is the context text:
\`\`\`
${pageSummaryData.pageSummaryContent}
\`\`\``,
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
      setAppSettings((prevState) => {
        return {
          ...prevState,
          chatTypeConversationId: '',
        }
      })
      // 清空本地储存的conversationId
      await setChromeExtensionSettings({
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
      model: appSettings.currentModel || '',
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