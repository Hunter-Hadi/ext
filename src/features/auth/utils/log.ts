import cloneDeep from 'lodash-es/cloneDeep'
import debounce from 'lodash-es/debounce'

import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import defaultEditAssistantComposeReplyContextMenuJson from '@/background/defaultPromptsData/defaultEditAssistantComposeReplyContextMenuJson'
import defaultInputAssistantComposeNewContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantComposeNewContextMenuJson'
import defaultInputAssistantRefineDraftContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantRefineDraftContextMenuJson'
import { IAIProviderType } from '@/background/provider/chat'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PRESET_PROMPT_IDS } from '@/constants'
import { getChromeExtensionUserABTest } from '@/features/abTester/utils'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG } from '@/features/chatgpt/hooks/useClientConversation'
import { CONTEXT_MENU_DRAFT_TYPES } from '@/features/contextMenu/constants'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IUserChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER } from '@/features/searchWithAI/constants'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { objectFilterEmpty } from '@/utils/dataHelper/objectHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const BEAUTIFY_PROVIDER_NAME: Record<IAIProviderType, string> = {
  USE_CHAT_GPT_PLUS: 'in_house',
  MAXAI_CLAUDE: 'in_house',
  MAXAI_GEMINI: 'in_house',
  MAXAI_DALLE: 'in_house',
  MAXAI_FREE: 'in_house',
  OPENAI: 'chatgpt_web_app',
  OPENAI_API: 'openai_api',
  BARD: 'gemini_web_app',
  BING: 'bing_web_app',
  CLAUDE: 'claude_web_app',
  POE: 'poe_web_app',
}

/**
 * 将 PermissionWrapperCardSceneType 根据不同场景和配置转换成 logType
 */
