/**
 * TODO 之后需要在某个版本里统一规范各个KEY的名称
 */

// s3
import { MAXAI_CHROME_EXTENSION_ID } from '@/features/common/constants'

export const RESOURCES_URL = 'https://resources.usechatgpt.ai'
// env
export const APP_VERSION = String(process.env.APP_VERSION)
export const isProduction = String(process.env.NODE_ENV) === 'production'
export const isProdAPI = String(process.env.API_ENV) === 'production'

// chrome extension
export const MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_ID`
/**
 * @description - 不能改CHROME_EXTENSION_DB_STORAGE_SAVE_KEY的值，否则数据不同步了
 */
export const CHROME_EXTENSION_DB_STORAGE_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_CLIENT_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_LOCAL_STORAGE_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_ON_BOARDING_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_APP_USECHATGPTAI_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_USER_QUOTA_USAGE_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_USER_FEATURE_QUOTA_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_PLAN_PRICING_SAVE_KEY`

// iframe 不断获取session保持chat存活，每次开固定时间，所以local记录的是结束时间
export const CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY`
// chatgpt tabs windows id
export const CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_WINDOWS_ID_OF_CHATGPT_TAB`

// doc
export const CHROME_EXTENSION_MAIL_TO = `https://www.maxai.me/contact-us`
// help
export const CHROME_EXTENSION_HELP_TO = 'https://www.maxai.me/learning-center'

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
  MAXAI_LLAMA: 'MAXAI_LLAMA',
  MAXAI_MISTRAL: 'MAXAI_MISTRAL',
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
export const CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH = 520
// 只有聊天框的宽度
export const CHROME_EXTENSION_CHAT_MESSAGE_BOX_WIDTH = 420
export const CHROME_EXTENSION_FLOATING_CONTEXT_MENU_MIN_WIDTH = 768

export const RELEASE_LOG_URL = 'https://twitter.com/MaxAI_HQ'

// context menu search text generate save key
export const CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY =
  'CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY'

// 240415: Set `Search` prompt_id to constants
// [Art]
export const ART__DALLE3_PROMPT_OPTIMIZATION__PROMPT_ID =
  '816e3fe0-bd04-418e-8f6e-d33d8c4dba67' // [Art] dalle3 prompt optimization
export const ART__TEXT_TO_IMAGE__PROMPT_ID =
  'f19e862d-e8bb-4b09-9220-6a9a395deb6f' // [Art] text to image（最终记录）

// [Search]
export const SEARCH__SMART_QUERY__PROMPT_ID =
  'b481731b-19e3-4713-8f0b-81fd7b2d5169' // [Search] smart query
export const SEARCH__READ_PAGE__PROMPT_ID =
  'cae761b7-3703-4ff9-83ab-527b7a24e53b' // [Search] read page
export const SEARCH__ANSWER__PROMPT_ID = '73361add-2d6a-4bf3-b2a7-5097551653e7' // [Search] answer（最终记录）

// [Summary]
export const SUMMARY__SUMMARIZE_PAGE__PROMPT_ID =
  'f734efe5-c63e-490e-a0f1-ae5a248e0f16' // [Summary] Summarize page
export const SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID =
  '4df133ba-b4f5-421c-989c-a2e0f0340061' // [Summary] Summarize page (TL:DR)
export const SUMMARY__SUMMARIZE_PAGE__KEY_TAKEAWAYS__PROMPT_ID =
  'f46cd57b-8f9d-4c66-9f8a-d9631068f61a' // [Summary] Summarize page (Key takeaways)
export const SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID =
  '8ed1bf33-efc9-4714-8b21-09ceede3e2a8' // [Summary] Summarize email
export const SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID =
  '71a59198-b0d8-4d5a-ba4f-42795b7e3318' // [Summary] Summarize email (TL:DR)
export const SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID =
  '2b754799-5704-4703-b533-ba4add9614aa' // [Summary] Summarize email (Key takeaways)
export const SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID =
  '5d4f32d1-450d-4412-a8ea-a6c64c43988c' // [Summary] Summarize email (Action items)
export const SUMMARY__SUMMARIZE_PDF__PROMPT_ID =
  '0c8c8bd7-1072-4fb7-9fad-cf6447b33896' // [Summary] Summarize PDF
export const SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID =
  '45ea67db-695b-4870-b467-981f137b2378' // [Summary] Summarize PDF (TL:DR)
export const SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID =
  '2d1dd5aa-1809-4aac-952d-ff07903eb7c5' // `[Summary] Summarize PDF (Key takeaways)`
export const SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID =
  '215bf574-3a68-4ac8-8fff-ccdd19150cb9' // [Summary] Summarize video
export const SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID =
  '2cb58619-3822-4d6a-8f7f-0c38d01f231e' // [Summary] Timestamped summary
export const SUMMARY__SLICED_TIMESTAMPED_SUMMARY__PROMPT_ID =
  'f6177317-8773-4036-be9b-5905116c855f' // [Summary] Sliced timestamped summary
export const SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID =
  '5278969d-1d86-4df2-a3e8-48e50dbbd86e' // [Summary] Summarize comments
export const SUMMARY__SHOW_TRANSCRIPT__PROMPT_ID =
  '029d848d-7c28-4a3a-baae-353292ea7691' // [Summary] Show transcript
export const SUMMARY__SUMMARIZE_VIDEO__KEY_TAKEAWAYS__PROMPT_ID =
  '43cdd0bf-c900-4553-a252-20e5a0b13ffc' // [Summary] Summarize video (Key takeaways)`
export const SUMMARY__RELATED_QUESTIONS__PROMPT_ID =
  'bce1c389-062c-4e78-8db1-972a4434151e'
export const SUMMARY__CITATION__PROMPT_ID =
  'b04b796f-84d8-40cc-a1d7-e7564a8e103d'
// Send notification
export const NOTIFICATION__SUMMARY__TOKENS_HAVE_REACHED_MAXIMUM_LIMIT__UUID =
  '95fbacd5-f4a6-4fca-9d77-ac109ae4a94a' // [Summary] tokens have reached maximum limit

export const CHAT__AI_MODEL__SUGGESTION__PROMPT_ID = `90bb5983-9912-4b2a-8d5b-1b2510d857b6`

/**
 * ChatGPT Webapp Hosts
 */
export const CHATGPT_WEBAPP_HOSTS = ['chatgpt.com', 'chat.openai.com']
export const CHATGPT_WEBAPP_HOST = CHATGPT_WEBAPP_HOSTS[0]

export const PRESET_PROMPT_IDS = [
  // Art prompt id
  ART__DALLE3_PROMPT_OPTIMIZATION__PROMPT_ID,
  ART__TEXT_TO_IMAGE__PROMPT_ID,

  // Search prompt id
  SEARCH__SMART_QUERY__PROMPT_ID,
  SEARCH__READ_PAGE__PROMPT_ID,
  SEARCH__ANSWER__PROMPT_ID,

  // Summary prompt id
  SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
  SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
  SUMMARY__SLICED_TIMESTAMPED_SUMMARY__PROMPT_ID,
  SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
  SUMMARY__SHOW_TRANSCRIPT__PROMPT_ID,
  SUMMARY__RELATED_QUESTIONS__PROMPT_ID,
  SUMMARY__CITATION__PROMPT_ID,

  // Chat prompt id
  CHAT__AI_MODEL__SUGGESTION__PROMPT_ID,
]

export const LOVED_BY_NUM = '1M+'

export const STAR_RATINGS_NUM = '13K+'

export const APP_EMAIL = 'hello@maxai.me'
export const APP_EMAIL_LINK = `mailto:${APP_EMAIL}`
