import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { promiseTimeout } from '@/utils/promiseUtils'
export type WebWorkerEventType = 'WEB_WORKER_GET_TOKENS'

/**
 * 执行web worker 任务
 * @param eventType
 * @param data
 */
export const executeWebWorkerTask = <T>(
  eventType: WebWorkerEventType,
  data: any,
): Promise<T | undefined> => {
  const promiseHandle = new Promise<T | undefined>((resolve) => {
    const worker = new Worker(Browser.runtime.getURL('worker.js'))
    const taskId = uuidV4()
    worker.postMessage({
      taskId,
      eventType,
      data,
    })
    worker.onmessage = (event) => {
      if (event.data?.taskId === taskId) {
        const response = event.data.data
        resolve(response)
        worker.terminate()
      }
    }
    worker.onerror = (error) => {
      console.error('sendWebWorkerTask error', error)
      resolve(undefined)
      worker.terminate()
    }
  })
  return promiseTimeout(promiseHandle, 10 * 1000, undefined)
}