const permissionSceneTypeToLogType = async (
  sceneType: PermissionWrapperCardSceneType,
  sourceConversationId?: string,
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
      const currentSummaryConversation =
        await ClientConversationManager.getConversationById(
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
      const currentSearchConversation =
        await ClientConversationManager.getConversationById(
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
  if (sceneType === 'MAXAI_IMAGE_GENERATE_MODEL') {
    let artModel = SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Art.AIModel
    const currentArtConversationId = sidebarSettings?.art?.conversationId
    if (currentArtConversationId) {
      const currentArtConversation =
        await ClientConversationManager.getConversationById(
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

  const currentChatConversationId =
    sourceConversationId || sidebarSettings?.chat?.conversationId || ''
  let chatModel = SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG.Chat.AIModel
  if (currentChatConversationId) {
    const currentChatConversation =
      await ClientConversationManager.getConversationById(
        currentChatConversationId,
      )
    chatModel = currentChatConversation?.meta.AIModel || chatModel
  }

  // instant reply
  // 判断是否是 instant reply 付费卡点
  if (sceneType.includes('MAXAI_INSTANT')) {
    name = 'INSTANT_REPLY'
    if (sceneType.includes('INSTANT_REPLY')) {
      name += `(Reply ${chatModel})`
      return name
    }
    if (sceneType.includes('INSTANT_REFINE')) {
      name += `(Refine ${chatModel})`
      return name
    }
    if (sceneType.includes('INSTANT_NEW')) {
      name += `(Compose ${chatModel})`
      return name
    }
  }

  if (sceneType === 'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT') {
    const currentThirdProvider = sidebarSettings?.chat?.thirdAIProvider
    const thirdPartyProviderName = AIProviderOptions.find(
      (providerOption) => providerOption.value === currentThirdProvider,
    )?.label
    name = `FAST_TEXT_MODEL(${thirdPartyProviderName} ${chatModel})`
    return name
  }
  // Fast Text Model
  if (sceneType.includes('MAXAI_FAST_TEXT_MODEL')) {
    name = `FAST_TEXT_MODEL(${chatModel})`
    return name
  }

  // Advanced Text Model
  if (sceneType.includes('MAXAI_ADVANCED_MODEL')) {
    name = `ADVANCED_TEXT_MODEL(${chatModel})`
    return name
  }

  return name
}

export const authEmitPricingHooksLog = debounce(
  async (
    action: 'show' | 'click',
    sceneType: PermissionWrapperCardSceneType,
    meta: {
      // 根据 conversationId 获取 到的 ai model 和 provider，优先级更高
      conversationId?: string
      conversationType?: string
      AIModel?: string
      AIProvider?: string
      inContextMenu?: boolean
      paywallType: 'TOPBAR' | 'MODAL' | 'PROACTIVE' | 'RESPONSE'
    },
  ) => {
    try {
      const {
        conversationId: propConversationId,
        conversationType: propConversationType,
        AIModel: propAIModel,
        AIProvider: propAIProvider,
        paywallType,
      } = meta

      const logType = await permissionSceneTypeToLogType(
        sceneType,
        propConversationId,
      )

      const trackParams = await generateTrackParams(
        sceneType,
        propConversationId,
        propAIModel,
        propAIProvider,
        propConversationType,
      )

      if (meta?.inContextMenu && trackParams.featureName) {
        // 如果在 meta 中传入了 inContextMenu, 则将 featureName 替换为 context_menu
        trackParams.featureName = 'context_menu'
      }

      // search with ai 的特殊处理
      if (sceneType === 'SEARCH_WITH_AI_CHATGPT') {
        const provider = 'USE_CHAT_GPT_PLUS'
        trackParams.aiModel = SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER[provider]
        trackParams.aiProvider = BEAUTIFY_PROVIDER_NAME[provider]
      } else if (sceneType === 'SEARCH_WITH_AI_CLAUDE') {
        const provider = 'MAXAI_CLAUDE'
        trackParams.aiModel = SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER[provider]
        trackParams.aiProvider = BEAUTIFY_PROVIDER_NAME[provider]
      }

      const type = action === 'show' ? 'paywall_showed' : 'paywall_clicked'
      const { paywallVariant } = await getChromeExtensionUserABTest()
      mixpanelTrack(type, {
        logType,
        sceneType,
        paywallType,
        testFeature: 'extensionPaywall',
        testVersion: paywallVariant,
        ...trackParams,
      })
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

/**
 *
 * @inheritdoc https://ikjt09m6ta.larksuite.com/docx/NKYwdlxOdoidBqxDh0eu8dqasKb
 */
const generateTrackParams = async (
  sceneType: PermissionWrapperCardSceneType,
  propConversationId?: string,
  propAIModel?: string,
  propAIProvider?: string,
  propConversationType?: string,
) => {
  try {
    // 1. 开始获取 AIModel 和 AIProvider
    // 根据 conversationId 获取 ai model 和 provider
    let AIModel = propAIModel
    let AIProvider = propAIProvider
    if (propConversationId) {
      const conversationAIModelAndProvider =
        await ClientConversationManager.getConversationAIProviderAndAIModel(
          propConversationId,
        )
      if (conversationAIModelAndProvider.AIModel) {
        AIModel = conversationAIModelAndProvider.AIModel
      }
      if (conversationAIModelAndProvider.AIProvider) {
        AIProvider =
          BEAUTIFY_PROVIDER_NAME[conversationAIModelAndProvider.AIProvider]
      }
    }
    // 结束获取 AIModel 和 AIProvider

    // 2. 开始获取 paywallName
    let paywallName = ''
    if (sceneType.includes('MAXAI_FAST_TEXT_MODEL')) {
      paywallName = 'FAST_TEXT_MODEL'
    } else if (sceneType.includes('MAXAI_ADVANCED_MODEL')) {
      paywallName = 'ADVANCED_TEXT_MODEL'
    } else if (sceneType.includes('MAXAI_IMAGE_GENERATE_MODEL')) {
      paywallName = 'IMAGE_MODEL'
    } else if (sceneType === 'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT') {
      paywallName = 'THIRD_PARTY_MODEL'
    } else if (sceneType === 'MAXAI_INSTANT_REPLY') {
      paywallName = 'INSTANT_REPLY'
    } else if (sceneType === 'PAGE_SUMMARY') {
      paywallName = 'SUMMARY'
    } else if (sceneType === 'SIDEBAR_SEARCH_WITH_AI') {
      paywallName = 'SEARCH'
    } else if (sceneType.startsWith('SEARCH_WITH_AI_')) {
      paywallName = 'SEARCH_WITH_AI'
    } else if (sceneType.includes('PROACTIVE_UPGRADE')) {
      paywallName = 'PROACTIVE_UPGRADE'
    } else if (sceneType.includes('TOP_BAR_FAST_TEXT_MODEL')) {
      paywallName = 'TOP_BAR_FAST_TEXT_MODEL'
    } else {
      paywallName = 'UNKNOWN'
    }
    // 结束获取 paywallName

    // 3. 开始获取 featureName
    let featureName = ''
    if (sceneType.startsWith('SEARCH_WITH_AI')) {
      featureName = 'search_with_ai'
    } else if (sceneType.includes('MAXAI_INSTANT')) {
      const prefix = 'instant'
      let suffix = ''
      switch (sceneType) {
        case 'MAXAI_INSTANT_REFINE': {
          suffix = `refine`
          break
        }
        case 'MAXAI_INSTANT_NEW': {
          suffix = `new`
          break
        }
        case 'MAXAI_INSTANT_REPLY': {
          suffix = `reply`
          break
        }
        default:
          break
      }

      featureName = `${prefix}_${suffix}`
    } else {
      const prefix = isMaxAIImmersiveChatPage() ? 'immersive' : 'sidebar'
      let suffix = ''
      if (sceneType === 'PAGE_SUMMARY') {
        suffix = `summary`
      } else if (sceneType === 'SIDEBAR_SEARCH_WITH_AI') {
        suffix = `search`
      } else if (sceneType.includes('IMAGE_GENERATE_MODEL')) {
        suffix = `art`
      } else if (propConversationType) {
        suffix = propConversationType.toLowerCase()
      } else {
        suffix = `chat`
      }
      featureName = `${prefix}_${suffix}`
    }
    // 结束获取 featureName

    // 4. 开始获取 summary platform
    let platform = ''
    if (sceneType === 'PAGE_SUMMARY') {
      const pageSummaryType = getPageSummaryType()
      switch (pageSummaryType) {
        case 'PDF_CRX_SUMMARY':
          platform = 'pdf'
          break
        case 'PAGE_SUMMARY':
          platform = 'default'
          break
        case 'YOUTUBE_VIDEO_SUMMARY':
          platform = 'youtube'
          break
        case 'DEFAULT_EMAIL_SUMMARY':
          platform = 'email'
          break
        default:
          break
      }
    }
    // 结束获取 summary platform

    // 5. 开始获取 search 和 art 的 mode
    let mode: string | null = null
    const { sidebarSettings } = await getChromeExtensionLocalStorage()
    if (sceneType === 'SIDEBAR_SEARCH_WITH_AI') {
      mode = sidebarSettings?.search?.copilot ? 'pro' : 'default'
    } else if (sceneType.includes('IMAGE_GENERATE_MODEL')) {
      mode = sidebarSettings?.art?.isEnabledConversationalMode
        ? 'default'
        : 'pro'
    } else {
      mode = null
    }
    // 结束获取 search 和 art 的 model

    const resultParams = objectFilterEmpty(
      {
        aiModel: AIModel,
        aiProvider: AIProvider,
        paywallName,
        featureName,
        platform,
        mode,
      },
      true,
    )

    return resultParams
  } catch (error) {
    // do nothing
    return {}
  }
}

/**
 * 生成问题的分析数据给 mixpanel或者后端接口
 * @param userMessage
 * @param contextMenuItemId
 */
export const generateQuestionAnalyticsData = async (
  userMessage: IUserChatMessage,
  contextMenuItemId?: string,
) => {
  const analytics = cloneDeep(userMessage.meta?.analytics || {})
  if (!analytics.promptType) {
    const { promptType } = getPromptTypeByContextMenu(contextMenuItemId)
    analytics.promptType = promptType
  }
  const conversation = userMessage.conversationId
    ? await ClientConversationManager.getConversationById(
        userMessage.conversationId,
      )
    : null
  if (!analytics.featureName && conversation) {
    analytics.featureName = getFeatureNameByConversationAndContextMenu(
      conversation,
      contextMenuItemId,
    )
  }
  console.log(`generateQuestionAnalyticsData`, analytics)
  return analytics
}

export const getPromptTypeByContextMenu = (
  contextMenuItemId?: string,
): {
  promptType: 'preset' | 'custom' | 'freestyle'
  instantType?: 'reply' | 'refine' | 'new' | null
} => {
  if (contextMenuItemId) {
    const presetActionPromptIds = Object.values(CONTEXT_MENU_DRAFT_TYPES)
    if (
      defaultInputAssistantRefineDraftContextMenuJson.find(
        (item) => item.id === contextMenuItemId,
      )
    ) {
      return {
        promptType: 'preset',
        instantType: 'refine',
      }
    } else if (
      defaultInputAssistantComposeNewContextMenuJson.find(
        (item) => item.id === contextMenuItemId,
      )
    ) {
      return {
        promptType: 'preset',
        instantType: 'new',
      }
    } else if (
      defaultEditAssistantComposeReplyContextMenuJson.find(
        (item) => item.id === contextMenuItemId,
      )
    ) {
      return {
        promptType: 'preset',
        instantType: 'reply',
      }
    } else if (
      PRESET_PROMPT_IDS.find((promptId) => promptId === contextMenuItemId) ||
      defaultContextMenuJson.find(
        (contextMenu) => contextMenu.id === contextMenuItemId,
      )
    ) {
      return {
        promptType: 'preset',
      }
    } else if (
      presetActionPromptIds.find((promptId) => promptId === contextMenuItemId)
    ) {
      return {
        promptType: 'preset',
      }
    } else {
      return {
        promptType: 'custom',
      }
    }
  } else {
    // 没有 contextMenu 就是用户自由输入的 - freestyle
    return {
      promptType: 'freestyle',
    }
  }
}

export const getFeatureNameByConversationAndContextMenu = (
  conversation: IConversation | null,
  contextMenuItemId?: string,
) => {
  if (conversation) {
    // 1. 先判断是否是 instant
    const { promptType, instantType } =
      getPromptTypeByContextMenu(contextMenuItemId)

    if (promptType === 'preset') {
      if (instantType === 'refine') {
        return 'instant_refine'
      } else if (instantType === 'new') {
        return 'instant_new'
      } else if (instantType === 'reply') {
        return 'instant_reply'
      }
    }

    // 2. 判断是否是 context menu
    if (conversation.type === 'ContextMenu') {
      return 'context_menu'
    }

    // 3. 根据 conversation.type 分类
    const isImmersiveChatPage = isMaxAIImmersiveChatPage()
    const prefix = isImmersiveChatPage ? 'immersive' : 'sidebar'
    let suffix = 'chat'

    switch (conversation.type) {
      case 'Search': {
        suffix = 'search'
        break
      }
      case 'Summary': {
        suffix = 'summary'
        break
      }
      case 'Art': {
        suffix = 'art'
        break
      }
      default: {
        suffix = 'chat'
      }
    }

    return `${prefix}_${suffix}`
  } else {
    return 'UNKNOWN'
  }
}
