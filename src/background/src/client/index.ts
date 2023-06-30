import { IChromeExtensionClientSendEvent } from '@/background/eventType'
// import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import {
  createBackgroundMessageListener,
  createChromeExtensionOptionsPage,
  backgroundRestartChromeExtension,
} from '@/background/utils'
import {
  createDaemonProcessTab,
  getWindowIdOfChatGPTTab,
} from '@/background/src/chat/util'
import { CHROME_EXTENSION_POST_MESSAGE_ID, isEzMailApp } from '@/constants'

// const log = new Log('Background/Client')
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
                    16: 'assets/USE_CHAT_GPT_AI/icons/maxai_16_normal_dark.png',
                    32: 'assets/USE_CHAT_GPT_AI/icons/maxai_32_normal_dark.png',
                    48: 'assets/USE_CHAT_GPT_AI/icons/maxai_48_normal_dark.png',
                    128: 'assets/USE_CHAT_GPT_AI/icons/maxai_128_normal_dark.png',
                  },
                })
              } else {
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
                  const tabs = await Browser.tabs.query({
                    windowId: window.id,
                  })
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
        default:
          break
      }
    }
    return undefined
  })
}
