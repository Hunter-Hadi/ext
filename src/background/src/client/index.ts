import { IChromeExtensionClientSendEvent } from '@/background/eventType'
import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import { createBackgroundMessageListener } from '@/background/utils'

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

const log = new Log('background/core/client')
export const ClientMessageInit = () => {
  createBackgroundMessageListener(async (runtime, event, data) => {
    if (runtime === 'client') {
      log.info('onMessage', runtime, event, data)
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
            } else if (key) {
              if (key === 'shortcuts') {
                await Browser.tabs.create({
                  url: 'chrome://extensions/shortcuts',
                  active: true,
                })
              } else if (key === 'options') {
                const chromeExtensionId = Browser.runtime.id
                const findOptionPage = await Browser.tabs.query({
                  url: `chrome-extension://${chromeExtensionId}/options.html`,
                })
                if (findOptionPage && findOptionPage.length > 0) {
                  await Browser.tabs.update(findOptionPage[0].id, {
                    url: `chrome-extension://${chromeExtensionId}/options.html${query}`,
                    active: true,
                  })
                  return
                } else {
                  await Browser.tabs.create({
                    url: `chrome-extension://${chromeExtensionId}/options.html${query}`,
                    active: true,
                  })
                }
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
        default:
          break
      }
    }
    return undefined
  })
}
