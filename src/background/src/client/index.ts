import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { backendApiReportPricingHooks } from '@/background/api'
import { IChromeExtensionClientSendEvent } from '@/background/eventType'
import {
  createDaemonProcessTab,
  getWindowIdOfChatGPTTab,
  processPreSaveChatMessage,
} from '@/background/src/chat/util'
import ConversationManager from '@/background/src/chatConversations'
import backgroundCommandHandler from '@/background/src/client/backgroundCommandHandler'
import { openPDFViewer } from '@/background/src/pdf'
import {
  backgroundRestartChromeExtension,
  chromeExtensionLogout,
  chromeExtensionOpenImmersiveChat,
  createBackgroundMessageListener,
  createChromeExtensionOptionsPage,
  safeGetBrowserTab,
} from '@/background/utils'
import BackgroundAbortFetch from '@/background/utils/BackgroundAbortFetch'
import { getContextMenuActions } from '@/background/utils/buttonSettings'
import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import {
  checkSettingsSync,
  isSettingsLastModifiedEqual,
} from '@/background/utils/syncSettings'
import {
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import {
  fetchUserSubscriptionInfo,
  getChromeExtensionUserInfo,
  getMaxAIChromeExtensionAccessToken,
  getMaxAIChromeExtensionUserId,
  getMaxAIChromeExtensionUserQuotaUsage,
} from '@/features/auth/utils'
import { IChatMessage } from '@/features/chatgpt/types'
import { logAndConfirmDailyUsageLimit } from '@/features/chatgpt/utils/logAndConfirmDailyUsageLimit'
import { logThirdPartyDailyUsage } from '@/features/chatgpt/utils/thirdPartyProviderDailyUsageLimit'
import WebsiteContextManager, {
  IWebsiteContext,
} from '@/features/websiteContext/background'
import { convertBlobToBase64 } from '@/utils/dataHelper/fileHelper'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import Log from '@/utils/Log'
import { backgroundSendMaxAINotification } from '@/utils/sendMaxAINotification/background'

const log = new Log('Background/Client')
export const ClientMessageInit = () => {
  createBackgroundMessageListener(async (runtime, event, data, sender) => {
    if (runtime === 'client') {
      switch (event as IChromeExtensionClientSendEvent) {
        case 'Client_ping': {
          return {
            data: {
              windowId: sender.tab?.windowId,
              tabId: sender.tab?.id,
              tagUrl: sender.tab?.url,
              url: sender.url,
              frameId: sender.frameId,
            },
            success: true,
            message: 'ok',
          }
        }
        case 'Client_closeUrl':
          {
            const { url, tabId } = data
            let tab: null | Browser.Tabs.Tab = null
            if (tabId) {
              tab = await safeGetBrowserTab(tabId)
            } else if (url) {
              tab =
                (
                  await Browser.tabs.query({
                    url: url,
                  })
                )?.[0] || null
            }
            if (tab?.id) {
              await Browser.tabs.remove(tab.id)
              return {
                success: true,
                data: true,
                message: 'ok',
              }
            }
            return {
              success: true,
              data: false,
              message: 'Cannot find close tab.',
            }
          }
          break
        case 'Client_openUrl':
          {
            const { url, key, query = '', active = true } = data
            if (url) {
              if (
                url.startsWith(Browser.runtime.getURL(`/pages/chat/index.html`))
              ) {
                if (
                  sender?.url &&
                  sender.url.startsWith(
                    Browser.runtime.getURL('/pages/popup/index.html'),
                  )
                ) {
                  const totalTabs = await Browser.tabs.query({
                    currentWindow: true,
                  })
                  const tabs = await Browser.tabs.query({
                    active: true,
                  })
                  if (totalTabs.length > 1) {
                    for (const tab of tabs) {
                      if (
                        tab.id &&
                        (tab.pendingUrl === `chrome://newtab/` ||
                          tab.pendingUrl === `about:blank` ||
                          tab.url === 'chrome://newtab/' ||
                          tab.url === 'about:blank')
                      ) {
                        await Browser.tabs.remove(tab.id)
                      }
                    }
                  }
                }
              }
              const immersiveChatTab = await chromeExtensionOpenImmersiveChat(
                query,
                active,
              )
              return {
                data: {
                  tabId: immersiveChatTab.id,
                },
                success: true,
                message: 'ok',
              }
            } else if (key) {
              let tabId: number | undefined = undefined
              if (key === 'pdf_viewer' && sender.tab?.id && sender.tab.url) {
                const queryObj = new URLSearchParams(query)
                const pdfUrl = queryObj.get('pdfUrl') ?? sender.tab.url
                const newTab = queryObj.get('newTab') === 'true'
                await openPDFViewer(sender.tab.id, pdfUrl, newTab)
              } else if (key === 'current_page') {
                if (sender.tab?.id) {
                  await Browser.tabs.update(sender.tab.id, {
                    active,
                  })
                  tabId = sender.tab.id
                }
              } else if (key === 'shortcuts') {
                const tab = await Browser.tabs.create({
                  url: 'chrome://extensions/shortcuts',
                  active,
                })
                tabId = tab.id
              } else if (key === 'options') {
                tabId = await createChromeExtensionOptionsPage(query)
              } else if (key === 'chatgpt') {
                const tab = await createDaemonProcessTab()
                tabId = tab.id
              } else if (key === 'manage_extension') {
                const tab = await Browser.tabs.create({
                  url: `chrome://extensions/?id=${Browser.runtime.id}`,
                  active,
                })
                tabId = tab.id
              } else if (key === 'immersive_chat') {
                const immersiveChatTab = await chromeExtensionOpenImmersiveChat(
                  query,
                  active,
                )
                tabId = immersiveChatTab.id
              }
              return {
                data: {
                  tabId,
                },
                success: true,
                message: 'ok',
              }
            }
          }
          break
        case 'Client_emitCMDJ':
          {
            if (sender.tab?.id) {
              await Browser.tabs.sendMessage(sender.tab.id, {
                id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
                event: 'Client_listenOpenChatMessageBox',
                data: {},
              })
            }
          }
          break
        case 'Client_updateIcon':
          {
            const { mode } = data
            console.log('Client_updateIcon', mode)

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
              // NOTE: 因为有些浏览器主题看不清， 所以暂时不用白色的icon
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
                id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
        case 'Client_logThirdPartyDailyUsage':
          {
            const result = await logThirdPartyDailyUsage()
            return {
              data: result,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_updateUserSubscriptionInfo':
          {
            const result = await fetchUserSubscriptionInfo()
            return {
              data: result,
              success: true,
              message: 'ok',
            }
          }
          break
        case 'Client_updateUseChatGPTAuthInfo':
          {
            const prevToken = await getMaxAIChromeExtensionAccessToken()
            const { accessToken, refreshToken, userInfo, clientUserId } = data
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
                  clientUserId,
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
              // 更新插件
              if (!(await isSettingsLastModifiedEqual())) {
                await checkSettingsSync()
              }
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
            const { forceUpdate = false } = data
            const userInfo = await getChromeExtensionUserInfo(forceUpdate)
            return {
              success: true,
              data: userInfo,
              message: 'ok',
            }
          }
          break
        case 'Client_getMaxAIUserQuotaUsageInfo':
          {
            const quotaUsageInfo = await getMaxAIChromeExtensionUserQuotaUsage(
              data.forceUpdate ?? false,
            )
            return {
              success: true,
              data: quotaUsageInfo,
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
          const userInfo = await getChromeExtensionUserInfo(false)
          if (name) {
            const data: Record<string, string> = {
              action,
              name,
            }
            if (userInfo?.role?.name) {
              data.role = userInfo.role.name
            }
            await backendApiReportPricingHooks(data)
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
          const settings = await getLiteChromeExtensionDBStorage(fromUrl)
          return {
            success: true,
            data: settings,
            message: 'ok',
          }
        }
        case 'Client_getAllConversation': {
          const conversations = await ConversationManager.getAllConversation()
          const userId = await getMaxAIChromeExtensionUserId()
          const filterConversations = conversations.filter((conversation) => {
            if (!conversation.authorId || conversation.authorId === userId) {
              return true
            }
            return false
          })
          return {
            success: true,
            data: filterConversations,
            message: 'ok',
          }
        }
        case 'Client_getAllPaginationConversation': {
          const allPaginationConversations =
            await ConversationManager.getAllPaginationConversations()
          return {
            success: true,
            data: allPaginationConversations,
            message: 'ok',
          }
        }
        case 'Client_removeAllConversation': {
          const result = await ConversationManager.clearAllConversations()
          return {
            success: result,
            data: result,
            message: 'ok',
          }
        }
        case 'Client_removeConversationByType': {
          const result = await ConversationManager.clearConversationsByType(
            data.type,
          )
          return {
            success: result,
            data: result,
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
            const datetime = new Date().getTime()
            const { conversationId } = data
            const conversation =
              await ConversationManager.getClientConversation(conversationId)
            // console.log('新版Conversation，获取conversation', conversation)
            console.log(
              '[DB_Conversation] openDatabase using time [Client_getLiteConversation]:',
              new Date().getTime() - datetime,
            )
            return {
              success: conversation?.id ? true : false,
              data: conversation,
              message: 'ok',
            }
          }
          break
        case 'Client_updateConversation': {
          const {
            conversationId,
            updateConversationData,
            syncConversationToDB,
          } = data
          let oldConversation =
            await ConversationManager.conversationDB.getConversationById(
              conversationId,
            )
          if (
            !oldConversation &&
            updateConversationData.id &&
            updateConversationData.messages &&
            updateConversationData.messages.length > 0
          ) {
            oldConversation = updateConversationData
          }

          if (oldConversation) {
            await ConversationManager.conversationDB.addOrUpdateConversation(
              mergeWithObject([oldConversation, updateConversationData]),
              {
                syncConversationToDB: syncConversationToDB === true,
                reason: 'Client_updateConversation',
              },
            )
            const newConversationData =
              await ConversationManager.getClientConversation(conversationId)
            sender.tab?.id &&
              (await Browser.tabs.sendMessage(sender.tab.id, {
                event: 'Client_listenUpdateConversationMessages',
                id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
        case 'Client_duplicateConversation':
          {
            const {
              conversationId,
              updateConversationData,
              syncConversationToDB,
            } = data
            const oldConversation =
              await ConversationManager.conversationDB.getConversationById(
                conversationId,
              )
            if (oldConversation) {
              if (!updateConversationData.id) {
                // 如果没传入id，就生成一个新的id
                updateConversationData.id = uuidV4()
              }
              await ConversationManager.conversationDB.addOrUpdateConversation(
                mergeWithObject([oldConversation, updateConversationData]),
                {
                  syncConversationToDB: syncConversationToDB === true,
                  reason: 'Client_duplicateConversation',
                },
              )
              const newConversationData =
                await ConversationManager.getClientConversation(
                  updateConversationData.id,
                )
              if (newConversationData) {
                sender.tab?.id &&
                  (await Browser.tabs.sendMessage(sender.tab.id, {
                    event: 'Client_listenUpdateConversationMessages',
                    id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
                    data: {
                      conversation: newConversationData,
                      conversationId: newConversationData.id,
                    },
                  }))
              }
              console.log(
                '新版Conversation，复制conversation',
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
              const processedMessages = await Promise.all(
                newMessages.map(async (message: IChatMessage) => {
                  return await processPreSaveChatMessage(message)
                }),
              )
              success = await ConversationManager.pushMessages(
                conversationId,
                processedMessages,
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
            } else if (action === 'update') {
              success = await ConversationManager.updateMessage(
                conversationId,
                newMessages[0],
              )
            }
            sender.tab?.id &&
              (await Browser.tabs.sendMessage(sender.tab.id, {
                event: 'Client_listenUpdateConversationMessages',
                id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
            const { url, options, abortTaskId } = data
            const { parse = 'json', ...parseOptions } = options
            const result = await BackgroundAbortFetch.fetch(
              url,
              parseOptions,
              abortTaskId,
            )
            let resultData: any = null
            if (parse === 'json') {
              resultData = await result.json()
            } else if (parse === 'blob') {
              const blob = await result.blob()
              resultData = {
                base64: await convertBlobToBase64(blob),
                contentType: blob.type,
              }
            } else {
              resultData = await result.text()
            }
            return {
              success: true,
              data: {
                response: {
                  ok: result.ok,
                  status: result.status,
                  statusText: result.statusText,
                  url: result.url,
                  redirected: result.redirected,
                },
                data: resultData,
              },
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
        case 'Client_abortProxyFetchAPI': {
          try {
            const { abortTaskId } = data
            const success = BackgroundAbortFetch.abort(abortTaskId)
            return {
              success,
              data: {},
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
                id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
          if (taskId && sender.tab?.id) {
            // send to tab
            await Browser.tabs.sendMessage(sender.tab.id, {
              event:
                'Client_ListenGetIframePageContentResponse' as IChromeExtensionClientSendEvent,
              id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
        case 'WebsiteContext_getWebsiteContext': {
          const { id } = data
          let websiteContext: IWebsiteContext | undefined = undefined
          if (id) {
            websiteContext = await WebsiteContextManager.getWebsiteContextById(
              id,
            )
          }
          return {
            success: true,
            data: websiteContext,
            message: 'ok',
          }
        }
        case 'WebsiteContext_searchWebsiteContext': {
          // todo - 做rewind的时候再开发
          return {
            success: true,
            data: [],
            message: 'ok',
          }
        }
        case 'WebsiteContext_deleteWebsiteContext': {
          const { id } = data
          if (id) {
            await WebsiteContextManager.deleteWebsiteContext(id)
            return {
              success: true,
              data: true,
              message: 'ok',
            }
          }
          return {
            success: false,
            data: false,
            message: 'ok',
          }
        }
        case 'WebsiteContext_clearAllWebsiteContext': {
          await WebsiteContextManager.clearAllWebsiteContexts()
          return {
            success: true,
            data: true,
            message: 'ok',
          }
        }
        case 'WebsiteContext_updateWebsiteContext': {
          const { query, websiteContext } = data
          if (query.id) {
            await WebsiteContextManager.updateWebsiteContext(
              query.id,
              websiteContext,
            )
            return {
              success: true,
              data: true,
              message: 'ok',
            }
          }
          return {
            success: false,
            data: false,
            message: 'ok',
          }
        }
        case 'WebsiteContext_createWebsiteContext': {
          const { websiteContext } = data as {
            websiteContext: Partial<IWebsiteContext>
          }
          const newWebsiteContext =
            await WebsiteContextManager.createWebsiteContext(websiteContext)
          return {
            success: true,
            data: newWebsiteContext,
            message: 'ok',
          }
        }
        case 'Client_backgroundRunFunction': {
          const result = await backgroundCommandHandler(
            data.command,
            data.commandFunctionName,
            data.commandFunctionData,
          )
          return {
            success: !!result,
            data: result,
            message: 'ok',
          }
        }
        case 'Client_logUserUsageInfo': {
          const { disableCollect, ...clientData } = data
          const userInfo = await getChromeExtensionUserInfo(false)
          // const formatExt = (ext: Browser.Management.ExtensionInfo) => {
          //   if (ext.hostPermissions?.[0] === '<all_urls>') {
          //     // 允许访问所有网站
          //   } else if (ext.hostPermissions?.length) {
          //     // 允许访问特定网站
          //   } else {
          //     // 点击时
          //   }
          //   const filterKeys = ['description', 'homepageUrl', 'icons', 'shortName']
          //   return {}
          // }
          const sendData: Record<string, any> = {
            userInfo,
            ...clientData,
          }
          if (!disableCollect) {
            const allExtensions = await Browser.management.getAll()
            const selfExtension = await Browser.management.getSelf()
            const isAllowedFile =
              await Browser.extension.isAllowedFileSchemeAccess()
            const isAllowedIncognito =
              await Browser.extension.isAllowedIncognitoAccess()
            Object.assign(sendData, {
              allExtensions,
              selfExtension,
              isAllowedFile,
              isAllowedIncognito,
            })
          }
          console.log('Client_logUserUsageInfo', sendData)
          backgroundSendMaxAINotification(
            'CLIENT',
            '[Client] Collect user usage information',
            JSON.stringify(sendData, null, 4),
          )
          return {
            success: true,
            data: true,
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
