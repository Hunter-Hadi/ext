import debounce from 'lodash-es/debounce'

import { IAIProviderType } from '@/background/provider/chat'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
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
  if (sceneType === 'MAXAI_IMAGE_GENERATE_MODEL') {
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
    meta?: {
      // 根据 conversationId 获取 到的 ai model 和 provider，优先级更高
      conversationId?: string
      AIModel?: string
      AIProvider?: string

      inContextMenu?: boolean
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

/**
 *
 * @inheritdoc https://ikjt09m6ta.larksuite.com/docx/NKYwdlxOdoidBqxDh0eu8dqasKb
 */
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
        AIProvider =
          BEAUTIFY_PROVIDER_NAME[conversationAIModelAndProvider.provider]
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
