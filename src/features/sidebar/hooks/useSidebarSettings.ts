import merge from 'lodash-es/merge'
import { useMemo, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { openAIAPISystemPromptGenerator } from '@/background/src/chat/OpenAIApiChat/types'
import {
  IChatConversation,
  IChatConversationMeta,
} from '@/background/src/chatConversations'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/type'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { IChatMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import {
  clientChatConversationModifyChatMessages,
  clientDuplicateChatConversation,
} from '@/features/chatgpt/utils/clientChatConversation'
import { useFloatingContextMenu } from '@/features/contextMenu'
import {
  ClientWritingMessageStateFamily,
  SidebarPageState,
  SidebarSummaryConversationIdState,
} from '@/features/sidebar/store'
import { ISidebarConversationType } from '@/features/sidebar/types'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
  IPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppLocalStorageState } from '@/store'
import { getInputMediator } from '@/store/InputMediator'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useSidebarSettings = () => {
  const [sidebarSummaryConversationId, setSidebarSummaryConversationId] =
    useRecoilState(SidebarSummaryConversationIdState)
  const [appLocalStorage, setAppLocalStorage] =
    useRecoilState(AppLocalStorageState)
  const clientConversationMap = useRecoilValue(ClientConversationMapState)
  const [sidebarPageState, setSidebarPageSate] =
    useRecoilState(SidebarPageState)
  const { getAIProviderModelDetail } = useAIProviderModelsMap()
  const { hideFloatingContextMenu } = useFloatingContextMenu()
  const isDuplicatingRef = useRef(false)
  const currentSidebarConversationType =
    sidebarPageState.sidebarConversationType
  const currentSidebarAIProvider =
    appLocalStorage.sidebarSettings?.common?.currentAIProvider
  const sidebarChatConversationId =
    appLocalStorage.sidebarSettings?.chat?.conversationId
  const currentSearchConversationId =
    appLocalStorage.sidebarSettings?.search?.conversationId
  const currentArtConversationId =
    appLocalStorage.sidebarSettings?.art?.conversationId
  // 当前sidebar conversation type对应的conversation id
  const currentSidebarConversationId = useMemo(() => {
    switch (currentSidebarConversationType) {
      case 'Chat':
        return sidebarChatConversationId
      case 'Search':
        return currentSearchConversationId
      case 'Summary':
        return sidebarSummaryConversationId
      case 'Art':
        return currentArtConversationId
      default:
        return ''
    }
  }, [
    currentSidebarConversationType,
    sidebarChatConversationId,
    currentSearchConversationId,
    sidebarSummaryConversationId,
    currentArtConversationId,
  ])
  const [clientWritingMessage, setClientWritingMessage] = useRecoilState(
    ClientWritingMessageStateFamily(currentSidebarConversationId || ''),
  )

  const sidebarConversationTypeofConversationMap = useMemo(() => {
    return {
      Chat: clientConversationMap[sidebarChatConversationId || ''],
      Search: clientConversationMap[currentSearchConversationId || ''],
      Summary: clientConversationMap[sidebarSummaryConversationId],
      Art: clientConversationMap[currentArtConversationId || ''],
    } as {
      [key in ISidebarConversationType]: IChatConversation | null
    }
  }, [
    clientConversationMap,
    sidebarChatConversationId,
    currentSearchConversationId,
    sidebarSummaryConversationId,
    currentArtConversationId,
  ])
  const sidebarConversationTypeMessageMap = useMemo(() => {
    return {
      Chat: sidebarConversationTypeofConversationMap.Chat?.messages || [],
      Search: sidebarConversationTypeofConversationMap.Search?.messages || [],
      Summary: sidebarConversationTypeofConversationMap.Summary?.messages || [],
      Art: sidebarConversationTypeofConversationMap.Art?.messages || [],
    } as {
      [key in ISidebarConversationType]: IChatMessage[]
    }
  }, [currentSidebarConversationId, sidebarConversationTypeofConversationMap])
  const currentSidebarConversation = useMemo(() => {
    return clientConversationMap[currentSidebarConversationId || ''] as
      | IChatConversation
      | undefined
  }, [currentSidebarConversationId, clientConversationMap])

  // 当前sidebar conversation type对应的messages
  const currentSidebarConversationMessages = useMemo(() => {
    return (
      sidebarConversationTypeMessageMap[currentSidebarConversationType] || []
    )
  }, [currentSidebarConversationType, sidebarConversationTypeMessageMap])
  const updateSidebarSettings = async (
    newSidebarSettings: IChromeExtensionLocalStorage['sidebarSettings'],
  ) => {
    await setChromeExtensionLocalStorage({
      sidebarSettings: newSidebarSettings,
    })
    const savedAppLocalStorage = await getChromeExtensionLocalStorage()
    setAppLocalStorage((prev) => {
      return {
        ...prev,
        sidebarSettings: savedAppLocalStorage.sidebarSettings,
      }
    })
  }
  const updateSidebarConversationType = (
    newSidebarConversationType: ISidebarConversationType,
  ) => {
    setSidebarPageSate((prev) => {
      return {
        ...prev,
        sidebarConversationType: newSidebarConversationType,
      }
    })
  }
  const resetSidebarConversation = async () => {
    if (clientWritingMessage.loading) {
      return
    }
    getInputMediator('floatingMenuInputMediator').updateInputValue('')
    getInputMediator('chatBoxInputMediator').updateInputValue('')
    console.log('新版Conversation 清除conversation')
    const currentConversation = currentSidebarConversationId
      ? await clientGetConversation(currentSidebarConversationId)
      : null
    if (currentConversation) {
      if (currentConversation.type === 'Summary') {
        // Summary有点不一样，需要清除所有的message
        await clientChatConversationModifyChatMessages(
          'delete',
          currentConversation.id,
          9999999,
          [],
        )
        setSidebarSummaryConversationId('')
      }
      await createSidebarConversation(
        currentConversation.type,
        currentConversation.meta.AIProvider!,
        currentConversation.meta.AIModel!,
      )
    } else {
      await createSidebarConversation(currentSidebarConversationType)
    }
    setClientWritingMessage({
      writingMessage: null,
      loading: false,
    })
  }

  const createSidebarConversation = async (
    conversationType: ISidebarConversationType,
    AIProvider?: IAIProviderType,
    AIModel?: string,
  ): Promise<string> => {
    let conversationId: string = ''
    if (!AIProvider || !AIModel) {
      AIProvider =
        SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG[conversationType].AIProvider
      AIModel =
        SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG[conversationType].AIModel
    }
    if (conversationType === 'Chat') {
      // 获取当前AIProvider
      // 获取当前AIProvider的model
      // 获取当前AIProvider的model的maxTokens
      console.log('新版Conversation ', AIProvider, AIModel)
      const baseMetaConfig: Partial<IChatConversationMeta> = {
        AIProvider: AIProvider,
        AIModel: AIModel,
        maxTokens:
          getAIProviderModelDetail(AIProvider, AIModel)?.maxTokens || 4096,
      }
      // 如果是OPENAI_API，那么就加上systemPrompt
      if (AIProvider === 'OPENAI_API') {
        baseMetaConfig.systemPrompt = openAIAPISystemPromptGenerator(AIModel)
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
        await updateSidebarSettings({
          summary: {
            conversationId,
          },
        })
        setSidebarSummaryConversationId(conversationId)
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
      setSidebarSummaryConversationId(conversationId)
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
    } else if (conversationType === 'ContextMenu') {
      const baseMetaConfig: Partial<IChatConversationMeta> = {
        AIProvider: AIProvider,
        AIModel: AIModel,
        maxTokens:
          getAIProviderModelDetail(AIProvider, AIModel)?.maxTokens || 4096,
      }
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'ContextMenu',
            title: 'AI-powered writing assistant',
            meta: baseMetaConfig,
          } as Partial<IChatConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
      }
    }
    return conversationId
  }
  const updateSidebarSummaryConversationId = (id?: string) => {
    setSidebarSummaryConversationId(id || getPageSummaryConversationId())
  }
  const continueConversationInSidebar = async (
    ...args: Parameters<typeof clientDuplicateChatConversation>
  ) => {
    if (isDuplicatingRef.current) {
      return
    }
    isDuplicatingRef.current = true
    const [conversationId, updateConversationData, syncConversationToDB] =
      args as Parameters<typeof clientDuplicateChatConversation>
    // 需要复制当前的conversation
    const newConversation = await clientDuplicateChatConversation(
      conversationId,
      updateConversationData,
      syncConversationToDB,
    )
    if (newConversation) {
      if (['Chat', 'Search', 'Summary', 'Art'].includes(newConversation.type)) {
        await updateSidebarSettings({
          [newConversation.type.toLowerCase()]: {
            conversationId: newConversation.id,
          },
        })
        updateSidebarConversationType(
          newConversation.type as ISidebarConversationType,
        )
      }
    }
    showChatBox()
    hideFloatingContextMenu()
    isDuplicatingRef.current = false
  }
  return {
    createSidebarConversation,
    resetSidebarConversation,
    sidebarSettings: appLocalStorage.sidebarSettings,
    currentSidebarConversationType,
    currentSidebarAIProvider,
    currentSidebarConversation,
    currentSidebarConversationId,
    currentSidebarConversationMessages,
    sidebarConversationTypeMessageMap,
    sidebarConversationTypeofConversationMap,
    updateSidebarSettings,
    updateSidebarConversationType,
    sidebarChatConversationId,
    sidebarSummaryConversationId,
    updateSidebarSummaryConversationId,
    continueConversationInSidebar,
  }
}
export default useSidebarSettings
