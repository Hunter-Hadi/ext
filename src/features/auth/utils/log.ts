import debounce from 'lodash-es/debounce'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER } from '@/features/searchWithAI/constants'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'

/**
 * 将 PermissionWrapperCardSceneType 根据不同场景和配置转换成 logType
 */
const permissionSceneTypeToLogType = async (
  sceneType: PermissionWrapperCardSceneType,
): Promise<string> => {
  let name: string = sceneType

  // search with ai maxai_claude
  if (sceneType === 'SEARCH_WITH_AI_CLAUDE') {
    return `SEARCH_WITH_AI(${SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER['MAXAI_CLAUDE']})`
  }
  // search with ai chatgpt
  if (sceneType === 'SEARCH_WITH_AI_CHATGPT') {
    return `SEARCH_WITH_AI(${SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER['USE_CHAT_GPT_PLUS']})`
  }

  const { sidebarSettings } = await getChromeExtensionLocalStorage()

  // summary
  if (sceneType === 'PAGE_SUMMARY') {
    let summaryModel = SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Summary.AIModel
    const currentSummaryConversationId =
      sidebarSettings?.summary?.conversationId
    if (currentSummaryConversationId) {
      const currentSummaryConversation = await clientGetConversation(
        currentSummaryConversationId,
      )
      summaryModel = currentSummaryConversation?.meta.AIModel || summaryModel
    }

    const pageSummaryType = getPageSummaryType()
    name = 'SUMMARY'
    switch (pageSummaryType) {
      case 'PDF_CRX_SUMMARY':
        name += `(PDF ${summaryModel})`
        break
      case 'PAGE_SUMMARY':
        name += `(DEFAULT ${summaryModel})`
        break
      case 'YOUTUBE_VIDEO_SUMMARY':
        name += `(YOUTUBE ${summaryModel})`
        break
      case 'DEFAULT_EMAIL_SUMMARY':
        name += `(EMAIL ${summaryModel})`
        break
      default:
        break
    }
    return name
  }

  // sidebar search
  if (sceneType === 'SIDEBAR_SEARCH_WITH_AI') {
    // set default
    let searchModel = SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Search.AIModel
    const currentSearchConversationId = sidebarSettings?.search?.conversationId
    if (currentSearchConversationId) {
      const currentSearchConversation = await clientGetConversation(
        currentSearchConversationId,
      )
      searchModel = currentSearchConversation?.meta.AIModel || searchModel
    }

    name = 'SEARCH'
    const isProSearch = sidebarSettings?.search?.copilot ? 'Pro' : 'Default'
    name += `(${isProSearch} ${searchModel})`
    return name
  }

  // Image Model
  if (
    sceneType === 'SIDEBAR_ART_AND_IMAGES' ||
    sceneType === 'MAXAI_IMAGE_GENERATE_MODEL'
  ) {
    let artModel = SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Art.AIModel
    const currentArtConversationId = sidebarSettings?.art?.conversationId
    if (currentArtConversationId) {
      const currentArtConversation = await clientGetConversation(
        currentArtConversationId,
      )
      artModel = currentArtConversation?.meta.AIModel || artModel
    }
    const isPro = sidebarSettings?.art?.isEnabledConversationalMode
      ? 'Default'
      : 'Pro'
    name = `IMAGE_MODEL(${isPro} ${artModel})`
    return name
  }

  const currentChatConversationId = sidebarSettings?.chat?.conversationId || ''
  let chatModel = SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Chat.AIModel
  if (currentChatConversationId) {
    const currentChatConversation = await clientGetConversation(
      currentChatConversationId,
    )
    chatModel = currentChatConversation?.meta.AIModel || chatModel
  }

  // gmail instant reply
  if (
    sceneType.includes('GMAIL_CONTEXT_MENU') ||
    sceneType.includes('GMAIL_DRAFT_BUTTON') ||
    sceneType.includes('GMAIL_REPLY_BUTTON')
  ) {
    switch (sceneType) {
      case 'GMAIL_CONTEXT_MENU':
        name = `INSTANT_REPLY(Refine ${chatModel})`
        break
      case 'GMAIL_DRAFT_BUTTON':
        name = `INSTANT_REPLY(Compose ${chatModel})`
        break
      case 'GMAIL_REPLY_BUTTON':
        name = `INSTANT_REPLY(Reply ${chatModel})`
        break
      default:
        break
    }
    return name
  }

  // instant reply
  // 判断是否是 instant reply 付费卡点
  if (
    sceneType.includes('REFINE_DRAFT_BUTTON') ||
    sceneType.includes('COMPOSE_NEW_BUTTON') ||
    sceneType.includes('COMPOSE_REPLY_BUTTON')
  ) {
    name = 'INSTANT_REPLY'
    if (sceneType.includes('COMPOSE_REPLY_BUTTON')) {
      name += `(Reply ${chatModel})`
      return name
    }
    if (sceneType.includes('REFINE_DRAFT_BUTTON')) {
      name += `(Refine ${chatModel})`
      return name
    }
    if (sceneType.includes('COMPOSE_NEW_BUTTON')) {
      name += `(Compose ${chatModel})`
      return name
    }
  }

  if (sceneType === 'THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT') {
    const currentThirdProvider = sidebarSettings?.chat?.thirdAIProvider
    const thirdPartyProviderName = AIProviderOptions.find(
      (providerOption) => providerOption.value === currentThirdProvider,
    )?.label
    name = `FAST_TEXT_MODEL(${thirdPartyProviderName} ${chatModel})`
    return name
  }
  // Fast Text Model
  if (sceneType === 'MAXAI_FAST_TEXT_MODEL') {
    name = `FAST_TEXT_MODEL(${chatModel})`
    return name
  }

  // Advanced Text Model
  if (sceneType === 'MAXAI_ADVANCED_MODEL') {
    name = `ADVANCED_TEXT_MODEL(${chatModel})`
    return name
  }

  return name
}

export const authEmitPricingHooksLog = debounce(
  async (
    action: 'show' | 'click',
    sceneType: PermissionWrapperCardSceneType,
  ) => {
    try {
      const logType = await permissionSceneTypeToLogType(sceneType)

      const port = new ContentScriptConnectionV2()
      await port.postMessage({
        event: 'Client_emitPricingHooks',
        data: {
          action,
          name: logType,
        },
      })
    } catch (e) {
      console.log('emitPricingHooksLog error', e)
    }
  },
  1000,
)
