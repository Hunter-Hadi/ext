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

// ezmail reply group
export const EZMAIL_REPLY_GROUP_ID = `EzMail_Reply_Group`
// ezmail new email group
export const EZMAIL_NEW_MAIL_GROUP_ID = `EzMail_New_Mail_Group`
// ezmail new email cta button
export const EZMAIL_NEW_EMAIL_CTA_BUTTON_ID = `EzMail_New_Mail_CTA_Button`
// ezmail reply cta button
export const EZMAIL_REPLY_CTA_BUTTON_ID = `EzMail_Reply_CTA_Button`

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

// doc
export const CHROME_EXTENSION_MAIL_TO = isEzMailApp
  ? `mailto:hello@ezmail.ai?subject=I have a question about EzMail.AI Chrome extension`
  : `https://www.usechatgpt.ai/contact-us`
export const CHROME_EXTENSION_DOC_URL = isEzMailApp
  ? 'https://www.ezmail.ai'
  : 'https://app.usechatgpt.ai'

export const CHROME_EXTENSION_HOMEPAGE_URL = isEzMailApp
  ? 'https://www.ezmail.ai'
  : 'https://www.usechatgpt.ai'

export const DEFAULT_AI_OUTPUT_LANGUAGE_VALUE =
  'the same language variety or dialect of the following text'

// chat gpt config
export const CHAT_GPT_PROMPT_PREFIX = `\`reset\`\n\`no quotes\`\n\`no explanations\`\n\`no prompt\`\n\`no self-reference\`\n\`no apologies\`\n\`no filler\`\n\`just answer\`\n`
export const CHAT_GPT_MESSAGES_RECOIL_KEY = 'CHAT_GPT_MESSAGES_RECOIL_KEY'
export const CHAT_GPT_PROVIDER = {
  OPENAI: 'OPENAI',
  USE_CHAT_GPT_PLUS: 'USE_CHAT_GPT_PLUS',
  OPENAI_API: 'OPENAI_API',
  BARD: 'BARD',
  BING: 'BING',
  CLAUDE: 'CLAUDE',
} as const

// app.usechatgpt.ai
export const APP_USE_CHAT_GPT_API_HOST = process.env.APP_USE_CHAT_GPT_API_HOST
export const APP_USE_CHAT_GPT_HOST = process.env.APP_USE_CHAT_GPT_HOST
// AI 回答速度设置
export const BACKGROUND_SEND_TEXT_SPEED_SETTINGS =
  'BACKGROUND_SEND_TEXT_SPEED_SETTINGS'

// openai
export const OPENAI_IFRAME_ID = `${APP_ENV}_OPENAI_IFRAME_ID`
export const OPENAI_API_MODELS = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-32k']
export const OPENAI_LOCAL_STORAGE_OPENAI_API_SETTINGS_SAVE_KEY = `CHROME_EXTENSION_${APP_ENV}_OPENAI_API_SETTINGS_SAVE_KEY`

// user settings
export const CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH = 450
