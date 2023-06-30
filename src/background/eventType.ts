// 客户端监听event
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'

export type IChromeExtensionClientListenEvent =
  | 'Client_ChatGPTStatusUpdate'
  | 'Client_AsyncTaskResponse'
  | 'Client_askChatGPTQuestionResponse'
  | 'Client_pong'
  | 'Client_listenOpenChatMessageBox'
  | 'Client_getSettingsResponse'
  | 'Client_updateSettingsResponse'
  | 'Client_updateAppSettings'
  | 'Client_listenUpdateIframeInput'

// 客户端发送event
export type IChromeExtensionClientSendEvent =
  | 'Client_ping'
  | 'Client_getChromeExtensionCommands'
  | 'Client_checkChatGPTStatus'
  | 'Client_switchChatGPTProvider'
  | 'Client_authChatGPTProvider'
  | 'Client_createChatGPTConversation'
  | 'Client_removeChatGPTConversation'
  | 'Client_askChatGPTQuestion'
  | 'Client_abortAskChatGPTQuestion'
  | 'Client_openUrl'
  | 'Client_updateIcon'
  | 'Client_updateUseChatGPTAuthInfo'
  | 'Client_getUseChatGPTUserInfo'
  | 'Client_createAsyncTask'
  | 'Client_updateTabVisible'
  | 'Client_updateIframeInput'
  | 'Client_restartApp'

// chat.openai.com(daemon process) 监听task event
export type IOpenAIChatListenTaskEvent =
  | 'OpenAIDaemonProcess_ping'
  | 'OpenAIDaemonProcess_createConversation'
  | 'OpenAIDaemonProcess_removeConversation'
  | 'OpenAIDaemonProcess_askChatGPTQuestion'
  | 'OpenAIDaemonProcess_abortAskChatGPTQuestion'
  | 'OpenAIDaemonProcess_compileTemplate'
// chat.openai.com(daemon process) 发送event
export type IOpenAIChatSendEvent =
  | 'OpenAIDaemonProcess_daemonProcessExist'
  | 'OpenAIDaemonProcess_setDaemonProcess'
  | 'OpenAIDaemonProcess_taskResponse'
  | 'OpenAIDaemonProcess_pong'
  | 'Client_destroyWithLogout'

// chrome extension 监听event
export type IChromeExtensionListenEvent =
  | IOpenAIChatSendEvent
  | IChromeExtensionClientSendEvent
  | IShortCutsSendEvent

// chrome extension 发送 event
export type IChromeExtensionSendEvent = IChromeExtensionClientListenEvent
