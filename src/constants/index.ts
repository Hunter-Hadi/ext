// s3
import { MAXAI_CHROME_EXTENSION_ID } from '@/features/common/constants'

export const RESOURCES_URL = 'https://resources.usechatgpt.ai'
// env
export const APP_VERSION = String(process.env.APP_VERSION)
export const isProduction = String(process.env.NODE_ENV) === 'production'

// chrome extension
export const MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_ID`
/**
 * @description - 不能改CHROME_EXTENSION_DB_STORAGE_SAVE_KEY的值，否则数据不同步了
 */
export const CHROME_EXTENSION_DB_STORAGE_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_CLIENT_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_LOCAL_STORAGE_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_ON_BOARDING_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_APP_USECHATGPTAI_SAVE_KEY`
// iframe 不断获取session保持chat存活，每次开固定时间，所以local记录的是结束时间
export const CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY`
// chatgpt tabs windows id
export const CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_WINDOWS_ID_OF_CHATGPT_TAB`

// doc
export const CHROME_EXTENSION_MAIL_TO = `https://www.maxai.me/contact-us`

/**
 * MARK: 设计问题，历史遗留
 */
export const DEFAULT_AI_OUTPUT_LANGUAGE_ID =
  'the same language variety or dialect of the following text'

export const DEFAULT_AI_OUTPUT_LANGUAGE_VALUE =
  'the same language variety or dialect of the text'

/**
 * @deprecated - 不同的ai provider使用prefix产生效果不同，不再使用这个
 * @since - 2023-07-31
 */
export const CHAT_GPT_PROMPT_PREFIX = ``
/**
 * @deprecated - 不再用这个字段存储消息
 * @since - 2023-08-16
 */
export const CHAT_GPT_MESSAGES_RECOIL_KEY = 'CHAT_GPT_MESSAGES_RECOIL_KEY'
export const AI_PROVIDER_MAP = {
  OPENAI: 'OPENAI',
  USE_CHAT_GPT_PLUS: 'USE_CHAT_GPT_PLUS',
  OPENAI_API: 'OPENAI_API',
  BARD: 'BARD',
  BING: 'BING',
  CLAUDE: 'CLAUDE',
  POE: 'POE',
  MAXAI_CLAUDE: 'MAXAI_CLAUDE',
  MAXAI_GEMINI: 'MAXAI_GEMINI',
  MAXAI_DALLE: 'MAXAI_DALLE',
  MAXAI_FREE: 'MAXAI_FREE',
} as const

// app.maxai.me
export const APP_USE_CHAT_GPT_API_HOST = process.env.APP_USE_CHAT_GPT_API_HOST
export const APP_USE_CHAT_GPT_HOST = process.env.APP_USE_CHAT_GPT_HOST

// www.maxai.me
export const WWW_PROJECT_HOST = process.env.WWW_PROJECT_HOST

// openai
export const OPENAI_IFRAME_ID = `${MAXAI_CHROME_EXTENSION_ID}_OPENAI_IFRAME_ID`

// user settings
// 带侧边栏的整个宽度
export const CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH = 480
// 只有聊天框的宽度
export const CHROME_EXTENSION_CHAT_MESSAGE_BOX_WIDTH = 420

export const RELEASE_LOG_URL = 'https://twitter.com/MaxAI_HQ'

// context menu search text generate save key
export const CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY =
  'CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY'

// 240415: Set `Search` prompt_id to constants
export const ART__DALLE3_PROMPT_OPTIMIZATION__PROMPT_ID =
  '816e3fe0-bd04-418e-8f6e-d33d8c4dba67' // [Art] dalle3 prompt optimization
export const ART__TEXT_TO_IMAGE__PROMPT_ID =
  'f19e862d-e8bb-4b09-9220-6a9a395deb6f' // [Art] text to image（最终记录）
export const SEARCH__SMART_QUERY__PROMPT_ID =
  'b481731b-19e3-4713-8f0b-81fd7b2d5169' // [Search] smart query
export const SEARCH__READ_PAGE__PROMPT_ID =
  'cae761b7-3703-4ff9-83ab-527b7a24e53b' // [Search] smart query
export const SEARCH__ANSWER__PROMPT_ID = '73361add-2d6a-4bf3-b2a7-5097551653e7' // [Search] answer（最终记录）
export const SUMMARY__SLICED_TIMESTAMPED_SUMMARY__PROMPT_ID =
  'f6177317-8773-4036-be9b-5905116c855f' // [Summary] Sliced timestamped summary
