import size from 'lodash-es/size'
import { useEffect, useState } from 'react'

import {
  IBackgroundRunCommandFunctionKey,
  IBackgroundRunCommandFunctionParams,
  IBackgroundRunCommandFunctionReturn,
  IBackgroundRunCommandKey,
} from '@/background/src/client/backgroundCommandHandler'
import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'
import {
  ContentScriptConnectionV2,
  pingDaemonProcess,
} from '@/features/chatgpt/utils'
import {
  MAXAI_CONTEXT_MENU_ID,
  MAXAI_CONTEXT_MENU_PORTAL_ID,
  MAXAI_MINIMIZE_CONTAINER_ID,
  MAXAI_SIDEBAR_ID,
} from '@/features/common/constants'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const numberWithCommas = (number: number, digits = 2) => {
  return Number(number)
    .toFixed(digits)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
export const getAppActiveElement = (): HTMLElement | null => {
  const element = document.querySelector(`#${MAXAI_SIDEBAR_ID}`)?.shadowRoot
    ?.activeElement as HTMLDivElement
  if (element === undefined) return null
  return element
}

export const getFloatingContextMenuActiveElement = (): HTMLElement | null => {
  const element = document.querySelector(`#${MAXAI_CONTEXT_MENU_ID}`)
    ?.shadowRoot?.activeElement as HTMLDivElement
  if (element === undefined) return null
  return element
}
export const getAppContextMenuRootElement = (): HTMLDivElement | null => {
  const portals =
    document
      .querySelector(`#${MAXAI_CONTEXT_MENU_ID}`)
      ?.shadowRoot?.querySelectorAll(`#${MAXAI_CONTEXT_MENU_PORTAL_ID}`) || []
  const portal = Array.from(portals).find((portal) => portal.innerHTML !== '')
  return portal as HTMLDivElement
}

export const getAppMinimizeContainerElement = (): HTMLDivElement | null => {
  return document
    .querySelector(`#${MAXAI_MINIMIZE_CONTAINER_ID}`)
    ?.shadowRoot?.querySelector('div') as HTMLDivElement
}

/**
 * 对于一些特殊的网站, 在聊天框显示的时候, 需要修改一些样式
 */
const modifyHTMLStyleForSpecialWebsiteOnChatBoxShow = () => {
  const htmlElement = document.body.parentElement
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  const host = getCurrentDomainHost()
  if (htmlElement && chatBoxElement) {
    const chatBoxElementWidth =
      chatBoxElement.offsetWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    if (
      host === 'outlook.live.com' ||
      host === 'onedrive.live.com' ||
      host === 'outlook.office.com' ||
      host === 'outlook.office365.com'
    ) {
      htmlElement.style.minHeight = '100vh'
    }
    if (host === 'teams.live.com') {
      document.querySelectorAll('.overlay-hybrid').forEach((element: any) => {
        element.style.width = `calc(100% - ${chatBoxElementWidth}px)`
        element.childNodes.forEach((child: any) => {
          if (child.tagName === 'IFRAME') {
            child.style.width = '100%'
          }
        })
      })
    }
    if (host === 'studio.youtube.com') {
      const youTubeStudioContainer = document.querySelector(
        '#main-container',
      ) as HTMLDivElement
      youTubeStudioContainer.style.width = `calc(100% - ${chatBoxElementWidth}px)`
    }
    if (host === 'youtube.com') {
      document
        .querySelectorAll('.ytp-chrome-bottom')
        .forEach((element: any) => {
          element.style.maxWidth = '95%'
        })
    }
  }
  // 浏览器自带的pdf文件阅读器
  if (document.querySelector('embed[type="application/pdf"]')) {
    document.body.style.height = '100vh'
  }
}

/**
 * 对于一些特殊的网站，当聊天框隐藏的时候，需要修改一些样式
 */
const modifyHTMLStyleForSpecialWebsiteOnChatBoxHide = () => {
  const htmlElement = document.body.parentElement
  const host = getCurrentDomainHost()
  if (htmlElement) {
    if (
      host === 'outlook.live.com' ||
      host === 'onedrive.live.com' ||
      host === 'outlook.office.com'
    ) {
      htmlElement.style.minHeight = ''
    }
    if (host === 'teams.live.com') {
      document.querySelectorAll('.overlay-hybrid').forEach((element: any) => {
        element.style.width = `100%`
        element.childNodes.forEach((child: any) => {
          if (child.tagName === 'IFRAME') {
            child.style.width = '100vw'
          }
        })
      })
    }
    if (host === 'youtube.com') {
      document
        .querySelectorAll('.ytp-chrome-bottom')
        .forEach((element: any) => {
          element.style.maxWidth = ''
        })
    }
    if (host === 'studio.youtube.com') {
      const youTubeStudioContainer = document.querySelector(
        '#main-container',
      ) as HTMLDivElement
      youTubeStudioContainer.style.width = `100%`
    }
  }
  // 浏览器自带的pdf文件阅读器
  if (document.querySelector('embed[type="application/pdf"]')) {
    document.body.style.height = ''
  }
}

export const showChatBox = () => {
  const htmlElement = document.body.parentElement
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  if (htmlElement && chatBoxElement) {
    const chatBoxElementWidth =
      chatBoxElement.offsetWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    htmlElement.style.transition = 'width .1s ease-inout'
    htmlElement.style.width = `calc(100% - ${chatBoxElementWidth}px)`
    htmlElement.style.position = 'relative'
    modifyHTMLStyleForSpecialWebsiteOnChatBoxShow()
    if (!chatBoxElement.classList.contains('open')) {
      chatBoxElement.classList.remove('close')
      chatBoxElement.classList.add('open')
    }
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
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  if (htmlElement && chatBoxElement) {
    htmlElement.style.transition = 'width .1s ease-inout'
    htmlElement.style.width = '100%'
    htmlElement.style.position = ''
    modifyHTMLStyleForSpecialWebsiteOnChatBoxHide()
    chatBoxElement.classList.remove('open')
    chatBoxElement.classList.add('close')
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }
}
export const isShowChatBox = () => {
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  return chatBoxElement?.classList.contains('open') || false
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

export const CLIENT_OPEN_PAGE_KEYS = [
  'shortcuts',
  'options',
  'daemon_process',
  'current_page',
  'chatgpt',
  'manage_extension',
] as const

export const chromeExtensionClientOpenPage = async (params: {
  key?: typeof CLIENT_OPEN_PAGE_KEYS[number]
  url?: string
  query?: string
  active?: boolean
}) => {
  const { key, url, query, active = true } = params
  if (!url && !key) {
    return
  }
  const port = new ContentScriptConnectionV2()
  let result: any = null
  if (key) {
    result = await port.postMessage({
      event: 'Client_openUrl',
      data: {
        key,
        query,
        active,
      },
    })
  } else {
    result = await port.postMessage({
      event: 'Client_openUrl',
      data: {
        url,
        query,
        active,
      },
    })
  }
  port.destroy()
  return (result.data?.tabId as number) || null
}
export const chromeExtensionClientClosePage = async (params: {
  tabId?: number
  url?: string
}) => {
  const { tabId, url } = params
  if (!tabId && !url) {
    return
  }
  const port = new ContentScriptConnectionV2()
  let result: { success: boolean; message: string; data: boolean } | null = null
  if (url) {
    result = await port.postMessage({
      event: 'Client_closeUrl',
      data: {
        url,
      },
    })
  } else {
    result = await port.postMessage({
      event: 'Client_closeUrl',
      data: {
        tabId,
      },
    })
  }
  port.destroy()
  return result
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

export const promiseRetry = async <T>(
  fn: () => Promise<T>,
  retryCount = 3,
  delay = 1000,
): Promise<T | undefined> => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))
  try {
    const result = await fn()
    return result
  } catch (error) {
    if (retryCount <= 0) {
      // throw error
      return undefined
    }
    await sleep(delay)
    return promiseRetry(fn, retryCount - 1, delay)
  }
}

export const clientRestartChromeExtension = async () => {
  try {
    const port = new ContentScriptConnectionV2({
      runtime: 'client',
    })
    await port.postMessage({
      event: 'Client_restartApp',
      data: {},
    }) // 重启
    return true
  } catch (e) {
    return false
  }
}

export const clientRunBackgroundFunction = async <
  T extends IBackgroundRunCommandKey,
  K extends IBackgroundRunCommandFunctionKey<T>
>(
  command: T,
  commandFunctionName: K,
  commandFunctionData: IBackgroundRunCommandFunctionParams<T, K>,
) => {
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  const result = await port.postMessage({
    event: 'Client_backgroundRunFunction',
    data: {
      command,
      commandFunctionName,
      commandFunctionData,
    },
  })
  if (result.success) {
    return result.data as IBackgroundRunCommandFunctionReturn<T, K>
  } else {
    return null
  }
}
