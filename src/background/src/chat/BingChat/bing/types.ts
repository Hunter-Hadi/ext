import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import { IAIProviderModel } from '@/features/chatgpt/types'
import dayjs from 'dayjs'

export enum BingConversationStyle {
  Creative = 'creative',
  Balanced = 'balanced',
  Precise = 'precise',
}
export const BING_CONVERSATION_STYLES = [
  {
    label: 'Creative',
    description: `Clear your conversation and start an original imaginative chat.`,
    value: BingConversationStyle.Creative,
  },
  {
    label: 'Balanced',
    description: `Clear your conversation and start an informative and friendly chat.`,
    value: BingConversationStyle.Balanced,
  },
  {
    label: 'Precise',
    description: `Clear your conversation and start a concise and straightforward chat.`,
    value: BingConversationStyle.Precise,
  },
]

export const BING_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-4',
    titleTag: '',
    value: 'gpt-4',
    maxTokens: 8192,
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(8192, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat. Will be updated with OpenAI's latest model iteration 2 weeks after it is released.`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
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
  onEvent: (event: Event) => void
  signal?: AbortSignal
}

export interface ConversationResponse {
  conversationId: string
  clientId: string
  conversationSignature: string
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
