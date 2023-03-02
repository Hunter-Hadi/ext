// This file must be in the root of the src directory
// Popup action takes precedence over this listener..
// To make this function work, set "action" property to {} in manifest
import Browser from 'webextension-polyfill'
import debounce from 'lodash-es/debounce'

// 用来完成两个页面不同的任务通信
const ClientAsyncTaskMap = new Map<string, number>()

Browser.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
  if (message.type === 'inboxsdk__injectPageWorld' && sender.tab) {
    console.log('inboxsdk__injectPageWorld')
    if (Browser.scripting && sender.tab?.id) {
      console.log('inboxsdk__injectPageWorld 2')
      // MV3
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        world: 'MAIN',
        files: ['pageWorld.js'],
      })
      sendResponse(true)
    }
  }
})

let chatGPTProxyInstance: undefined | Browser.Tabs.Tab = undefined
/**
 * needAuth: 需要授权
 * loading: 正在加载
 * complete: 加载完成
 * success: 加载成功
 */
let chatGPTProxyInstanceStatus:
  | 'needAuth'
  | 'loading'
  | 'complete'
  | 'success' = 'needAuth'
let finallyActiveTabId: undefined | number = undefined

// 守护进程监听event
export type IChromeExtensionChatGPTDaemonProcessListenEvent =
  | 'DaemonProcess_getChatGPTProxyInstanceResponse'
  | 'DaemonProcess_clientAsyncTask'
  | 'DaemonProcess_listenClientPing'
// 守护进程监听task event
export type IChromeExtensionChatGPTDaemonProcessListenTaskEvent =
  | 'DaemonProcess_createConversation'
  | 'DaemonProcess_removeConversation'
  | 'DaemonProcess_sendMessage'
  | 'DaemonProcess_abortMessage'
  | 'DaemonProcess_compileTemplate'
// 守护进程发送event
export type IChromeExtensionChatGPTDaemonProcessSendEvent =
  | 'DaemonProcess_getChatGPTProxyInstance'
  | 'DaemonProcess_initChatGPTProxyInstance'
  | 'DaemonProcess_asyncTaskResponse'
  | 'DaemonProcess_Pong'
// 客户端监听进程
export type IChromeExtensionClientListenEvent =
  | 'Client_ChatGPTStatusUpdate'
  | 'Client_AsyncTaskResponse'
  | 'Client_ListenPong'
  | 'Client_ListenOpenChatMessageBox'
// 客户端发送进程
export type IChromeExtensionClientSendEvent =
  | 'Client_Ping'
  | 'Client_createAsyncTask'
  | 'Client_checkChatGPTStatus'
  | 'Client_openChatGPTDaemonProcess'
  | 'Client_openUrlInNewTab'
// chrome extension 监听event
export type IChromeExtensionListenEvent =
  | IChromeExtensionChatGPTDaemonProcessSendEvent
  | IChromeExtensionClientSendEvent

const sendChatGPTDaemonProcessMessage = (data: any) => {
  console.log('sendChatGPTDaemonProcessMessage', data)
  if (chatGPTProxyInstance && chatGPTProxyInstance.id) {
    Browser.tabs.sendMessage(chatGPTProxyInstance.id, {
      event: 'DaemonProcess_clientAsyncTask',
      data,
    })
  }
}

const sendClientMessage = (
  event: IChromeExtensionClientListenEvent,
  data: any,
) => {
  if (data.status) {
    chatGPTProxyInstanceStatus = data.status
  }
  Browser.tabs.query({}).then((tabs) => {
    const message = {
      event,
      data,
    }
    tabs.forEach((tab) => {
      if (tab.id) {
        console.log(tab.id, tab.url, message)
        Browser.tabs.sendMessage(tab.id, message)
      }
    })
  })
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    // console.debug('received msg', msg)
    const event: IChromeExtensionListenEvent = msg.event
    console.log('received event', event)
    switch (event) {
      case 'DaemonProcess_getChatGPTProxyInstance':
        {
          let isInit = false
          if (
            chatGPTProxyInstance &&
            port.sender?.tab?.id !== chatGPTProxyInstance.id
          ) {
            isInit = true
          }
          port.postMessage({
            event: 'DaemonProcess_getChatGPTProxyInstanceResponse',
            data: {
              isInit,
            },
          })
        }
        break
      case 'DaemonProcess_initChatGPTProxyInstance':
        console.log('initChatGPTProxyInstance', chatGPTProxyInstance)
        if (port.sender?.tab) {
          chatGPTProxyInstance = port.sender?.tab
          await Browser.tabs.update(chatGPTProxyInstance.id, {
            pinned: true,
          })
          chatGPTProxyInstanceStatus = 'success'
        }
        sendClientMessage('Client_ChatGPTStatusUpdate', {
          status: chatGPTProxyInstance !== undefined ? 'success' : 'needAuth',
        })
        if (finallyActiveTabId) {
          await Browser.tabs.update(finallyActiveTabId, {
            active: true,
          })
          finallyActiveTabId = undefined
        }
        break
      case 'Client_checkChatGPTStatus':
        sendClientMessage('Client_ChatGPTStatusUpdate', {
          status: chatGPTProxyInstanceStatus,
        })
        break
      case 'Client_createAsyncTask':
        {
          const { data: DaemonProcessReceiveData, event, taskId } = msg.data
          if (taskId) {
            ClientAsyncTaskMap.set(taskId, port.sender?.tab?.id || 0)
            sendChatGPTDaemonProcessMessage({
              event,
              taskId,
              data: DaemonProcessReceiveData,
            })
          }
        }
        break
      case 'DaemonProcess_asyncTaskResponse':
        {
          const { data: ClientReceiveData, taskId, done, error } = msg.data
          const tabId = ClientAsyncTaskMap.get(taskId)
          const currentTab = await Browser.tabs.get(tabId || 0)
          if (tabId && currentTab) {
            console.log(
              'asyncTaskResponse',
              tabId,
              ClientReceiveData,
              taskId,
              done,
              msg,
            )
            await Browser.tabs.sendMessage(tabId, {
              event: `Client_AsyncTaskResponse_${taskId}`,
              data: {
                taskId,
                data: ClientReceiveData,
                done,
                error,
              },
            })
          }
        }
        break
      case 'Client_openChatGPTDaemonProcess':
        {
          chatGPTProxyInstanceStatus = 'loading'
          finallyActiveTabId = port.sender?.tab?.id
          await createDaemonProcessTab()
        }
        break
      case 'Client_Ping':
        {
          console.log('Client_Ping', msg)
          if (chatGPTProxyInstance && chatGPTProxyInstance.id) {
            await Browser.tabs.sendMessage(chatGPTProxyInstance.id, {
              event: 'DaemonProcess_listenClientPing',
            })
          } else {
            sendClientMessage('Client_ChatGPTStatusUpdate', {
              status: 'needAuth',
            })
          }
        }
        break
      case 'Client_openUrlInNewTab':
        {
          const { url } = msg.data
          await Browser.tabs.create({
            url,
          })
        }
        break
      case 'DaemonProcess_Pong':
        {
          console.log('DaemonProcess_Pong')
          sendClientMessage('Client_ListenPong', {})
        }
        break
      default:
        break
    }
  })
})

