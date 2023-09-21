import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP } from '@/constants'
import { BingConversationStyle } from '@/background/src/chat/BingChat/bing/types'
import { IContextMenuItem } from '@/features/contextMenu/types'

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

type IThirdProviderSettings = {
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
}

export type IChromeExtensionButtonSettingKey =
  | 'inputAssistantComposeReplyButton'
  | 'inputAssistantComposeNewButton'
  | 'inputAssistantRefineDraftButton'
  | 'textSelectPopupButton'

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

export interface IChromeExtensionSettings {
  // models?: IChatGPTModelType[]
  // plugins?: IChatGPTPluginType[]
  currentAIProvider?: IAIProviderType
  // currentModel?: string
  // currentPlugins?: string[]
  chatTypeConversationId?: string
  userSettings?: {
    chatBoxWidth?: number
    colorSchema?: 'light' | 'dark'
    language?: string
    preferredLanguage?: string
    chatGPTStableModeDuration?: number
    pdf?: {
      enabled?: boolean
    }
    // shortcut hint
    shortcutHintEnable?: boolean
    quickAccess?: {
      enabled?: boolean
    }
    inputAssistantButton?: {
      gmail?: boolean
      outlook?: boolean
      linkedIn?: boolean
      twitter?: boolean
      facebook?: boolean
      youtube?: boolean
      instagram?: boolean
      reddit?: boolean
      googleMyBusiness?: boolean
      slack?: boolean
      discord?: boolean
      whatsApp?: boolean
      hubspot?: boolean
    }
  }
  buttonSettings?: {
    [key in IChromeExtensionButtonSettingKey]: IChromeExtensionButtonSetting
  }
  thirdProviderSettings?: {
    [P in IAIProviderType]?: IThirdProviderSettings[P]
  }
  lastModified?: number
  // TODO remove this
  contextMenus?: IContextMenuItem[]
  gmailToolBarContextMenu?: IContextMenuItem[]
}

export type IChromeExtensionSettingsUpdateFunction = (
  settings: IChromeExtensionSettings,
) => IChromeExtensionSettings
