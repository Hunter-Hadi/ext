import { IChromeExtensionClientSendEvent } from '@/background/eventType'
// import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import {
  createBackgroundMessageListener,
  createChromeExtensionOptionsPage,
} from '@/background/utils'
import { createDaemonProcessTab } from '@/background/src/chat/util'
import { isEzMailApp } from '@/types'

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
                    16: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_16_normal_dark.png',
                    32: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_32_normal_dark.png',
                    48: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_48_normal_dark.png',
                    128: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_128_normal_dark.png',
                  },
                })
              } else {
                await Browser.action.setIcon({
                  path: {
                    16: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_16_normal.png',
                    32: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_32_normal.png',
                    48: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_48_normal.png',
                    128: 'assets/USE_CHAT_GPT_AI/icons/usechatGPT_128_normal.png',
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
                  await Browser.windows.update(window.id, {
                    focused: windowFocus,
                    state: windowVisible ? 'normal' : 'minimized',
                  })
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
        default:
          break
      }
    }
    return undefined
  })
}
