// s3
export const RESOURCES_URL = 'https://resources.usechatgpt.ai'
// env
export const APP_VERSION = String(process.env.APP_VERSION)
export const isProduction = String(process.env.NODE_ENV) === 'production'
// ID
export const MAXAI_CHROME_EXTENSION_ID = 'USE_CHAT_GPT_AI'
export const APP_ROOT_ID = `${MAXAI_CHROME_EXTENSION_ID}_ROOT`
export const ROOT_CONTAINER_ID = `${APP_ROOT_ID}`
export const ROOT_DAEMON_PROCESS_ID = `${APP_ROOT_ID}_DaemonProcess`
export const ROOT_CONTAINER_WRAPPER_ID = `${APP_ROOT_ID}_Wrapper`
export const ROOT_CHAT_BOX_INPUT_ID = `${APP_ROOT_ID}_ChatBox_Input`
export const ROOT_FLOATING_INPUT_ID = `${APP_ROOT_ID}_Floating_Input`
export const ROOT_FLOATING_REFERENCE_ELEMENT_ID = `${APP_ROOT_ID}_Floating_Reference_Element`
export const ROOT_CLIPBOARD_ID = `${APP_ROOT_ID}_Clipboard`
export const ROOT_MINIMIZE_CONTAINER_ID = `${APP_ROOT_ID}_Minimize_Container`

// context menu
export const ROOT_CONTEXT_MENU_ID = `${APP_ROOT_ID}_Context_Menu`
export const ROOT_CONTEXT_MENU_PORTAL_ID = `${APP_ROOT_ID}_Context_Menu_Portal`
export const ROOT_CONTEXT_MENU_CONTAINER_ID = `${APP_ROOT_ID}_Context_Menu_Container_ID`

// chrome extension
export const CHROME_EXTENSION_POST_MESSAGE_ID = `CHROME_EXTENSION_${MAXAI_CHROME_EXTENSION_ID}_ID`
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
export const CHROME_EXTENSION_DOC_URL = 'https://app.maxai.me'
export const CHROME_EXTENSION_HOMEPAGE_URL = 'https://www.maxai.me'

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
} as const

// app.maxai.me
export const APP_USE_CHAT_GPT_API_HOST = process.env.APP_USE_CHAT_GPT_API_HOST
export const APP_USE_CHAT_GPT_HOST = process.env.APP_USE_CHAT_GPT_HOST
// AI 回答速度设置
export const BACKGROUND_SEND_TEXT_SPEED_SETTINGS =
  'BACKGROUND_SEND_TEXT_SPEED_SETTINGS'

// openai
export const OPENAI_IFRAME_ID = `${MAXAI_CHROME_EXTENSION_ID}_OPENAI_IFRAME_ID`

// user settings
export const CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH = 450

export const RELEASE_LOG_URL = 'https://twitter.com/MaxAI_HQ'

// context menu search text generate save key
export const CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY =
  'CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY'
