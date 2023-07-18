import { IChatGPTProviderType } from '@/background/provider/chat'
import { CHAT_GPT_PROVIDER } from '@/constants'
import { BingConversationStyle } from '@/background/src/chat/BingChat/bing/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'

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
  [CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS]?: {
    model?: string
  }
  [CHAT_GPT_PROVIDER.OPENAI]?: {
    model?: string
  }
  [CHAT_GPT_PROVIDER.OPENAI_API]?: {
    temperature?: number
    model?: string
    apiKey?: string
    apiHost?: string
  }
  [CHAT_GPT_PROVIDER.BING]?: {
    model?: string
    conversationStyle?: BingConversationStyle
  }
  [CHAT_GPT_PROVIDER.BARD]?: {
    model?: string
  }
  [CHAT_GPT_PROVIDER.CLAUDE]?: {
    model?: string
  }
  [CHAT_GPT_PROVIDER.POE]: {
    model?: string
  }
}

export type IChromeExtensionButtonSettingKey =
  | 'gmailButton'
  | 'textSelectPopupButton'

export interface IVisibilitySetting {
  isWhitelistMode: boolean
  whitelist: string[]
  blacklist: string[]
}

export interface IChromeExtensionButtonSetting {
  contextMenu: IContextMenuItem[]
  visibility: IVisibilitySetting
}

export interface IChromeExtensionSettings {
  chatGPTProvider?: IChatGPTProviderType
  models?: IChatGPTModelType[]
  plugins?: IChatGPTPluginType[]
  currentModel?: string
  currentPlugins?: string[]
  conversationId?: string
  contextMenus?: IContextMenuItem[]
  gmailToolBarContextMenu?: IContextMenuItem[]
  userSettings?: {
    chatBoxWidth?: number
    colorSchema?: 'light' | 'dark'
    language?: string
    /**
     * @deprecated
     */
    // selectionButtonVisible?: boolean
    chatGPTStableModeDuration?: number
    pdf?: {
      enabled?: boolean
    }
    // TODO remove this
    gmailAssistant?: boolean
    // shortcut hint
    shortcutHintEnable?: boolean
  }
  buttonSettings?: {
    [key in IChromeExtensionButtonSettingKey]: IChromeExtensionButtonSetting
  }
  thirdProviderSettings?: {
    [P in IChatGPTProviderType]?: IThirdProviderSettings[P]
  }
  lastModified?: number
}

export type IChromeExtensionSettingsUpdateFunction = (
  settings: IChromeExtensionSettings,
) => IChromeExtensionSettings
