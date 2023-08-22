import { IChromeExtensionClientSendEvent } from '@/background/eventType'
import Browser from 'webextension-polyfill'
import {
  createBackgroundMessageListener,
  createChromeExtensionOptionsPage,
  backgroundRestartChromeExtension,
  chromeExtensionLogout,
} from '@/background/utils'
import {
  createDaemonProcessTab,
  getWindowIdOfChatGPTTab,
} from '@/background/src/chat/util'
import {
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  isEzMailApp,
} from '@/constants'
import { logAndConfirmDailyUsageLimit } from '@/features/chatgpt/utils/logAndConfirmDailyUsageLimit'
import Log from '@/utils/Log'
import {
  getChromeExtensionAccessToken,
  getChromeExtensionUserInfo,
} from '@/features/auth/utils'
import { backendApiReportPricingHooks } from '@/background/api'
import getLiteChromeExtensionSettings from '@/background/utils/getLiteChromeExtensionSettings'
import { getContextMenuActions } from '@/background/utils/buttonSettings'
import ConversationManager from '@/background/src/chatConversations'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const log = new Log('Background/Client')
export const ClientMessageInit = () => {
  createBackgroundMessageListener(async (runtime, event, data, sender) => {
    if (runtime === 'client') {
      switch (event as IChromeExtensionClientSendEvent) {
        case 'Client_ping': {
          return {
            data: true,
            success: true,
            message: 'ok',
          }
        }
        case 'Client_openUrl':
          {
            const { url, key, query = '' } = data
            if (url) {
              await Browser.tabs.create({
                url,
              })
              return {
                data: true,
                success: true,
                message: 'ok',
              }
            } else if (key) {
              if (key === 'current_page') {
                if (sender.tab?.id) {
                  await Browser.tabs.update(sender.tab.id, {
                    active: true,
                  })
                }
              } else if (key === 'shortcuts') {
                await Browser.tabs.create({
                  url: 'chrome://extensions/shortcuts',
                  active: true,
                })
              } else if (key === 'options') {
                await createChromeExtensionOptionsPage(query)
              } else if (key === 'chatgpt') {
                await createDaemonProcessTab()
              } else if (key === 'manage_extension') {
                await Browser.tabs.create({
                  url: `chrome://extensions/?id=${Browser.runtime.id}`,
                  active: true,
                })
              }
              return {
                data: true,
                success: true,
                message: 'ok',
              }
            }
          }
          break
        case 'Client_updateIcon':
          {
            const { mode } = data
            console.log('Client_updateIcon', mode)
            if (isEzMailApp) {
              // don't need to update icon
              return {
                data: false,
                success: false,
                message: 'ok',
              }
            } else {
              if (mode === 'dark') {
                await Browser.action.setIcon({
                  path: {
                    16: 'assets/USE_CHAT_GPT_AI/icons/maxai_16_normal.png',
                    32: 'assets/USE_CHAT_GPT_AI/icons/maxai_32_normal.png',
                    48: 'assets/USE_CHAT_GPT_AI/icons/maxai_48_normal.png',
                    128: 'assets/USE_CHAT_GPT_AI/icons/maxai_128_normal.png',
                  },
                })
              } else {
                // MARK: 因为有些浏览器主题看不清， 所以暂时不用白色的icon
                await Browser.action.setIcon({
                  path: {
                    16: 'assets/USE_CHAT_GPT_AI/icons/maxai_16_normal.png',
                    32: 'assets/USE_CHAT_GPT_AI/icons/maxai_32_normal.png',
                    48: 'assets/USE_CHAT_GPT_AI/icons/maxai_48_normal.png',
                    128: 'assets/USE_CHAT_GPT_AI/icons/maxai_128_normal.png',
                  },
                })
              }
              return {
                data: true,
                success: true,
                message: 'ok',
              }
            }
          }
          break
        case 'Client_getChromeExtensionCommands':
          {
            const commands = (await Browser.commands.getAll()) || []
            return {
              data: commands,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_updateTabVisible':
          {
            const { visible, windowVisible, windowFocus } = data || {}
            if (sender.tab?.id) {
              const tab = await Browser.tabs.update(sender.tab.id, {
                active: visible,
              })
              if (tab.windowId) {
                const window = await Browser.windows.get(tab.windowId)
                if (window.id && window.id !== Browser.windows.WINDOW_ID_NONE) {
                  const lastWindowIdOfChatGPTTab =
                    await getWindowIdOfChatGPTTab()
                  // 如果 sender 的 windowid 不是创建的 chatgpt tab 时的 windowid，就不最小化
                  const state =
                    lastWindowIdOfChatGPTTab !== window.id || windowVisible
                      ? undefined // 由于设置成 normal 会 在当前窗口只有一个tab时导致窗口缩小, 所以设置为 undefined (不改变state)
                      : 'minimized'
                  // get window all tabs
                  let tabs = await Browser.tabs.query({
                    windowId: window.id,
                  })
                  // 过滤掉new tab
                  tabs = tabs.filter(
                    (tab) => tab.url && !/.*:\/\/newtab/.test(tab.url),
                  )
                  if (tabs.length === 1) {
                    await Browser.windows.update(window.id, {
                      focused: windowFocus,
                      state,
                    })
                  }
                }
              }
            }
            return {
              data: true,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_updateIframeInput':
          {
            if (sender.tab?.id) {
              await Browser.tabs.sendMessage(sender.tab.id, {
                event: 'Client_listenUpdateIframeInput',
                data,
                id: CHROME_EXTENSION_POST_MESSAGE_ID,
              })
            }
            return {
              data: true,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_restartApp':
          {
            await backgroundRestartChromeExtension()
            return {
              data: true,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_logCallApiRequest':
          {
            const result = await logAndConfirmDailyUsageLimit(data)
            return {
              data: result,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_updateUseChatGPTAuthInfo':
          {
            const prevToken = await getChromeExtensionAccessToken()
            const { accessToken, refreshToken, userInfo } = data
            log.info(
              'Client_updateUseChatGPTAuthInfo',
              accessToken,
              refreshToken,
              userInfo,
            )
            if (accessToken && refreshToken) {
              const cache = await Browser.storage.local.get(
                CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
              )
              await Browser.storage.local.set({
                [CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]: {
                  accessToken,
                  refreshToken,
                  userInfo,
                  userData:
                    cache[
                      CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY
                    ]?.userData,
                },
              })
            } else {
              await chromeExtensionLogout()
            }
            if (!prevToken && accessToken) {
              await createChromeExtensionOptionsPage('', false)
            }
            // 因为会打开新的optionsTab，所以需要再切换回去
            await Browser.tabs.update(sender.tab?.id, {
              active: true,
            })
            return {
              data: true,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_getUseChatGPTUserInfo':
          {
            const userInfo = await getChromeExtensionUserInfo(false)
            return {
              success: true,
              data: userInfo,
              message: 'ok',
            }
          }
          break
        case 'Client_getUseChatGPTUserSubscriptionInfo':
          {
            const userInfo = await getChromeExtensionUserInfo(true)
            return {
              success: true,
              data: userInfo?.role,
              message: 'ok',
            }
          }
          break
        case 'Client_emitPricingHooks': {
          const { action, name } = data
          if (name) {
            await backendApiReportPricingHooks({
              action,
              name,
            })
          }
          return {
            success: true,
            data: true,
            message: 'ok',
          }
        }
        case 'Client_getLiteChromeExtensionSettings': {
          let fromUrl = sender.tab?.url || sender.url
          if (!fromUrl) {
            const currentActiveTab = await Browser.tabs.query({
              active: true,
              currentWindow: true,
            })
            fromUrl = currentActiveTab[0]?.url
          }
          const settings = await getLiteChromeExtensionSettings(fromUrl)
          return {
            success: true,
            data: settings,
            message: 'ok',
          }
        }
        case 'Client_getContextMenuActions': {
          const { contextMenuId } = data
          const actions = await getContextMenuActions(contextMenuId)
          return {
            success: true,
            data: actions,
            message: 'ok',
          }
        }
        case 'Client_getLiteConversation':
          {
            const { conversationId } = data
            const conversation =
              await ConversationManager.getClientConversation(conversationId)
            // console.log('新版Conversation，获取conversation', conversation)
            return {
              success: conversation?.id ? true : false,
              data: conversation,
              message: 'ok',
            }
          }
          break
        case 'Client_updateConversation':
          {
            const { conversationId, updateConversationData } = data
            const oldConversation =
              await ConversationManager.conversationDB.getConversationById(
                conversationId,
              )
            if (oldConversation) {
              await ConversationManager.conversationDB.addOrUpdateConversation(
                mergeWithObject([oldConversation, updateConversationData]),
              )
              const newConversationData =
                await ConversationManager.getClientConversation(conversationId)
              sender.tab?.id &&
                (await Browser.tabs.sendMessage(sender.tab.id, {
                  event: 'Client_listenUpdateConversationMessages',
                  id: CHROME_EXTENSION_POST_MESSAGE_ID,
                  data: {
                    conversation: newConversationData,
                    conversationId,
                  },
                }))
              console.log(
                '新版Conversation，更新conversation',
                newConversationData,
              )
              return {
                success: true,
                data: newConversationData,
                message: 'ok',
              }
            }
            return {
              success: false,
              data: false,
              message: 'ok',
            }
          }
          break
        case 'Client_modifyMessages':
          {
            const { conversationId, action, deleteCount, newMessages } = data
            let success = false
            console.log('新版Conversation，更新消息', conversationId, data)
            if (action === 'add') {
              if (newMessages.length === 0) {
                return {
                  success: true,
                  data: true,
                  message: 'ok',
                }
              }
              success = await ConversationManager.pushMessages(
                conversationId,
                newMessages,
              )
            } else if (action === 'delete') {
              success = await ConversationManager.deleteMessages(
                conversationId,
                deleteCount,
              )
            } else if (action === 'clear') {
              success = await ConversationManager.deleteMessages(
                conversationId,
                99999999,
              )
            }
            sender.tab?.id &&
              (await Browser.tabs.sendMessage(sender.tab.id, {
                event: 'Client_listenUpdateConversationMessages',
                id: CHROME_EXTENSION_POST_MESSAGE_ID,
                data: {
                  conversation: await ConversationManager.getClientConversation(
                    conversationId,
                  ),
                  conversationId,
                },
              }))
            return {
              success,
              data: true,
              message: 'ok',
            }
          }
          break
        case 'Client_proxyFetchAPI': {
          try {
            const { url, options } = data
            const { parse = 'json', ...parseOptions } = options
            const result = await fetch(url, parseOptions)
            return {
              success: true,
              data:
                parse === 'json' ? await result.json() : await result.text(),
              message: 'ok',
            }
          } catch (e) {
            return {
              success: false,
              data: e,
              message: 'ok',
            }
          }
        }
        case 'Client_getIframePageContent':
          {
            const { taskId } = data
            if (sender.tab?.id && taskId) {
              // send to tab
              await Browser.tabs.sendMessage(sender.tab.id, {
                event:
                  'Iframe_ListenGetPageContent' as IChromeExtensionClientSendEvent,
                id: CHROME_EXTENSION_POST_MESSAGE_ID,
                data: {
                  taskId,
                  originPageUrl: sender.tab.url || sender.url,
                },
              })
              return {
                success: true,
                data: taskId,
                message: 'ok',
              }
            } else {
              return {
                success: false,
                data: '',
                message: 'ok',
              }
            }
          }
          break
        case 'Iframe_sendPageContent': {
          const { taskId, pageContent } = data
          debugger
          if (taskId && sender.tab?.id) {
            // send to tab
            await Browser.tabs.sendMessage(sender.tab.id, {
              event:
                'Client_ListenGetIframePageContentResponse' as IChromeExtensionClientSendEvent,
              id: CHROME_EXTENSION_POST_MESSAGE_ID,
              data: {
                taskId,
                pageContent,
              },
            })
            return {
              success: true,
              data: taskId,
              message: 'ok',
            }
          }
          return {
            success: false,
            data: '',
            message: 'ok',
          }
        }
        default:
          break
      }
    }
    return undefined
  })
}
