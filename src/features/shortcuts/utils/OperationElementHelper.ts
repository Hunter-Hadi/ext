import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChromeExtensionSendEvent } from '@/background/eventType'
import concat from 'lodash-es/concat'

export const backgroundSendClientToExecuteOperationElement = (
  tabId: number,
  OperationElementConfig: OperationElementConfigType,
) => {
  const maxExecuteTimes =
    (OperationElementConfig.durationTimes || 30 * 1000) + 5 * 1000
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<boolean>(async (resolve) => {
    let isResolve = false
    const taskId = uuidV4()
    setTimeout(() => {
      if (!isResolve) {
        isResolve = true
        resolve(false)
      }
    }, maxExecuteTimes)
    const onceListener = (message: any) => {
      const { data: responseData, event } = message
      if (
        event === 'ShortCuts_OperationPageElementResponse' &&
        responseData.taskId === taskId
      ) {
        if (!isResolve) {
          isResolve = true
          resolve(responseData?.data?.success || false)
        }
      }
    }
    Browser.runtime.onMessage.addListener(onceListener)
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event:
        'ShortCuts_ClientExecuteOperationPageElement' as IChromeExtensionSendEvent,
      data: {
        taskId,
        OperationElementConfig,
      },
    })
  })
}

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

export const clientExecuteOperationElement = async (
  taskId: number,
  OperationElementConfig: OperationElementConfigType,
) => {
  if (
    !OperationElementConfig.elementSelectors ||
    OperationElementConfig.elementSelectors?.length === 0
  ) {
    Browser.runtime.sendMessage({
      event: 'ShortCuts_OperationPageElementResponse',
      data: {
        taskId,
        success: false,
      },
    })
    return
  }
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
  } = OperationElementConfig || {}
  let rootElement = rootElementSelector
    ? document.querySelector(rootElementSelector)
    : document
  if (isShadowElement) {
    rootElement = (rootElement as any).shadowRoot
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
      elements = elements.slice(0, executeElementCount)
      elements.forEach((element) => {
        switch (actionType) {
          case 'click':
            {
              element.click()
            }
            break
          default:
            break
        }
      })
      await delay(afterDelay)
      return true
    }
    const result = await Promise.race([execute(), delay(durationTimes)])
    Browser.runtime.sendMessage({
      event: 'ShortCuts_OperationPageElementResponse',
      data: {
        taskId,
        data: {
          success: result === true,
          message: result === true ? 'ok' : 'error',
          data: result === true,
        },
      },
    })
  }
}
