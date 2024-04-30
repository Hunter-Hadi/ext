import debounce from 'lodash-es/debounce'

import { IAIProviderType } from '@/background/provider/chat'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import {
  PERMISSION_CARD_SETTINGS_TEMPLATE,
  PermissionWrapperCardSceneType,
} from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG } from '@/features/chatgpt/hooks/useClientConversation'
import {
  clientGetConversation,
  clientGetConversationAIModelAndProvider,
} from '@/features/chatgpt/utils/chatConversationUtils'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER } from '@/features/searchWithAI/constants'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { objectFilterEmpty } from '@/utils/dataHelper/objectHelper'
import {
  getCurrentDomainHost,
  isMaxAIImmersiveChatPage,
} from '@/utils/dataHelper/websiteHelper'

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

  const currentChatConversationId =
    sourceConversationId || sidebarSettings?.chat?.conversationId || ''
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

  if (sceneType === 'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT') {
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
    meta?: {
      // 根据 conversationId 获取 到的 ai model 和 provider，优先级更高
      conversationId?: string
      AIModel?: string
      AIProvider?: string
    },
  ) => {
    try {
      const {
        conversationId: propConversationId,
        AIModel: propAIModel,
        AIProvider: propAIProvider,
      } = meta ?? {}

      const logType = await permissionSceneTypeToLogType(
        sceneType,
        propConversationId,
      )

      const trackParams = await generateTrackParams(
        sceneType,
        propConversationId,
        propAIModel,
        propAIProvider,
      )

      const type = action === 'show' ? 'paywall_showed' : 'paywall_clicked'
      mixpanelTrack(type, {
        logType,
        sceneType,
        currentDomain: getCurrentDomainHost(),
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

const generateTrackParams = async (
  sceneType: PermissionWrapperCardSceneType,
  propConversationId?: string,
  propAIModel?: string,
  propAIProvider?: string,
) => {
  try {
    // 1. 开始获取 AIModel 和 AIProvider
    // 根据 conversationId 获取 ai model 和 provider
    let AIModel = propAIModel
    let AIProvider = propAIProvider
    if (propConversationId) {
      const conversationAIModelAndProvider =
        await clientGetConversationAIModelAndProvider(propConversationId)
      if (conversationAIModelAndProvider.aiModel) {
        AIModel = conversationAIModelAndProvider.aiModel
      }
      if (conversationAIModelAndProvider.provider) {
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
        AIProvider =
          BEAUTIFY_PROVIDER_NAME[conversationAIModelAndProvider.provider]
      }
    }
    // 结束获取 AIModel 和 AIProvider

    // 2. 开始获取 paywallName
    // 直接通过 PERMISSION_CARD_SETTINGS_TEMPLATE 中定义的 pricingHookCardType 来生成 paywallName
    // 针对 search with ai 的特殊处理，因为两个 sceneType 不存在 pricingHookCardType
    let paywallName = ''
    const permissionWrapperCardData =
      PERMISSION_CARD_SETTINGS_TEMPLATE[sceneType]
    if (sceneType.startsWith('SEARCH_WITH_AI')) {
      paywallName = 'SEARCH_WITH_AI'
    }

    if (permissionWrapperCardData.pricingHookCardType) {
      switch (permissionWrapperCardData.pricingHookCardType) {
        case 'FAST_TEXT_MODEL': {
          if (sceneType === 'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT') {
            paywallName = 'THIRD_PARTY_MODEL'
          } else {
            paywallName = 'FAST_TEXT_MODEL'
          }
          break
        }
        case 'ADVANCED_MODEL': {
          paywallName = 'ADVANCED_TEXT_MODEL'
          break
        }
        case 'IMAGE_MODEL': {
          paywallName = 'IMAGE_MODEL'
          break
        }
        case 'AI_SEARCH': {
          paywallName = 'SEARCH'
          break
        }
        case 'AI_SUMMARY': {
          paywallName = 'SUMMARY'
          break
        }
        case 'INSTANT_REPLY': {
          paywallName = 'INSTANT_REPLY'
          break
        }
        default: {
          paywallName = 'UNKNOWN'
        }
      }
    }
    // 结束获取 paywallName

    // 3. 开始获取 featureName
    let featureName = ''
    if (sceneType.startsWith('SEARCH_WITH_AI')) {
      featureName = 'search_with_ai'
    } else if (
      permissionWrapperCardData.pricingHookCardType === 'INSTANT_REPLY'
    ) {
      const prefix = 'instant'
      let suffix = ''
      if (sceneType.includes('COMPOSE_REPLY_BUTTON')) {
        suffix = 'reply'
      }
      if (sceneType.includes('REFINE_DRAFT_BUTTON')) {
        suffix = 'refine'
      }
      if (sceneType.includes('COMPOSE_NEW_BUTTON')) {
        suffix = 'new'
      }
      // 由于 gmail 相关 sceneType 声明较早没有统一，这里做特殊处理
      // 这里 gmail instant reply 特殊判断
      switch (sceneType) {
        case 'GMAIL_CONTEXT_MENU': {
          suffix = `refine`
          break
        }
        case 'GMAIL_DRAFT_BUTTON': {
          suffix = `new`
          break
        }
        case 'GMAIL_REPLY_BUTTON': {
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
      switch (permissionWrapperCardData.pricingHookCardType) {
        case 'AI_SUMMARY': {
          suffix = `summary`
          break
        }
        case 'AI_SEARCH': {
          suffix = `search`
          break
        }
        case 'IMAGE_MODEL': {
          suffix = `art`
          break
        }
        default: {
          suffix = `chat`
          break
        }
      }
      featureName = `${prefix}_${suffix}`
    }
    // 结束获取 featureName

    // 4. 开始获取 summary platform
    let platform = ''
    if (permissionWrapperCardData.pricingHookCardType === 'AI_SUMMARY') {
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
    switch (permissionWrapperCardData.pricingHookCardType) {
      case 'AI_SEARCH': {
        mode = sidebarSettings?.search?.copilot ? 'pro' : 'default'
        break
      }
      case 'IMAGE_MODEL': {
        mode = sidebarSettings?.art?.isEnabledConversationalMode
          ? 'default'
          : 'pro'
        break
      }
      default: {
        mode = null
        break
      }
    }
    // 结束获取 search 和 art 的 model

    return objectFilterEmpty(
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
  } catch (error) {
    // do nothing
    return {}
  }
}
