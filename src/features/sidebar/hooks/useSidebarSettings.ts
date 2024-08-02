import merge from 'lodash-es/merge'
import { useMemo, useRef } from 'react'
import { useRecoilCallback, useRecoilState } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { openAIAPISystemPromptGenerator } from '@/background/src/chat/OpenAIApiChat/types'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/type'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG } from '@/features/chatgpt/hooks/useClientConversation'
import { FloatingDropdownMenuState } from '@/features/contextMenu'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  IConversation,
  IConversationMeta,
} from '@/features/indexed_db/conversations/models/Conversation'
import {
  ClientWritingMessageStateFamily,
  SidebarPageState,
  SidebarSummaryConversationIdState,
} from '@/features/sidebar/store'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppLocalStorageState } from '@/store'
import { getInputMediator } from '@/store/InputMediator'
import {
  getCurrentDomainHost,
  websiteGetSeoMetaData,
} from '@/utils/dataHelper/websiteHelper'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useSidebarSettings = () => {
  const [sidebarSummaryConversationId, setSidebarSummaryConversationId] =
    useRecoilState(SidebarSummaryConversationIdState)
  const [appLocalStorage, setAppLocalStorage] =
    useRecoilState(AppLocalStorageState)
  const [sidebarPageState, setSidebarPageSate] =
    useRecoilState(SidebarPageState)
  const { getAIProviderModelDetail } = useAIProviderModelsMap()
  const isContinueInChatProgressRef = useRef(false)
  const currentSidebarConversationType =
    sidebarPageState.sidebarConversationType
  const currentSidebarAIProvider =
    appLocalStorage.sidebarSettings?.common?.currentAIProvider
  const sidebarContextMenuConversationId =
    appLocalStorage.sidebarSettings?.contextMenu?.conversationId
  const sidebarChatConversationId =
    appLocalStorage.sidebarSettings?.chat?.conversationId
  const currentSearchConversationId =
    appLocalStorage.sidebarSettings?.search?.conversationId
  const currentArtConversationId =
    appLocalStorage.sidebarSettings?.art?.conversationId
  // 当前sidebar conversation type对应的conversation id
  const currentSidebarConversationId = useMemo(() => {
    switch (currentSidebarConversationType) {
      case 'ContextMenu':
        return sidebarContextMenuConversationId
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
    sidebarContextMenuConversationId,
  ])

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

  const updateImmersiveSettings = async (
    newImmersiveSettings: IChromeExtensionLocalStorage['immersiveSettings'],
  ) => {
    await setChromeExtensionLocalStorage({
      immersiveSettings: newImmersiveSettings,
    })
    const savedAppLocalStorage = await getChromeExtensionLocalStorage()
    setAppLocalStorage((prev) => {
      return {
        ...prev,
        immersiveSettings: savedAppLocalStorage.immersiveSettings,
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

  const resetSidebarConversation = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const clientWritingMessage = await snapshot.getPromise(
          ClientWritingMessageStateFamily(currentSidebarConversationId || ''),
        )
        if (clientWritingMessage.loading) {
          return
        }
        getInputMediator('floatingMenuInputMediator').updateInputValue('')
        getInputMediator('chatBoxInputMediator').updateInputValue('')
        console.log('新版Conversation 清除conversation')
        set(
          ClientWritingMessageStateFamily(currentSidebarConversationId || ''),
          {
            writingMessage: null,
            loading: false,
          },
        )
        const currentConversation = currentSidebarConversationId
          ? await ClientConversationManager.getConversationById(
              currentSidebarConversationId,
            )
          : null

        let newConversationId: string
        if (currentConversation) {
          if (currentConversation.type === 'Summary') {
            // Summary有点不一样，需要清除所有的message
            // 同步云端删除完成后再创建，显示loading
            set(
              ClientWritingMessageStateFamily(currentConversation.id),
              (prevState) => {
                return {
                  ...prevState,
                  loading: true,
                }
              },
            )
            await ClientConversationMessageManager.deleteMessages(
              currentConversation.id,
              await ClientConversationMessageManager.getMessageIds(
                currentConversation.id,
              ),
              { waitSync: true },
            )
            set(
              ClientWritingMessageStateFamily(currentConversation.id),
              (prevState) => {
                return {
                  ...prevState,
                  loading: false,
                }
              },
            )
            setSidebarSummaryConversationId('')
          }
          newConversationId = await createSidebarConversation(
            currentConversation.type,
            currentConversation.meta.AIProvider!,
            currentConversation.meta.AIModel!,
          )
        } else {
          newConversationId = await createSidebarConversation(
            currentSidebarConversationType,
          )
        }

        if (
          (!currentConversation &&
            currentSidebarConversationType === 'ContextMenu') ||
          currentConversation?.type === 'ContextMenu'
        ) {
          updateSidebarSettings({
            contextMenu: {
              conversationId: newConversationId,
            },
          })
        }
      },
    [currentSidebarConversationId, currentSidebarConversationType],
  )

  const createSidebarConversation = async (
    conversationType: ISidebarConversationType,
    AIProvider?: IAIProviderType,
    AIModel?: string,
    updateSetting = true,
  ): Promise<string> => {
    let conversationId: string = ''
    if (!AIProvider || !AIModel) {
      AIProvider =
        SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG[conversationType].AIProvider
      AIModel =
        SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG[conversationType].AIModel
    }
    const domain = getCurrentDomainHost()
    const path = window.location.href
    if (conversationType === 'Chat') {
      // 获取当前AIProvider
      // 获取当前AIProvider的model
      // 获取当前AIProvider的model的maxTokens
      console.log('新版Conversation ', AIProvider, AIModel)
      const baseMetaConfig: Partial<IConversationMeta> = {
        AIProvider: AIProvider,
        AIModel: AIModel,
        maxTokens:
          getAIProviderModelDetail(AIProvider, AIModel)?.maxTokens || 4096,
        domain,
        path,
        sourceWebpage: websiteGetSeoMetaData(),
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
          } as Partial<IConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
        if (updateSetting) {
          await updateSidebarSettings({
            chat: {
              conversationId,
            },
          })
        }
      }
    } else if (conversationType === 'Summary') {
      const userId = await getMaxAIChromeExtensionUserId()
      conversationId = getPageSummaryConversationId({ userId })
      // 如果已经存在了，并且有AI消息，那么就不用创建了
      if (
        conversationId &&
        (await ClientConversationManager.getConversationById(conversationId))
      ) {
        if (updateSetting) {
          await updateSidebarSettings({
            summary: {
              conversationId,
            },
          })
        }
        setSidebarSummaryConversationId(conversationId)
        return conversationId
      }
      const conversationTitleMap: {
        [key in IPageSummaryType]: string
      } = {
        PAGE_SUMMARY: 'Summarize & ask about page',
        DEFAULT_EMAIL_SUMMARY: 'Summarize & ask about email',
        PDF_CRX_SUMMARY: 'Summarize & ask about PDF',
        YOUTUBE_VIDEO_SUMMARY: 'Summarize & ask about video',
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
              pageSummary: {
                type: pageSummaryType,
              },
              domain,
              path,
              sourceWebpage: websiteGetSeoMetaData(),
              //               pageSummaryId: pageSummaryData.pageSummaryId,
              //               pageSummaryType: pageSummaryData.pageSummaryType,
              //               systemPrompt: `The following text delimited by triple backticks is the context text:
              // \`\`\`
              // ${pageSummaryData.pageSummaryContent}
              // \`\`\``,
            } as IConversationMeta),
          } as Partial<IConversation>,
        },
      })
      setSidebarSummaryConversationId(conversationId)
    } else if (conversationType === 'Search') {
      // 获取当前AIProvider
      // 获取当前AIProvider的model
      // 获取当前AIProvider的model的maxTokens
      const baseMetaConfig: Partial<IConversationMeta> = {
        AIProvider: AIProvider,
        AIModel: AIModel,
        maxTokens:
          getAIProviderModelDetail(AIProvider, AIModel)?.maxTokens || 16384,
        domain,
        path,
        sourceWebpage: websiteGetSeoMetaData(),
      }
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Search',
            title: 'AI-powered search',
            meta: baseMetaConfig,
            // meta: merge(SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Search),
          } as Partial<IConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
        if (updateSetting) {
          await updateSidebarSettings({
            search: {
              conversationId,
            },
          })
        }
      }
    } else if (conversationType === 'Art') {
      // 创建一个新的conversation
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'Art',
            title: 'AI-powered image generate',
            meta: merge(SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Art, {
              domain,
              path,
            }),
            sourceWebpage: websiteGetSeoMetaData(),
          } as Partial<IConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
        if (updateSetting) {
          await updateSidebarSettings({
            art: {
              conversationId,
            },
          })
        }
      }
    } else if (conversationType === 'ContextMenu') {
      const baseMetaConfig: Partial<IConversationMeta> = {
        AIProvider: AIProvider,
        AIModel: AIModel,
        maxTokens:
          getAIProviderModelDetail(AIProvider, AIModel)?.maxTokens || 4096,
        domain,
        path,
        sourceWebpage: websiteGetSeoMetaData(),
      }
      const result = await port.postMessage({
        event: 'Client_createChatGPTConversation',
        data: {
          initConversationData: {
            type: 'ContextMenu',
            title: 'AI-powered writing assistant',
            meta: baseMetaConfig,
          } as Partial<IConversation>,
        },
      })
      if (result.success) {
        conversationId = result.data.conversationId
      }
    }
    return conversationId
  }
  const updateSidebarSummaryConversationId = (id?: string) => {
    if (id) {
      setSidebarSummaryConversationId(id)
    } else {
      getMaxAIChromeExtensionUserId().then((userId) => {
        setSidebarSummaryConversationId(
          getPageSummaryConversationId({ userId }),
        )
      })
    }
  }

  const hideContextWindowWithoutClose = useRecoilCallback(({ set }) => {
    return () => {
      set(FloatingDropdownMenuState, (prev) => ({
        ...prev,
        open: false,
      }))
    }
  })

  /**
   * @param sync 控制是否await同步执行
   */
  const continueConversationInSidebar = async (
    conversationId: string,
    updateConversationData: Partial<IConversation>,
    options?: {
      syncConversationToDB?: boolean
      waitSync?: boolean
    },
  ) => {
    if (isContinueInChatProgressRef.current) {
      return
    }
    isContinueInChatProgressRef.current = true
    // const [conversationId, updateConversationData, options] = args
    // 需要复制当前的conversation
    const newConversation =
      await ClientConversationManager.addOrUpdateConversation(
        conversationId,
        updateConversationData,
        {
          ...options,
          syncConversationToDB: true,
          waitSync: true,
        },
      )
    if (
      newConversation &&
      ['ContextMenu', 'Chat', 'Search', 'Summary', 'Art'].includes(
        newConversation.type,
      )
    ) {
      // ContextMenu的sidebar设置属性不是全小写
      const scope =
        newConversation.type === 'ContextMenu'
          ? 'contextMenu'
          : newConversation.type.toLowerCase()

      await updateSidebarSettings({
        [scope]: {
          conversationId: newConversation.id,
        },
      })

      updateSidebarConversationType(
        newConversation.type as ISidebarConversationType,
      )
    }
    showChatBox()
    hideContextWindowWithoutClose()
    // hideFloatingContextMenu(true)
    isContinueInChatProgressRef.current = false
  }
  return {
    createSidebarConversation,
    resetSidebarConversation,
    sidebarSettings: appLocalStorage.sidebarSettings,
    immersiveSettings: appLocalStorage.immersiveSettings,
    currentSidebarConversationType,
    currentSidebarAIProvider,
    currentSidebarConversationId,
    updateSidebarSettings,
    updateSidebarConversationType,
    sidebarChatConversationId,
    sidebarSummaryConversationId,
    updateSidebarSummaryConversationId,
    continueConversationInSidebar,
    updateImmersiveSettings,
  }
}
export default useSidebarSettings
