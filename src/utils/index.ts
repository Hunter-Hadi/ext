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
  ROOT_CONTEXT_MENU_ID,
  ROOT_CONTEXT_MENU_PORTAL_ID,
} from '@/types'
import { IInboxMessageType } from '@/features/gmail/store'
import {
  ContentScriptConnection,
  pingDaemonProcess,
} from '@/features/chatgpt/utils'
import { COUNTRIES_MAP } from '@/utils/staticData'

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
export const getFloatingContextMenuActiveElement = (): HTMLElement | null => {
  const element = document.querySelector(`#${ROOT_CONTEXT_MENU_ID}`)?.shadowRoot
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
export const getAppContextMenuElement = (): HTMLDivElement | null => {
  const portals =
    document
      .querySelector(`#${ROOT_CONTEXT_MENU_ID}`)
      ?.shadowRoot?.querySelectorAll(`#${ROOT_CONTEXT_MENU_PORTAL_ID}`) || []
  const portal = Array.from(portals).find((portal) => portal.innerHTML !== '')
  return portal as HTMLDivElement
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
    htmlElement.style.position = 'relative'
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
    htmlElement.style.position = ''
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

export const filteredTypeGmailToolBarContextMenu = (
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

export const elementScrollToBottom = (
  element: HTMLElement,
  duration: number,
) => {
  const start = element.scrollTop
  const end = element.scrollHeight - element.clientHeight
  const distance = end - start
  const startTime = new Date().getTime()
  function easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2
    if (t < 1) return (c / 2) * t * t + b
    t--
    return (-c / 2) * (t * (t - 2) - 1) + b
  }
  function scroll() {
    const elapsed = new Date().getTime() - startTime
    const position = easeInOutQuad(elapsed, start, distance, duration)
    element.scrollTop = position
    if (elapsed < duration) {
      window.requestAnimationFrame(scroll)
    }
  }
  scroll()
}

export type ICountryIconSizeType =
  | '16x12'
  | '20x15'
  | '24x18'
  | '28x21'
  | '32x24'
  | '36x27'
  | '40x30'
  | '48x36'
  | '56x42'
  | '60x45'
  | '64x48'
  | '72x54'
  | '80x60'
  | '84x63'
  | '96x72'
  | '108x81'
  | '112x84'
  | '120x90'
  | '128x96'
  | '144x108'
  | '160x120'
  | '192x144'
  | '224x168'
  | '256x192'

/**
 * 返回 对应 国家的 国旗 icon
 *
 *
 * `return` => (`United Arab Emirates`, `size?: CountryIconSize`) => `https://flagcdn.com/{size ? size : '40x30'}/ae.png`
 *
 */
export const countryIcon = (
  countryName: string | undefined = '',
  size?: ICountryIconSizeType,
  strictMode = false,
): string => {
  const countryCode =
    COUNTRIES_MAP.get(countryName) ||
    COUNTRIES_MAP.get(countryName.toLocaleLowerCase())
  if (strictMode && !countryCode) {
    return ''
  } else {
    return `https://flagcdn.com/${size ? size : '40x30'}/${
      countryCode || countryName.toLocaleLowerCase()
    }.png`
  }
}

export const countryOptions = () => {
  const options: Array<{
    value: string
    label: string
  }> = []
  COUNTRIES_MAP.forEach((value, key) => {
    options.push({
      value,
      label: key,
    })
  })
  return options
}

export const chromeExtensionClientOpenPage = (params: {
  key?: 'shortcuts' | 'options' | 'daemon_process'
  url?: string
  query?: string
}) => {
  const { key, url, query } = params
  if (!url && !key) {
    return
  }
  const port = new ContentScriptConnection()
  if (key) {
    port.postMessage({
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_openUrl',
      data: {
        key,
        query,
      },
    })
  } else {
    port.postMessage({
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_openUrl',
      data: {
        url,
        query,
      },
    })
  }
  port.destroy()
}
