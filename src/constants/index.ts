// s3
export const RESOURCES_URL = 'https://resources.usechatgpt.ai'
// env
export const APP_ENV = String(process.env.APP_ENV)
export const APP_NAME = String(process.env.APP_NAME)
export const APP_VERSION = String(process.env.APP_VERSION)
export const isEzMailApp = String(APP_ENV) === 'EZ_MAIL_AI'
export const isProduction = String(process.env.NODE_ENV) === 'production'
// ID
export const APP_ROOT_ID = `${APP_ENV}_ROOT`
export const ROOT_CONTAINER_ID = `${APP_ROOT_ID}`
export const ROOT_DAEMON_PROCESS_ID = `${APP_ROOT_ID}_DaemonProcess`
export const ROOT_CONTAINER_WRAPPER_ID = `${APP_ROOT_ID}_Wrapper`
export const ROOT_CHAT_BOX_INPUT_ID = `${APP_ROOT_ID}_ChatBox_Input`
export const ROOT_FLOATING_INPUT_ID = `${APP_ROOT_ID}_Floating_Input`
export const ROOT_FLOATING_REFERENCE_ELEMENT_ID = `${APP_ROOT_ID}_Floating_Reference_Element`
export const ROOT_CLIPBOARD_ID = `${APP_ROOT_ID}_Clipboard`

// ezmail reply group
export const EZMAIL_REPLY_GROUP_ID = `EzMail_Reply_Group`
// ezmail new email group
export const EZMAIL_NEW_MAIL_GROUP_ID = `EzMail_New_Mail_Group`
// usechatgpt gmail new email cta button
export const USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID = `29aa9f2c-8aac-4251-8c4f-6074ca409ac7`
// usechatgpt gmail reply cta button
export const USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID = `93de409e-c22b-4e6c-8d13-fd60c00532ea`

// context menu
export const ROOT_CONTEXT_MENU_ID = `${APP_ROOT_ID}_Context_Menu`
export const ROOT_CONTEXT_MENU_PORTAL_ID = `${APP_ROOT_ID}_Context_Menu_Portal`
export const ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID = `${APP_ROOT_ID}_Context_Menu_Gmail_Toolbar`
export const ROOT_CONTEXT_MENU_CONTAINER_ID = `${APP_ROOT_ID}_Context_Menu_Container_ID`

// chrome extension
export const CHROME_EXTENSION_POST_MESSAGE_ID = `CHROME_EXTENSION_${APP_ENV}_ID`
export const CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY = `CHROME_EXTENSION_${APP_ENV}_CLIENT_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY = `CHROME_EXTENSION_${APP_ENV}_ON_BOARDING_SAVE_KEY`
export const CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY = `CHROME_EXTENSION_${APP_ENV}_APP_USECHATGPTAI_SAVE_KEY`
// iframe 不断获取session保持chat存活，每次开固定时间，所以local记录的是结束时间
export const CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY = `CHROME_EXTENSION_${APP_ENV}_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY`
// chatgpt tabs windows id
export const CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB = `CHROME_EXTENSION_${APP_ENV}_WINDOWS_ID_OF_CHATGPT_TAB`

// doc
export const CHROME_EXTENSION_MAIL_TO = isEzMailApp
  ? `mailto:hello@ezmail.ai?subject=I have a question about EzMail.AI Chrome extension`
  : `https://www.maxai.me/contact-us`
export const CHROME_EXTENSION_DOC_URL = isEzMailApp
  ? 'https://www.ezmail.ai'
  : 'https://app.maxai.me'

export const CHROME_EXTENSION_HOMEPAGE_URL = isEzMailApp
  ? 'https://www.ezmail.ai'
  : 'https://www.maxai.me'

export const DEFAULT_AI_OUTPUT_LANGUAGE_VALUE =
  'the same language variety or dialect of the following text'

// chat gpt config
export const CHAT_GPT_GPT4_ARKOSE_TOKEN = 'CHAT_GPT_GPT4_ARKOSE_TOKEN'
export const CHAT_GPT_GPT4_ARKOSE_TOKEN_KEY =
  '35536E1E-65B4-4D96-9D97-6ADB7EFF8147'
/**
 * @deprecated - 不同的ai provider使用prefix产生效果不同，不再使用这个
 * @since - 2023-07-31
 */
export const CHAT_GPT_PROMPT_PREFIX = ``
export const CHAT_GPT_MESSAGES_RECOIL_KEY = 'CHAT_GPT_MESSAGES_RECOIL_KEY'
export const AI_PROVIDER_MAP = {
  OPENAI: 'OPENAI',
  USE_CHAT_GPT_PLUS: 'USE_CHAT_GPT_PLUS',
  OPENAI_API: 'OPENAI_API',
  BARD: 'BARD',
  BING: 'BING',
  CLAUDE: 'CLAUDE',
  POE: 'POE',
} as const

// app.maxai.me
export const APP_USE_CHAT_GPT_API_HOST = process.env.APP_USE_CHAT_GPT_API_HOST
export const APP_USE_CHAT_GPT_HOST = process.env.APP_USE_CHAT_GPT_HOST
// AI 回答速度设置
export const BACKGROUND_SEND_TEXT_SPEED_SETTINGS =
  'BACKGROUND_SEND_TEXT_SPEED_SETTINGS'

// openai
export const OPENAI_IFRAME_ID = `${APP_ENV}_OPENAI_IFRAME_ID`

// user settings
export const CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH = 450

export const RELEASE_LOG_URL = 'https://twitter.com/MaxAI_HQ'
