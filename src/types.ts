const APP_ROOT_ID = `${process.env.APP_ENV}_ROOT`
const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'
export const ROOT_CONTAINER_ID = `${APP_ROOT_ID}`
export const ROOT_DAEMON_PROCESS_ID = `${APP_ROOT_ID}_DaemonProcess`
export const ROOT_CONTAINER_WRAPPER_ID = `${APP_ROOT_ID}_Wrapper`
export const ROOT_CHAT_BOX_INPUT_ID = `${APP_ROOT_ID}_ChatBox_Input`

// context menu
export const ROOT_CONTEXT_MENU_ID = `${APP_ROOT_ID}_Context_Menu`
export const ROOT_CONTEXT_MENU_PORTAL_ID = `${APP_ROOT_ID}_Context_Menu_Portal`
export const ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID = `${APP_ROOT_ID}_Context_Menu_Gmail_Toolbar`
export const ROOT_CONTEXT_MENU_CONTAINER_ID = `${APP_ROOT_ID}_Context_Menu_Container_ID`
// chrome extension id
export const CHROME_EXTENSION_POST_MESSAGE_ID = `CHROME_EXTENSION_${process.env.APP_ENV}_ID`

// doc
export const CHROME_EXTENSION_MAIL_TO = isEzMailApp
  ? `mailto:hello@ezmail.ai?subject=I have a question about EzMail.AI Chrome extension`
  : `mailto:hello@usechatgpt.ai?subject=I have a question about Use ChatGPT Chrome extension`
export const CHROME_EXTENSION_DOC_URL = isEzMailApp
  ? 'https://www.ezmail.ai'
  : 'https://www.usechatgpt.ai'
export const CHROME_EXTENSION_HOMEPAGE_URL = isEzMailApp
  ? 'https://www.ezmail.ai'
  : 'https://www.usechatgpt.ai'
