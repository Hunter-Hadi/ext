import { IAIProviderType } from '@/background/provider/chat'
import { ISidebarConversationType } from '@/features/sidebar/store'

export type AIProviderModelSelectorOption = {
  dev?: boolean
  beta?: boolean
  mainPart?: boolean
  label: string
  value: string
  AIProvider: IAIProviderType
}
export const ChatAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] = [
  {
    dev: true,
    mainPart: true,
    label: 'Free AI',
    value: 'mistral-7b-instruct',
    AIProvider: 'MAXAI_FREE',
  },
  {
    beta: false,
    mainPart: true,
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
    AIProvider: 'USE_CHAT_GPT_PLUS',
  },
  {
    mainPart: true,
    label: 'gpt-4-turbo',
    value: 'gpt-4-1106-preview',
    AIProvider: 'USE_CHAT_GPT_PLUS',
  },
  {
    mainPart: true,
    label: 'gpt-4-vision',
    value: 'gpt-4-vision-preview',
    AIProvider: 'USE_CHAT_GPT_PLUS',
  },
  {
    mainPart: true,
    label: 'claude-2.1-200k',
    value: 'claude-v2:1',
    AIProvider: 'MAXAI_CLAUDE',
  },
  {
    beta: true,
    mainPart: true,
    label: 'gemini-pro',
    value: 'gemini-pro',
    AIProvider: 'MAXAI_GEMINI',
  },
  {
    mainPart: true,
    label: 'claude-instant-100k',
    value: 'claude-instant-v1',
    AIProvider: 'MAXAI_CLAUDE',
  },
  {
    mainPart: true,
    label: 'claude-2-100k',
    value: 'claude-2',
    AIProvider: 'MAXAI_CLAUDE',
  },
  {
    mainPart: true,
    label: 'gpt-3.5-turbo-16k',
    value: 'gpt-3.5-turbo-16k',
    AIProvider: 'USE_CHAT_GPT_PLUS',
  },
  {
    mainPart: true,
    label: 'gpt-4',
    value: 'gpt-4',
    AIProvider: 'USE_CHAT_GPT_PLUS',
  },
]

export const ArtAIProviderModelSelectorOptions: AIProviderModelSelectorOption[] = [
  {
    mainPart: true,
    label: 'DALL·E 3',
    value: 'dall-e-3',
    AIProvider: 'MAXAI_DALLE',
  },
]

export const getAIProviderModelSelectorOptions = (
  conversationType: ISidebarConversationType,
) => {
  switch (conversationType) {
    case 'Chat':
      return ChatAIProviderModelSelectorOptions
    case 'Summary':
      return []
    case 'Search':
      return []
    case 'Art':
      return ArtAIProviderModelSelectorOptions
  }
}
