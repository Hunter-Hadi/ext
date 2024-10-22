// 客户端监听event
import { ISearchWithAISendEvent } from '@/features/searchWithAI/background/eventType'
import {
  IShortCutsClientListenEvent,
  IShortCutsSendEvent,
} from '@/features/shortcuts/messageChannel/eventType'
import { IWebsiteContextSendEvent } from '@/features/websiteContext/eventType'

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
  | 'Client_ListenGetIframePageContentResponse'
  | 'Client_ListenProxyWebsocket'
  // 尝试更新客户端会受到sidebar影响的box的样式
  | 'Client_updateSidebarChatBoxStyle'
  | 'Client_listenTabUrlUpdate'
  // iframe
  | 'Iframe_ListenGetPageContent'
  // global video popup
  | 'Client_listenSwitchVideoPopup'
  // background 通知 client 更新 survey 状态
  | 'Client_listenSurveyStatusUpdated'
  | 'Client_listenPageTranslationEvent'

// 客户端发送event
export type IChromeExtensionClientSendEvent =
  | 'Client_ping'
  | 'Client_destroyWithLogout'
  | 'Client_backgroundRunFunction'
  | 'Client_disposeChatSystem'
  | 'Client_getChromeExtensionCommands'
  | 'Client_checkChatGPTStatus'
  | 'Client_AuthAIProvider'
  | 'Client_createChatGPTConversation'
  | 'Client_removeChatGPTConversation'
  | 'Client_askChatGPTQuestion'
  | 'Client_abortAskChatGPTQuestion'
  | 'Client_openUrl'
  | 'Client_closeUrl'
  | 'Client_updateIcon'
  | 'Client_emitCMDJ'
  | 'Client_updateUserSubscriptionInfo'
  | 'Client_updateUseChatGPTAuthInfo'
  | 'Client_getUseChatGPTUserInfo'
  | 'Client_getUseChatGPTUserSubscriptionInfo'
  | 'Client_getMaxAIUserQuotaUsageInfo'
  | 'Client_getUserFeatureQuotaInfo'
  | 'Client_createAsyncTask'
  | 'Client_updateTabVisible'
  | 'Client_updateIframeInput'
  | 'Client_restartApp'
  | 'Client_logCallApiRequest'
  | 'Client_logThirdPartyDailyUsage'
  | 'Client_getLiteChromeExtensionSettings'
  | 'Client_getContextMenuActions'
  | 'Client_getAllOldVersionConversationIds'
  | 'Client_proxyFetchAPI'
  | 'Client_abortProxyFetchAPI'
  | 'Client_getIframePageContent'
  | 'Client_ListenProxyWebsocketResponse'
  | 'Client_emitPricingHooks'
  // 上传文件相关
  | 'Client_chatUploadFiles'
  | 'Client_chatUploadFilesChange'
  | 'Client_chatRemoveFiles'
  | 'Client_chatClearFiles'
  | 'Client_chatAbortUploadFiles'
  | 'Client_chatGetFiles'
  | 'Client_chatGetUploadFileToken'
  // 记录用户信息
  | 'Client_logUserUsageInfo'
  // iframe
  | 'Iframe_sendPageContent'
  // global video popup
  | 'Client_switchVideoPopup'
  // 客户端使用conversationDB
  | 'Client_useIndexedDB'
  // 客户端获取 survey 状态
  | 'Client_updateMaxAISurveyStatus'
  // 客户端创建 paymentUrl
  | 'Client_createPaymentUrl'
  | IWebsiteContextSendEvent

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
  | 'OpenAIDaemonProcess_pongFilesUpload'
  | 'OpenAIDaemonProcess_filesUploadResponse'

// chrome extension 监听event
export type IChromeExtensionListenEvent =
  | IOpenAIChatSendEvent
  | IChromeExtensionClientSendEvent
  | IShortCutsSendEvent
  | ISearchWithAISendEvent

// chrome extension 发送 event
export type IChromeExtensionSendEvent =
  | IChromeExtensionClientListenEvent
  | IShortCutsClientListenEvent
