import { ROOT_CONTEXT_MENU_ID } from '@/constants'

export const intervalFindHtmlElement = (
  root: HTMLElement | ShadowRoot,
  selection: string,
  interval: number,
  timeout: number,
) => {
  return new Promise<HTMLElement | undefined>((resolve) => {
    let isTimeout = false
    const timeoutId = setTimeout(() => {
      isTimeout = true
      resolve(undefined)
    }, timeout)
    const intervalId = setInterval(() => {
      if (!isTimeout) {
        const selectionElement = root.querySelector(selection) as HTMLElement
        if (selectionElement) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          resolve(selectionElement as HTMLElement)
        }
      }
    }, interval)
  })
}
export const intervalFindAllHtmlElement = (
  root: HTMLElement | ShadowRoot,
  selection: string,
  interval: number,
  timeout: number,
  filterElements?: (elements: HTMLElement[]) => HTMLElement | undefined,
) => {
  return new Promise<HTMLElement | undefined>((resolve) => {
    let isTimeout = false
    const timeoutId = setTimeout(() => {
      isTimeout = true
      resolve(undefined)
    }, timeout)
    const intervalId = setInterval(() => {
      if (!isTimeout) {
        const selectionElements = Array.from(
          root.querySelectorAll(selection),
        ) as HTMLElement[]
        if (filterElements) {
          const findElement = filterElements(selectionElements)
          if (findElement) {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            resolve(findElement)
          }
        } else if (selectionElements.length > 0) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          resolve(selectionElements[0])
        }
      }
    }, interval)
  })
}
const runEmbedShortCuts = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    // setTimeOut: 5000ms
    const isTimeout = false
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        error: 'timeout',
      })
    }, 4000)
    const resolveValue = (value: { success: boolean; error: string }) => {
      if (!isTimeout) {
        clearTimeout(timeout)
        resolve(value)
      }
    }
    try {
      // set selection
      const shadowRoot =
        document.getElementById(ROOT_CONTEXT_MENU_ID)?.shadowRoot
      // find contextMenu click button in 2000ms
      if (shadowRoot) {
        const contextMenuButton = await intervalFindAllHtmlElement(
          shadowRoot,
          '.usechatgpt-ai__context-menu--handle-button',
          200,
          2000,
          (elements) => {
            // 判断找到的元素是否是隐藏的
            return elements.find((element) => {
              return window.getComputedStyle(element).opacity !== '0'
            })
          },
        )
        console.log('contextMenuButton', contextMenuButton)
        if (contextMenuButton) {
          setTimeout(() => {
            contextMenuButton.click()
          }, 100)
          const contextMenuItem = await intervalFindAllHtmlElement(
            shadowRoot,
            '.floating-context-menu-item',
            50,
            2000,
            (elements) =>
              elements.find((menuItem) =>
                (menuItem as HTMLDivElement).innerText.startsWith(
                  'Run this prompt',
                ),
              ),
          )
          if (contextMenuItem) {
            contextMenuItem.click()
            resolveValue({
              success: true,
              error: '',
            })
            return
          }
        }
      }
      resolveValue({
        success: false,
        error: 'no context menu',
      })
    } catch (e) {
      console.log('error', e)
      resolveValue({
        success: false,
        error: e?.toString() || '',
      })
    }
  })
}
export default runEmbedShortCuts
