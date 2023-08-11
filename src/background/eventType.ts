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
  | 'Client_listenUploadFilesChange'
  | 'Client_listenUpdateConversationMessages'

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
  | 'Client_modifyMessages'
  | 'Client_getLiteConversation'
  | 'Client_updateConversation'
  | 'Client_openUrl'
  | 'Client_updateIcon'
  | 'Client_updateUseChatGPTAuthInfo'
  | 'Client_getUseChatGPTUserInfo'
  | 'Client_getUseChatGPTUserSubscriptionInfo'
  | 'Client_createAsyncTask'
  | 'Client_updateTabVisible'
  | 'Client_updateIframeInput'
  | 'Client_restartApp'
  | 'Client_logCallApiRequest'
  | 'Client_emitPricingHooks'
  | 'Client_getLiteChromeExtensionSettings'
  | 'Client_getContextMenuActions'
  // 上传文件相关
  | 'Client_chatUploadFiles'
  | 'Client_chatUploadFilesChange'
  | 'Client_chatRemoveFiles'
  | 'Client_chatClearFiles'
  | 'Client_chatAbortUploadFiles'
  | 'Client_chatGetFiles'
  | 'Client_chatGetUploadFileToken'

// chat.openai.com(daemon process) 监听task event
export type IOpenAIChatListenTaskEvent =
  | 'OpenAIDaemonProcess_ping'
  | 'OpenAIDaemonProcess_createConversation'
  | 'OpenAIDaemonProcess_removeConversation'
  | 'OpenAIDaemonProcess_askChatGPTQuestion'
  | 'OpenAIDaemonProcess_abortAskChatGPTQuestion'
  | 'OpenAIDaemonProcess_compileTemplate'
  | 'OpenAIDaemonProcess_pingFilesUpload'
  | 'OpenAIDaemonProcess_filesUpload'

// chat.openai.com(daemon process) 发送event
export type IOpenAIChatSendEvent =
  | 'OpenAIDaemonProcess_daemonProcessExist'
  | 'OpenAIDaemonProcess_setDaemonProcess'
  | 'OpenAIDaemonProcess_taskResponse'
  | 'OpenAIDaemonProcess_pong'
  | 'OpenAIDaemonProcess_daemonProcessSessionExpired'
  | 'Client_destroyWithLogout'
  | 'OpenAIDaemonProcess_pongFilesUpload'
  | 'OpenAIDaemonProcess_filesUploadResponse'

// chrome extension 监听event
export type IChromeExtensionListenEvent =
  | IOpenAIChatSendEvent
  | IChromeExtensionClientSendEvent
  | IShortCutsSendEvent

// chrome extension 发送 event
export type IChromeExtensionSendEvent = IChromeExtensionClientListenEvent