const checkChatGPTDaemonProcess = debounce(() => {
  chatGPTProxyInstance?.id &&
    Browser.tabs.sendMessage(chatGPTProxyInstance.id, {
      event: 'DaemonProcess_getChatGPTProxyInstanceResponse',
      data: {
        isInit: false,
      },
    })
}, 3000)

const createDaemonProcessTab = async () => {
  console.log('createDaemonProcessTab')
  chatGPTProxyInstance = undefined
  const pinedTabs = await Browser.tabs.query({
    pinned: true,
    url: 'https://*.openai.com/*',
  })
  let tab: Browser.Tabs.Tab | null = null
  if (pinedTabs.length > 0 && pinedTabs[0].id) {
    tab = await Browser.tabs.update(pinedTabs[0].id, {
      active: true,
      url: 'https://chat.openai.com/chat',
    })
  } else {
    tab = await Browser.tabs.create({
      url: 'https://chat.openai.com/chat',
      pinned: true,
    })
  }
  chatGPTProxyInstance = tab
  return !!(tab && tab.id)
}
Browser.tabs.onUpdated.addListener(async function updateListener(
  tabId: number,
  changeInfo: Browser.Tabs.OnUpdatedChangeInfoType,
) {
  if (tabId === chatGPTProxyInstance?.id) {
    if (
      changeInfo.url &&
      changeInfo.url.indexOf('https://chat.openai.com/chat') !== 0
    ) {
      // url发生变化，移除实例
      chatGPTProxyInstance = undefined
      sendClientMessage('Client_ChatGPTStatusUpdate', {
        status: 'needAuth',
      })
    }
    if (changeInfo.status && chatGPTProxyInstance?.id) {
      // 因为守护进程的complete会重定向，所以需要计时器稍等一下
      chatGPTProxyInstanceStatus = changeInfo.status as 'loading' | 'complete'
      console.log('守护进程url更新', tabId, changeInfo.status, changeInfo)
      sendClientMessage('Client_ChatGPTStatusUpdate', {
        status: changeInfo.status,
      })
      if (changeInfo.status === 'complete') {
        checkChatGPTDaemonProcess()
      }
    }
  }
})
Browser.tabs.onRemoved.addListener(function listener(tabId) {
  if (chatGPTProxyInstance && tabId === chatGPTProxyInstance.id) {
    console.log('守护进程已关闭')
    chatGPTProxyInstance = undefined
    Browser.tabs.onRemoved.removeListener(listener)
    sendClientMessage('Client_ChatGPTStatusUpdate', {
      status: 'needAuth',
    })
  }
})
Browser.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id && tab.active) {
    if (tab?.url && tab.url.startsWith('https://mail.google.com')) {
      await Browser.tabs.create({
        url: 'https://www.ezmail.ai/chrome-extension#how-to-use',
      })
      return
    }
    await Browser.tabs.sendMessage(tab.id, {
      event: 'Client_ListenOpenChatMessageBox',
      data: {},
    })
  }
})
Browser.management.getAll()
Browser.storage.onChanged.addListener(() => {
  console.log('storage changed')
})

Browser.runtime.onInstalled.addListener(async (object) => {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await Browser.tabs.create({
      url: 'https://www.ezmail.ai/chrome-extension#how-to-use',
    })
  }
})
