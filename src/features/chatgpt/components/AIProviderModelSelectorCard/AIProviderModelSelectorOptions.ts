import { IAIProviderType } from '@/background/provider/chat'
import {
  MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4O,
  MAXAI_CHATGPT_MODEL_GPT_4O_MINI,
} from '@/background/src/chat/UseChatGPTChat/types'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { I18nextKeysType } from '@/i18next'

export type AIProviderModelSelectorOption = {
  tag?: string
  disabled?: boolean
  mainPart?: boolean
  label: string
  value: string
  AIProvider: IAIProviderType
  group?: I18nextKeysType
  // 隐藏，不在页面用显示
  hidden?: boolean
}
export const ChatAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] =
  [
    // free-start
    {
      tag: 'Free',
      label: 'Free AI',
      value: 'mistral-7b-instruct',
      AIProvider: 'MAXAI_FREE',
      group: 'client:sidebar__ai_provider__model_selector__free_group__title',
    },
    // free-end
    // fast-start
    {
      mainPart: true,
      label: 'GPT-4o-mini',
      value: MAXAI_CHATGPT_MODEL_GPT_4O_MINI,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      tag: 'New',
      group: 'client:sidebar__ai_provider__model_selector__fast_group__title',
    },
    {
      mainPart: true,
      label: 'Claude-3-Haiku',
      value: 'claude-3-haiku',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'Gemini-1.5-Flash',
      value: 'gemini-flash-1.5',
      AIProvider: 'MAXAI_GEMINI',
      tag: 'Beta',
    },
    // fast-end
    // smart-start
    {
      mainPart: true,
      label: 'GPT-4o',
      value: MAXAI_CHATGPT_MODEL_GPT_4O,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      tag: 'New',
      group: 'client:sidebar__ai_provider__model_selector__smart_group__title',
    },
    {
      mainPart: true,
      label: 'Claude-3.5-Sonnet',
      value: 'claude-3-5-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
      tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'Gemini-1.5-Pro',
      value: 'gemini-1.5-pro',
      AIProvider: 'MAXAI_GEMINI',
    },
    // smart-end
    // legacy-start
    {
      mainPart: true,
      label: 'GPT-3.5-Turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      group: 'client:sidebar__ai_provider__model_selector__legacy_group__title',
    },
    {
      mainPart: true,
      label: 'Claude-3-Opus',
      value: 'claude-3-opus',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'Claude-3-Sonnet',
      value: 'claude-3-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'GPT-4-Turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'GPT-4',
      value: 'gpt-4',
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'Gemini-Pro',
      value: 'gemini-pro',
      AIProvider: 'MAXAI_GEMINI',
    },
    {
      mainPart: true,
      label: 'Claude-2.1-200k',
      value: 'claude-v2:1',
      AIProvider: 'MAXAI_CLAUDE',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'Claude-2-100k',
      value: 'claude-2',
      AIProvider: 'MAXAI_CLAUDE',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'Claude-instant-100k',
      value: 'claude-instant-v1',
      AIProvider: 'MAXAI_CLAUDE',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'GPT-3.5-turbo-16k',
      value: 'gpt-3.5-turbo-16k',
      AIProvider: 'USE_CHAT_GPT_PLUS',
      hidden: true,
    },
    // legacy-end
  ]

export const SearchAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] =
  [
    // free-start
    {
      label: 'Free AI',
      value: 'mistral-7b-instruct',
      AIProvider: 'MAXAI_FREE',
      tag: 'Free',
      group: 'client:sidebar__ai_provider__model_selector__free_group__title',
    },
    // free-end
    // fast-start
    {
      mainPart: true,
      label: 'GPT-4o-mini',
      value: MAXAI_CHATGPT_MODEL_GPT_4O_MINI,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      tag: 'New',
      group: 'client:sidebar__ai_provider__model_selector__fast_group__title',
    },
    {
      mainPart: true,
      label: 'Claude-3-Haiku',
      value: 'claude-3-haiku',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'Gemini-1.5-Flash',
      value: 'gemini-flash-1.5',
      AIProvider: 'MAXAI_GEMINI',
      tag: 'Beta',
    },
    // fast-end
    // smart-start
    {
      mainPart: true,
      label: 'GPT-4o',
      value: MAXAI_CHATGPT_MODEL_GPT_4O,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      tag: 'New',
      group: 'client:sidebar__ai_provider__model_selector__smart_group__title',
    },
    {
      mainPart: true,
      label: 'Claude-3.5-Sonnet',
      value: 'claude-3-5-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
      tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'Gemini-1.5-Pro',
      value: 'gemini-1.5-pro',
      AIProvider: 'MAXAI_GEMINI',
    },
    // smart-end
    // legacy-start
    {
      mainPart: true,
      label: 'GPT-3.5-Turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      group: 'client:sidebar__ai_provider__model_selector__legacy_group__title',
    },
    {
      mainPart: true,
      label: 'Claude-3-Opus',
      value: 'claude-3-opus',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'Claude-3-Sonnet',
      value: 'claude-3-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'GPT-4-Turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'GPT-4',
      value: 'gpt-4',
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'Gemini-Pro',
      value: 'gemini-pro',
      AIProvider: 'MAXAI_GEMINI',
    },
    // legacy-end
  ]

export const ArtAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] =
  [
    {
      mainPart: true,
      label: 'DALL·E 3',
      value: 'dall-e-3',
      AIProvider: 'MAXAI_DALLE',
    },
  ]

/**
 * 获取AIModel的显示名称
 * @param AIModel
 */
export const getAIModelShowLabel = (AIModel: string) => {
  return (
    ChatAIProviderModelSelectorOptions.find((model) => model.value === AIModel)
      ?.label ||
    SearchAIProviderModelSelectorOptions.find(
      (model) => model.value === AIModel,
    )?.label ||
    ArtAIProviderModelSelectorOptions.find((model) => model.value === AIModel)
      ?.label ||
    AIModel
  )
}

/**
 * 基于不同的会话类型，获取AIProviderModelSelectorOptions
 * @param conversationType
 */
export const getModelOptionsForConversationType = (
  conversationType: ISidebarConversationType,
) => {
  switch (conversationType) {
    case 'Chat':
      return ChatAIProviderModelSelectorOptions
    case 'Summary':
      return []
    case 'Search':
      return SearchAIProviderModelSelectorOptions
    case 'Art':
      return ArtAIProviderModelSelectorOptions
    case 'FAQ':
      return []
    case 'Memo':
      return []
    case 'ContextMenu':
      return ChatAIProviderModelSelectorOptions
    default:
      return []
  }
}
