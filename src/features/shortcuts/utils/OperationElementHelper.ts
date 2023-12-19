import concat from 'lodash-es/concat'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { IChromeExtensionSendEvent } from '@/background/eventType'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'

export interface IExecuteOperationResult {
  success: boolean
  elementsInnerText: string
  link: string
}

export const backgroundSendClientToExecuteOperationElement = (
  tabId: number,
  OperationElementConfig: OperationElementConfigType,
) => {
  const executeOperationErrorResult: IExecuteOperationResult = {
    success: false,
    elementsInnerText: '',
    link: '',
  }
  const maxExecuteTimes =
    (OperationElementConfig.durationTimes || 30 * 1000) + 5 * 1000
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<IExecuteOperationResult>(async (resolve) => {
    let isResolve = false
    const taskId = uuidV4()
    setTimeout(() => {
      if (!isResolve) {
        isResolve = true
        resolve(executeOperationErrorResult)
      }
    }, maxExecuteTimes)
    const errorListener = setInterval(async () => {
      if (isResolve) {
        clearInterval(errorListener)
      }
      try {
        await Browser.tabs.sendMessage(tabId, {
          id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_pong' as IChromeExtensionSendEvent,
        })
        console.log('OperationElement errorListener pong')
      } catch (e) {
        console.log('OperationElement errorListener error')
        if (!isResolve) {
          isResolve = true
          resolve(executeOperationErrorResult)
        }
      }
    }, 1000)
    try {
      const onceListener = (message: any) => {
        const { data: responseData, event } = message
        if (
          event === 'ShortCuts_OperationPageElementResponse' &&
          responseData.taskId === taskId
        ) {
          if (!isResolve) {
            isResolve = true
            resolve(responseData?.data?.data)
          }
        }
      }
      Browser.runtime.onMessage.addListener(onceListener)
      await Browser.tabs.sendMessage(tabId, {
        id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
        event: 'ShortCuts_ClientExecuteOperationPageElement' as IChromeExtensionSendEvent,
        data: {
          taskId,
          OperationElementConfig,
        },
      })
    } catch (e) {
      if (!isResolve) {
        isResolve = true
        resolve(executeOperationErrorResult)
      }
    }
  })
}

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

export const clientExecuteOperationElement = async (
  taskId: number,
  OperationElementConfig: OperationElementConfigType,
) => {
  const {
    rootElementSelector,
    isShadowElement = false,
    elementSelectors,
    beforeDelay = 0,
    afterDelay = 0,
    executeElementCount = 1,
    durationTimes = 30 * 1000,
    rotationTimes = 3000,
    rotationInterval = 1000,
    actionType = 'click',
    actionExtraData,
  } = OperationElementConfig || {}
  const executeResult: IExecuteOperationResult = {
    success: false,
    elementsInnerText: '',
    link: '',
  }
  const doc = document
  let rootElement = rootElementSelector
    ? doc.querySelector(rootElementSelector)
    : doc
  if (isShadowElement) {
    rootElement = (rootElement as any).shadowRoot
  }
  if (!elementSelectors || elementSelectors?.length === 0 || !rootElement) {
    Browser.runtime.sendMessage({
      event: 'ShortCuts_OperationPageElementResponse',
      data: {
        taskId,
        success: executeResult.success,
        data: executeResult,
      },
    })
    return
  }
  if (rootElement) {
    const execute = async () => {
      await delay(beforeDelay)
      let elements: HTMLElement[] = []
      let rotationUsageTimes = 0
      while (elements.length === 0 && rotationUsageTimes < rotationTimes) {
        elements = concat(
          ...elementSelectors.map((elementSelector) => {
            return Array.from(
              rootElement!.querySelectorAll(elementSelector),
            ) as HTMLElement[]
          }),
        )
        if (elements.length === 0) {
          rotationUsageTimes += rotationInterval
          await delay(rotationInterval)
        }
      }
      // 找不到元素
      if (elements.length === 0) {
        return executeResult
      }
      elements = elements.slice(0, executeElementCount)
      elements.forEach((element) => {
        switch (actionType) {
          case 'click':
            {
              element.click()
            }
            break
          case 'insertText':
            {
              const text =
                actionExtraData?.text || actionExtraData?.value.toString() || ''
              element.focus()
              if (element.getAttribute('contenteditable') === 'true') {
                const selection = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(element)
                selection?.removeAllRanges()
                selection?.addRange(range)
              }
              if (actionExtraData?.clearBeforeInsertText) {
                if (
                  element.tagName === 'INPUT' ||
                  element.tagName === 'TEXTAREA'
                ) {
                  console.log(element)
                  ;(element as HTMLInputElement).select()
                  doc.execCommand('Delete', false, '')
                }
              }
              doc.execCommand('insertText', false, text)
            }
            break
          case 'getText':
            {
              const innerText = element?.innerText || ''
              executeResult.elementsInnerText += innerText
            }
            break
          case 'getLink':
            {
              if (element.tagName === 'A') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLAnchorElement).href
              } else if (element.tagName === 'IMG') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLImageElement).src
              } else if (element.tagName === 'VIDEO') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLVideoElement).src
              } else if (element.tagName === 'IFRAME') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLIFrameElement).src
              } else if (element.tagName === 'EMBED') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLEmbedElement).src
              } else if (element.tagName === 'SOURCE') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLSourceElement).src
              } else if (element.tagName === 'TRACK') {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += (element as HTMLTrackElement).src
              } else {
                if (executeResult.link) {
                  executeResult.link += ','
                }
                executeResult.link += element?.innerText || ''
              }
            }
            break
          default:
            break
        }
      })
      executeResult.success = true
      await delay(afterDelay)
      return executeResult
    }
    await Promise.race([execute(), delay(durationTimes)])
    Browser.runtime.sendMessage({
      event: 'ShortCuts_OperationPageElementResponse',
      data: {
        taskId,
        data: {
          success: executeResult.success,
          message: executeResult.success ? 'ok' : 'error',
          data: executeResult,
        },
      },
    })
  }
}
