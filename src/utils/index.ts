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
import { useEffect, useState } from 'react'
import {
  CHROME_EXTENSION_POST_MESSAGE_ID,
  EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  EZMAIL_NEW_MAIL_GROUP_ID,
  EZMAIL_REPLY_CTA_BUTTON_ID,
  EZMAIL_REPLY_GROUP_ID,
  ROOT_CONTAINER_ID,
  ROOT_CONTAINER_WRAPPER_ID,
} from '@/types'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import { IInboxMessageType } from '@/features/gmail/store'
import { pingDaemonProcess } from '@/features/chatgpt/utils'

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

export const numberWithCommas = (number: number, digits = 2) => {
  return Number(number)
    .toFixed(digits)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
export const getAppActiveElement = (): HTMLElement | null => {
  const element = document.querySelector(`#${ROOT_CONTAINER_ID}`)?.shadowRoot
    ?.activeElement as HTMLDivElement
  if (element === undefined) return null
  return element
}
export const getAppRootElement = (): HTMLDivElement | null => {
  return document
    .querySelector(`#${ROOT_CONTAINER_ID}`)
    ?.shadowRoot?.querySelector(
      `#${ROOT_CONTAINER_WRAPPER_ID}`,
    ) as HTMLDivElement
}

export const showChatBox = () => {
  const htmlElement = document.body.parentElement
  const ezMailAiElement = document.getElementById(ROOT_CONTAINER_ID)
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
      pingDaemonProcess()
    }, 1000)
  }
}

export const hideChatBox = () => {
  const htmlElement = document.body.parentElement
  const ezMailAiElement = document.getElementById(ROOT_CONTAINER_ID)
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
export const ChatBoxIsOpen = () => {
  const ezMailAiElement = document.getElementById(ROOT_CONTAINER_ID)
  return ezMailAiElement?.classList.contains('open') || false
}

export type IChatGPTModelType = {
  slug: string
  max_tokens: number
  title: string
  description: string
  tags?: string[]
  qualitative_properties?: {
    reasoning: number[]
    speed: number[]
    conciseness: number[]
  }
}
type IChromeExtensionSettings = {
  commands?: Array<{
    name: string
    shortcut: string
    description: string
  }>
  models?: IChatGPTModelType[]
  currentModel?: string
  contextMenus?: IContextMenuItem[]
  gmailToolBarContextMenu?: IContextMenuItem[]
}
export type IChromeExtensionSettingsKey =
  | 'contextMenus'
  | 'gmailToolBarContextMenu'

export const getChromeExtensionSettings =
  (): Promise<IChromeExtensionSettings> => {
    return new Promise((resolve) => {
      const port = Browser.runtime.connect()
      const listener = (message: any) => {
        if (message?.id && message.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
          return
        }
        if (message.event === 'Client_getSettingsResponse') {
          const {
            data: { settings },
          } = message
          port.onMessage.removeListener(listener)
          resolve(settings)
        }
      }
      port.onMessage.addListener(listener)
      port.postMessage({
        id: CHROME_EXTENSION_POST_MESSAGE_ID,
        event: 'Client_getSettings',
      })
    })
  }

export const getChromeExtensionContextMenu = async (
  menuType: IChromeExtensionSettingsKey,
) => {
  const settings = await getChromeExtensionSettings()
  const defaultMenus = {
    contextMenus: defaultContextMenuJson,
    gmailToolBarContextMenu: defaultGmailToolbarContextMenuJson,
  }
  const cacheMenus = settings[menuType]
  if (cacheMenus && cacheMenus.length > 0) {
    return cacheMenus
  } else {
    return defaultMenus[menuType]
  }
}

export const getFilteredTypeGmailToolBarContextMenu = (
  messageType: IInboxMessageType,
  filterCTAButton = false,
  sourceList: IContextMenuItem[],
) => {
  let menuList = sourceList
  if (filterCTAButton) {
    menuList = menuList.filter(
      (item) =>
        item.id !== EZMAIL_NEW_EMAIL_CTA_BUTTON_ID &&
        item.id !== EZMAIL_REPLY_CTA_BUTTON_ID,
    )
  }
  if (messageType === 'reply') {
    return menuList.filter((item) => item.id !== EZMAIL_NEW_MAIL_GROUP_ID)
  } else {
    return menuList.filter((item) => item.id !== EZMAIL_REPLY_GROUP_ID)
  }
}

export const setChromeExtensionSettings = (
  settings: IChromeExtensionSettings,
) => {
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
    getChromeExtensionSettings()
      .then((oldSettings: any) => {
        port.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_updateSettings',
          data: {
            settings: JSON.stringify({ ...oldSettings, ...settings }),
          },
        })
      })
      .catch(() => {
        port.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_updateSettings',
          data: {
            settings: JSON.stringify({ ...settings }),
          },
        })
      })
  })
}
export const useDebounceValue = <T>(
  value: T,
  delay?: number,
  defaultValue?: undefined,
): T | undefined => {
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(
    defaultValue,
  )
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  return debouncedValue
}

export const getClientEnv = () => {
  if (isEzMailApp) {
    return 'gmail'
  }
  return 'normal'
}
