// export const numberFormatter = (number: number, digits = 1) => {
//   let isNegativeNumber = false // 是否是负数
//   if (number < 0) {
//     isNegativeNumber = true
//     number = Math.abs(number)
//   }
//   if (number < 1) {
//     return `${isNegativeNumber ? '-' : ''}${number.toFixed(digits)}`
//   }
//   const lookup = [
//     { value: 1, symbol: '' },
//     { value: 1e3, symbol: 'K' },
//     { value: 1e6, symbol: 'M' },
//     { value: 1e9, symbol: 'B' },
//   ]
//   const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
//   const item = lookup
//     .slice()
//     .reverse()
//     .find(function (item) {
//       return number >= item.value
//     })
//   return item
//     ? (isNegativeNumber ? '-' : '') +
//         (number / item.value).toFixed(digits).replace(rx, '$1') +
//         item.symbol
//     : '0'
// }

import Browser from 'webextension-polyfill'
import { IContextMenuItem } from '@/features/contextMenu'

export const numberWithCommas = (number: number, digits = 2) => {
  return Number(number)
    .toFixed(digits)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
export const getEzMailAppActiveElement = (): HTMLElement | null => {
  const element = document.querySelector('#EzMail_AI_ROOT')?.shadowRoot
    ?.activeElement as HTMLDivElement
  if (element === undefined) return null
  return element
}
export const getEzMailAppRootElement = (): HTMLDivElement | null => {
  return document
    .querySelector('#EzMail_AI_ROOT')
    ?.shadowRoot?.querySelector('#EzMail_AI_ROOT_Wrapper') as HTMLDivElement
}

export const showEzMailBox = () => {
  const htmlElement = document.body.parentElement
  const ezMailAiElement = document.getElementById('EzMail_AI_ROOT')
  if (htmlElement && ezMailAiElement) {
    const clientWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    const ezMailAiElementWidth = Math.max(clientWidth * 0.25, 400)
    htmlElement.style.transition = 'width .3s ease-inout'
    htmlElement.style.width = `calc(100% - ${ezMailAiElementWidth}px)`
    ezMailAiElement.classList.remove('close')
    ezMailAiElement.classList.add('open')
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 1000)
  }
}

export const hideEzMailBox = () => {
  const htmlElement = document.body.parentElement
  const ezMailAiElement = document.getElementById('EzMail_AI_ROOT')
  if (htmlElement && ezMailAiElement) {
    htmlElement.style.transition = 'width .3s ease-inout'
    htmlElement.style.width = '100%'
    ezMailAiElement.classList.remove('open')
    ezMailAiElement.classList.add('close')
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }
}
export const EzMailBoxIsOpen = () => {
  const ezMailAiElement = document.getElementById('EzMail_AI_ROOT')
  return ezMailAiElement?.classList.contains('open') || false
}

type IEzMailChromeExtensionSettings = {
  contextMenus?: IContextMenuItem[]
  gmailToolBarContextMenu?: IContextMenuItem[]
}
export type IEzMailChromeExtensionSettingsKey =
  keyof IEzMailChromeExtensionSettings

export const getEzMailChromeExtensionSettings =
  (): Promise<IEzMailChromeExtensionSettings> => {
    return new Promise((resolve) => {
      const port = Browser.runtime.connect()
      const listener = (message: any) => {
        if (message.event === 'Client_getSettingsResponse') {
          const {
            data: { settings },
          } = message
          port.onMessage.removeListener(listener)
          resolve(settings)
        }
      }
      port.onMessage.addListener(listener)
      port.postMessage({ event: 'Client_getSettings' })
    })
  }
export const setEzMailChromeExtensionSettings = (settings: {
  contextMenus: IContextMenuItem[]
}) => {
  return new Promise((resolve) => {
    const port = Browser.runtime.connect()
    const listener = (message: any) => {
      if (message.event === 'Client_updateSettingsResponse') {
        const {
          data: { success },
        } = message
        port.onMessage.removeListener(listener)
        resolve(success)
      }
    }
    port.onMessage.addListener(listener)
    getEzMailChromeExtensionSettings()
      .then((oldSettings: any) => {
        port.postMessage({
          event: 'Client_updateSettings',
          data: {
            settings: JSON.stringify({ ...oldSettings, ...settings }),
          },
        })
      })
      .catch(() => {
        port.postMessage({
          event: 'Client_updateSettings',
          data: {
            settings: JSON.stringify({ ...settings }),
          },
        })
      })
  })
}
