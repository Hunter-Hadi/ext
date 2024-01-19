import { IAIProviderType } from '@/background/provider/chat'
import { BingConversationStyle } from '@/background/src/chat/BingChat/bing/types'
import { AI_PROVIDER_MAP } from '@/constants'
import { IArtTextToImageMetadata } from '@/features/art/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'

export type IChromeExtensionButtonSettingKey =
  | 'inputAssistantComposeReplyButton'
  | 'inputAssistantComposeNewButton'
  | 'inputAssistantRefineDraftButton'
  | 'textSelectPopupButton'

export type IChatGPTModelType = {
  slug: string
  max_tokens: number
  title: string
  description: string
  tags?: string[]
  enabled_tools?: string[]
  qualitative_properties?: {
    reasoning: number[]
    speed: number[]
    conciseness: number[]
  }
}
export type IChatGPTPluginType = {
  id: string
  domain: string
  categories: unknown[]
  manifest?: {
    api: {
      type: string
      url: string
    }
    auth: {
      type: string
    }
    contact_email: string
    description_for_human: string
    description_for_model: string
    legal_info_url: string
    logo_url: string
    name_for_human: string
    name_for_model: string
    schema_version: string
  }
  namespace: string
  oauth_client_id: string
  status: 'approved'
  user_settings: {
    is_installed: boolean
    is_authenticated: boolean
  }
}

export interface IVisibilitySetting {
  isWhitelistMode: boolean
  whitelist: string[]
  blacklist: string[]
}

export interface IChromeExtensionButtonSetting {
  contextMenu: IContextMenuItem[]
  visibility: IVisibilitySetting
  contextMenuPosition: 'start' | 'end'
}

export interface IChromeExtensionDBStorage {
  userSettings?: {
    colorSchema?: 'light' | 'dark' | 'auto'
    language?: string
    preferredLanguage?: string
    chatGPTStableModeDuration?: number
    pdf?: {
      enabled?: boolean
    }
    shortcutHintEnable?: boolean
    quickAccess?: {
      enabled?: boolean
    }
    summarizeButton?: {
      gmail?: boolean
      outlook?: boolean
      youtube?: boolean
      pdf?: boolean
    }
    inputAssistantButton?: {
      gmail?: boolean
      outlook?: boolean
      twitter?: boolean
      linkedIn?: boolean
      facebook?: boolean
      youtube?: boolean
      instagram?: boolean
      reddit?: boolean
      googleMyBusiness?: boolean
      slack?: boolean
      discord?: boolean
      whatsApp?: boolean
      hubspot?: boolean
      telegram?: boolean
      microsoftTeams?: boolean
      googleChat?: boolean
    }
  }
  buttonSettings?: {
    [key in IChromeExtensionButtonSettingKey]: IChromeExtensionButtonSetting
  }
  lastModified?: number
}

export type IChromeExtensionDBStorageUpdateFunction = (
  settings: IChromeExtensionDBStorage,
) => IChromeExtensionDBStorage

export type IThirdProviderSettings = {
  [AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS]?: {
    model?: string
    temperature?: number
  }
  [AI_PROVIDER_MAP.OPENAI]?: {
    model?: string
    plugins?: string[]
    modelOptions?: IChatGPTModelType[]
    pluginOptions?: IChatGPTPluginType[]
  }
  [AI_PROVIDER_MAP.OPENAI_API]?: {
    temperature?: number
    model?: string
    apiKey?: string
    apiHost?: string
  }
  [AI_PROVIDER_MAP.BING]?: {
    model?: string
    conversationStyle?: BingConversationStyle
  }
  [AI_PROVIDER_MAP.BARD]?: {
    model?: string
  }
  [AI_PROVIDER_MAP.CLAUDE]?: {
    model?: string
  }
  [AI_PROVIDER_MAP.POE]: {
    model?: string
  }
  [AI_PROVIDER_MAP.MAXAI_CLAUDE]: {
    model?: string
    temperature?: number
  }
  [AI_PROVIDER_MAP.MAXAI_GEMINI]: {
    model?: string
    temperature?: number
  }
  // Art provider
  [AI_PROVIDER_MAP.MAXAI_DALLE]: {
    model?: string
  } & IArtTextToImageMetadata
}

export interface IChromeExtensionLocalStorage {
  sidebarSettings?: {
    chat?: {
      conversationId?: string
    }
    summary?: {
      conversationId?: string
    }
    search?: {
      conversationId?: string
      copilot?: boolean
      maxResultsCount?: number
      searchEngine?: URLSearchEngine
    }
    art?: {
      conversationId?: string
      isEnabledConversationalMode?: boolean
    }
    common?: {
      currentAIProvider?: IAIProviderType
      chatBoxWidth?: number
    }
    cache?: {
      chatConversationCache?: {
        [key in string]: string
      }
    }
  }
  thirdProviderSettings?: {
    [P in IAIProviderType]?: IThirdProviderSettings[P]
  }
}
export type IChromeExtensionLocalStorageUpdateFunction = (
  settings: IChromeExtensionLocalStorage,
) => IChromeExtensionLocalStorage
