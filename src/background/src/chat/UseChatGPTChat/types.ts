// @docs - https://platform.openai.com/docs/models/gpt-4

import {
  MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  MAXAI_VISION_MODEL_UPLOAD_CONFIG,
} from '@/background/src/chat/constant'
import {
  IAIProviderModel,
  IAIResponseOriginalMessageMetaDeepRelatedData,
  IAIResponseSourceCitation,
} from '@/features/indexed_db/conversations/models/Message'
// import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
// import dayjs from 'dayjs'

export type IMaxAIChatGPTBackendAPIType =
  | 'chat_with_document'
  | 'chat_with_document/v2'
  | 'get_chatgpt_response'
  | 'get_summarize_response'
  | 'get_gemini_response'
  | 'get_freeai_chat_response'
  | 'get_claude_response'
  | 'get_image_generate_response'
  | 'use_prompt_action'
  | 'summary/v2/webpage'
  | 'summary/v2/pdf'
  | 'summary/v2/videosite'
  | 'summary/v2/email'

export type IMaxAIChatMessageContentType = 'text' | 'image_url'

export interface IMaxAIChatMessageContent {
  type: IMaxAIChatMessageContentType
  text?: string
  image_url?: {
    url: string
  }
}

/**
 * @description 发送给后端的消息格式
 *
 * @version 2.0 - 2023-12-25
 * @description 2.0 版本的消息格式，将会支持多种类型的消息，例如：图片、视频、音频等
 */

export interface IMaxAIRequestHistoryMessage {
  role: 'human' | 'ai' | 'generic' | 'system' | 'function'
  content: IMaxAIChatMessageContent[]
}

export type IMaxAIResponseStreamStatus = 'start' | 'in_progress' | 'complete'

export interface IMaxAIResponseStreamMessage {
  conversation_id?: string
  /**
   * @deprecated 历史版本，用citations代替
   */
  sources?: IAIResponseSourceCitation[]
  /**
   * citation相关信息
   */
  citations?: IAIResponseSourceCitation[]
  /**
   * related相关信息
   */
  related?: IAIResponseOriginalMessageMetaDeepRelatedData[]
  /**
   * ai response内容
   */
  text?: string
  /**
   * doc id针对短文summary问答的时候会返回这个
   */
  doc_id?: string
  /**
   * 当前stream的状态，以key区分当前正在输出的内容
   */
  streaming_status: IMaxAIResponseStreamStatus
  /**
   * @feature 目前是每批次是全量返回，考虑到数据量问题先预留这个字段
   */
  need_merge?: boolean
}

export const MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO = 'gpt-3.5-turbo'
export const MAXAI_CHATGPT_MODEL_GPT_4_TURBO = 'gpt-4-turbo-preview'
export const MAXAI_CHATGPT_MODEL_GPT_4O = 'gpt-4o'

export const USE_CHAT_GPT_PLUS_MODELS: IAIProviderModel[] = [
  {
    title: 'GPT-3.5-Turbo',
    titleTag: '',
    value: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
    maxTokens: 16384,
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t(`client:provider__chatgpt__model__gpt_3_5__description`),
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  // {
  //   title: 'gpt-4-turbo',
  //   titleTag: '',
  //   value: 'gpt-4-1106-preview',
  //   tags: [],
  //   poweredBy: 'OpenAI',
  //   description: (t) =>
  //     t('client:provider__openai_api__model__gpt_4_1106_preview__description'),
  //   maxTokens: 128000,
  //   permission: {
  //     sceneType: 'MAXAI_PAID_MODEL_GPT4_TURBO',
  //     roles: ['pro', 'elite'],
  //   },
  // },
  {
    title: 'GPT-3.5-Turbo-16k',
    titleTag: '',
    value: 'gpt-3.5-turbo-16k',
    maxTokens: 16384,
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t(`client:provider__chatgpt__model__gpt_3_5_16k__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_GPT3_5_16K',
    //   roles: ['pro', 'elite'],
    // },
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'GPT-4',
    titleTag: '',
    value: 'gpt-4',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4__description'),
    maxTokens: 8192,
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_GPT4',
    //   roles: ['pro', 'elite'],
    // },
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'GPT-4-Turbo',
    value: MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
    titleTag: 'Vision',
    tags: (currentConversationType) => {
      const tags = []
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__chatgpt__model__gpt_4_vision__description'),
    maxTokens: 128000,
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_GPT4_VISION',
    //   roles: ['pro', 'elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  // {
  //   title: 'gpt-4-32k',
  //   titleTag: '',
  //   value: 'gpt-4-32k',
  //   tags: [],
  //   descriptions: [
  //     {
  //       label: (t) =>
  //         t('client:provider__model__tooltip_card__label__max_token'),
  //       value: (t) =>
  //         `${numberWithCommas(32768, 0)} ${t(
  //           'client:provider__model__tooltip_card__label__max_token__suffix',
  //         )}`,
  //     },
  //     {
  //       label: (t) =>
  //         t('client:provider__model__tooltip_card__label__description'),
  //       value: (t) =>
  //         t('client:provider__openai_api__model__gpt_4_32k__description'),
  //     },
  //     {
  //       label: (t) =>
  //         t('client:provider__model__tooltip_card__label__training_date'),
  //       value: (t) =>
  //         `${t(
  //           'client:provider__model__tooltip_card__label__training_date__prefix',
  //         )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
  //     },
  //   ],
  //   maxTokens: 32768,
  //   permission: {
  //     sceneType: 'MAXAI_PAID_MODEL_GPT4',
  //     roles: ['pro', 'elite'],
  //   },
  // },
  {
    title: 'GPT-4o',
    value: MAXAI_CHATGPT_MODEL_GPT_4O,
    titleTag: 'New',
    tags: ['New', 'Vision'],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__chatgpt__model__gpt_4o__description'),
    maxTokens: 128000,
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
]
