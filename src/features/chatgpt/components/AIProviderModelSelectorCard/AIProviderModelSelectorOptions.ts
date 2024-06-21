import { IAIProviderType } from '@/background/provider/chat'
import {
  MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4O,
} from '@/background/src/chat/UseChatGPTChat/types'
import { ISidebarConversationType } from '@/features/sidebar/types'

export type AIProviderModelSelectorOption = {
  tag?: string
  disabled?: boolean
  mainPart?: boolean
  label: string
  value: string
  AIProvider: IAIProviderType
  // 隐藏，不在页面用显示
  hidden?: boolean
}
export const ChatAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] =
  [
    {
      mainPart: true,
      label: 'gpt-3.5-turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'gpt-4o',
      value: MAXAI_CHATGPT_MODEL_GPT_4O,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      tag: 'New',
    },
    {
      mainPart: true,
      label: 'claude-3.5-sonnet',
      value: 'claude-3-5-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
      tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'claude-3-opus',
      value: 'claude-3-opus',
      AIProvider: 'MAXAI_CLAUDE',
      // tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'claude-3-sonnet',
      value: 'claude-3-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
      // tag: 'Vision',
    },
    {
      mainPart: true,
      label: 'claude-3-haiku',
      value: 'claude-3-haiku',
      AIProvider: 'MAXAI_CLAUDE',
      // tag: 'Vision',
    },
    {
      tag: 'Beta',
      mainPart: true,
      label: 'gemini-1.5-pro',
      value: 'gemini-1.5-pro',
      AIProvider: 'MAXAI_GEMINI',
    },
    {
      // tag: 'Beta',
      mainPart: true,
      label: 'gemini-pro',
      value: 'gemini-pro',
      AIProvider: 'MAXAI_GEMINI',
    },
    {
      mainPart: true,
      label: 'claude-2.1-200k',
      value: 'claude-v2:1',
      AIProvider: 'MAXAI_CLAUDE',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'claude-2-100k',
      value: 'claude-2',
      AIProvider: 'MAXAI_CLAUDE',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'claude-instant-100k',
      value: 'claude-instant-v1',
      AIProvider: 'MAXAI_CLAUDE',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'gpt-3.5-turbo-16k',
      value: 'gpt-3.5-turbo-16k',
      AIProvider: 'USE_CHAT_GPT_PLUS',
      hidden: true,
    },
    {
      mainPart: true,
      label: 'gpt-4-turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'gpt-4',
      value: 'gpt-4',
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      tag: 'Free',
      label: 'Free AI',
      value: 'mistral-7b-instruct',
      AIProvider: 'MAXAI_FREE',
    },
  ]

export const SearchAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] =
  [
    {
      mainPart: true,
      label: 'gpt-3.5-turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      mainPart: true,
      label: 'gpt-4o',
      value: MAXAI_CHATGPT_MODEL_GPT_4O,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      tag: 'New',
    },
    {
      mainPart: true,
      label: 'claude-3.5-sonnet',
      value: 'claude-3-5-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
      tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'claude-3-opus',
      value: 'claude-3-opus',
      AIProvider: 'MAXAI_CLAUDE',
      // tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'claude-3-sonnet',
      value: 'claude-3-sonnet',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'claude-3-haiku',
      value: 'claude-3-haiku',
      AIProvider: 'MAXAI_CLAUDE',
    },
    {
      mainPart: true,
      label: 'gemini-1.5-pro',
      value: 'gemini-1.5-pro',
      AIProvider: 'MAXAI_GEMINI',
      // tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'gemini-pro',
      value: 'gemini-pro',
      AIProvider: 'MAXAI_GEMINI',
      // tag: 'Beta',
    },
    {
      mainPart: true,
      label: 'gpt-4-turbo',
      value: MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      AIProvider: 'USE_CHAT_GPT_PLUS',
      // tag: 'Vision',
    },
    {
      mainPart: true,
      label: 'gpt-4',
      value: 'gpt-4',
      AIProvider: 'USE_CHAT_GPT_PLUS',
    },
    {
      label: 'Free AI',
      value: 'mistral-7b-instruct',
      AIProvider: 'MAXAI_FREE',
      tag: 'Free',
    },
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
