import { IContextMenuItem } from '@/features/contextMenu'
import { useEffect, useState } from 'react'
import {
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
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
  ContentScriptConnectionV2,
  pingDaemonProcess,
} from '@/features/chatgpt/utils'
import { COUNTRIES_MAP } from '@/utils/staticData'
import size from 'lodash-es/size'

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
  const chatBoxElement = document.getElementById(ROOT_CONTAINER_ID)
  if (htmlElement && chatBoxElement) {
    const chatBoxElementWidth =
      chatBoxElement.offsetWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    htmlElement.style.transition = 'width .1s ease-inout'
    htmlElement.style.width = `calc(100% - ${chatBoxElementWidth}px)`
    htmlElement.style.position = 'relative'
    if (location.hostname === 'outlook.live.com') {
      htmlElement.style.minHeight = '100vh'
    }
    chatBoxElement.classList.remove('close')
    chatBoxElement.classList.add('open')
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
  const chatBoxElement = document.getElementById(ROOT_CONTAINER_ID)
  if (htmlElement && chatBoxElement) {
    htmlElement.style.transition = 'width .1s ease-inout'
    htmlElement.style.width = '100%'
    htmlElement.style.position = ''
    if (location.hostname === 'outlook.live.com') {
      htmlElement.style.minHeight = ''
    }
    chatBoxElement.classList.remove('open')
    chatBoxElement.classList.add('close')
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }
}
export const isShowChatBox = () => {
  const chatBoxElement = document.getElementById(ROOT_CONTAINER_ID)
  return chatBoxElement?.classList.contains('open') || false
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

export const CLIENT_OPEN_PAGE_KEYS = [
  'shortcuts',
  'options',
  'daemon_process',
  'current_page',
  'chatgpt',
] as const

export const chromeExtensionClientOpenPage = async (params: {
  key?: (typeof CLIENT_OPEN_PAGE_KEYS)[number]
  url?: string
  query?: string
}) => {
  const { key, url, query } = params
  if (!url && !key) {
    return
  }
  const port = new ContentScriptConnectionV2()
  if (key) {
    await port.postMessage({
      event: 'Client_openUrl',
      data: {
        key,
        query,
      },
    })
  } else {
    await port.postMessage({
      event: 'Client_openUrl',
      data: {
        url,
        query,
      },
    })
  }
  port.destroy()
}
/**
 * 判断是否有数据
 *
 * `(data: any)`
 *
 * `return` => ({}) => `false`
 *
 */
export const hasData = (data: any): boolean => {
  const dataType = typeof data
  switch (dataType) {
    case 'object':
      if (size(data) > 0) {
        return true
      }
      return false
    case 'string':
      if (size(data) > 0 && data !== 'N/A') {
        return true
      }
      return false
    case 'number':
      if (data === 0) {
        return true
      }
      if (isNaN(data)) {
        return false
      }
      return true
    case 'undefined':
      return false
    default:
      return false
  }
}
