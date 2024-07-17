import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'
import { I18nextKeysType } from '@/i18next'

export enum BingConversationStyle {
  Creative = 'creative',
  Balanced = 'balanced',
  Precise = 'precise',
}
export const BING_CONVERSATION_STYLES: Array<{
  label: I18nextKeysType
  description: I18nextKeysType
  value: BingConversationStyle
}> = [
  {
    label: 'client:provider__bing_web_app__conversation_style__creative__title',
    description: `client:provider__bing_web_app__conversation_style__creative__description`,
    value: BingConversationStyle.Creative,
  },
  {
    label: 'client:provider__bing_web_app__conversation_style__balanced__title',
    description: `client:provider__bing_web_app__conversation_style__balanced__description`,
    value: BingConversationStyle.Balanced,
  },
  {
    label: 'client:provider__bing_web_app__conversation_style__precise__title',
    description: `client:provider__bing_web_app__conversation_style__precise__description`,
    value: BingConversationStyle.Precise,
  },
]

export const BING_MODELS: IAIProviderModel[] = [
  {
    title: 'Copilot',
    titleTag: '',
    value: 'gpt-4', // 'gpt-4-turbo',
    maxTokens: 128000,
    tags: [],
    poweredBy: 'Microsoft',
    description: (t) =>
      t('client:provider__bing_web_app__model__gpt_4__description'),
    uploadFileConfig: {
      accept: 'image/gif, image/jpeg, image/png, image/webp',
      acceptTooltip: (t) =>
        t('client:provider__bing_web_app__upload__accept_tooltip'),
      maxFileSize: 5 * 1024 * 1024,
      maxCount: 1,
    },
  },
]

export type Event =
  | {
      type: 'UPDATE_ANSWER'
      data: {
        conversationId: string
        text: string
      }
    }
  | {
      type: 'DONE'
      data: {
        conversationId: string
      }
    }
  | {
      type: 'ERROR'
      error: string
    }

export interface SendMessageParams {
  prompt: string
  imageUrl?: string
  onEvent: (event: Event) => void
  signal?: AbortSignal
  clientTabId?: number
}

export interface ConversationResponse {
  conversationId: string
  clientId: string
  conversationSignature: string
  encryptedConversationSignature?: string
  result: {
    value: string
    message: null
  }
}

export enum InvocationEventType {
  Invocation = 1,
  StreamItem = 2,
  Completion = 3,
  StreamInvocation = 4,
  CancelInvocation = 5,
  Ping = 6,
  Close = 7,
}

// https://github.com/bytemate/bingchat-api/blob/main/src/lib.ts

export interface ConversationInfo {
  conversationId: string
  clientId: string
  conversationSignature: string
  invocationId: number
  conversationStyle: BingConversationStyle
  encryptedConversationSignature?: string
}

export interface BingChatResponse {
  conversationSignature: string
  conversationId: string
  clientId: string
  invocationId: number
  conversationExpiryTime: Date
  response: string
  details: ChatResponseMessage
}

export interface ChatResponseMessage {
  text: string
  author: string
  createdAt: Date
  timestamp: Date
  messageId: string
  messageType?: string
  requestId: string
  offense: string
  adaptiveCards: AdaptiveCard[]
  sourceAttributions: SourceAttribution[]
  feedback: Feedback
  contentOrigin: string
  privacy: null
  suggestedResponses: SuggestedResponse[]
}

export interface AdaptiveCard {
  type: string
  version: string
  body: Body[]
}

export interface Body {
  type: string
  text: string
  wrap: boolean
  size?: string
}

export interface Feedback {
  tag: null
  updatedOn: null
  type: string
}

export interface SourceAttribution {
  providerDisplayName: string
  seeMoreUrl: string
  searchQuery: string
}

export interface SuggestedResponse {
  text: string
  author: string
  createdAt: Date
  timestamp: Date
  messageId: string
  messageType: string
  offense: string
  feedback: Feedback
  contentOrigin: string
  privacy: null
}

export async function generateMarkdown(response: BingChatResponse) {
  // change `[^Number^]` to markdown link
  const regex = /\[\^(\d+)\^\]/g
  const markdown = response.details.text.replace(regex, (match, p1) => {
    const sourceAttribution =
      response.details.sourceAttributions[Number(p1) - 1]
    return `[${sourceAttribution.providerDisplayName}](${sourceAttribution.seeMoreUrl})`
  })
  return markdown
}
