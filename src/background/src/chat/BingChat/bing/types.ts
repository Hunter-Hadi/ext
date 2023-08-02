import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import { IAIProviderModel } from '@/features/chatgpt/types'
import dayjs from 'dayjs'
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
    title: 'gpt-4',
    titleTag: '',
    value: 'gpt-4',
    maxTokens: 8192,
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(8192, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__bing_web_app__model__gpt_4__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    // TODO - bing的文件上传需要校验origin和referrer，需要新的chrome extension permission, 目前搁置
    // uploadFileConfig: {
    //   accept: 'image/gif, image/jpeg, image/png, image/webp',
    //   acceptTooltip: t => t('client:provider__bing_web_app__upload__accept_tooltip'),
    //   maxFileSize: 5 * 1024 * 1024,
    //   maxCount: 1,
    // },
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
