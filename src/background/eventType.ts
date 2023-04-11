// 守护进程监听event
export type IChromeExtensionChatGPTDaemonProcessListenEvent =
  | 'DaemonProcess_getChatGPTProxyInstanceResponse'
  | 'DaemonProcess_clientAsyncTask'
  | 'DaemonProcess_ping'
// 守护进程监听task event
export type IChromeExtensionChatGPTDaemonProcessListenTaskEvent =
  | 'DaemonProcess_createConversation'
  | 'DaemonProcess_removeConversation'
  | 'DaemonProcess_sendMessage'
  | 'DaemonProcess_abortMessage'
  | 'DaemonProcess_compileTemplate'
// 守护进程发送event
export type IChromeExtensionChatGPTDaemonProcessSendEvent =
  | 'DaemonProcess_daemonProcessExist'
  | 'DaemonProcess_initChatGPTProxyInstance'
  | 'DaemonProcess_updateSettings'
  | 'DaemonProcess_asyncTaskResponse'
  | 'DaemonProcess_updateCacheConversationId'
  | 'DaemonProcess_pong'
// 客户端监听进程
export type IChromeExtensionClientListenEvent =
  | 'Client_ChatGPTStatusUpdate'
  | 'Client_AsyncTaskResponse'
  | 'Client_ListenPong'
  | 'Client_ListenOpenChatMessageBox'
  | 'Client_getSettingsResponse'
  | 'Client_updateSettingsResponse'
  | 'Client_updateAppSettings'
// 客户端发送进程
export type IChromeExtensionClientSendEvent =
  | 'Client_Ping'
  | 'Client_createAsyncTask'
  | 'Client_checkChatGPTStatus'
  | 'Client_authChatService'
  | 'Client_openUrl'
  | 'Client_updateSettings'
  | 'Client_getSettings'
  | 'Client_updateIcon'

// chrome extension 监听event
export type IChromeExtensionListenEvent =
  | IChromeExtensionChatGPTDaemonProcessSendEvent
  | IChromeExtensionClientSendEvent
// chrome extension 发送 event
export type IChromeExtensionSendEvent =
  | IChromeExtensionChatGPTDaemonProcessListenEvent
  | IChromeExtensionClientListenEvent
