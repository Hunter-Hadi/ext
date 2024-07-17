/**
 * promiseTimeout - 用来给 Promise 添加超时功能
 * @param promise
 * @param timeout
 * @param fallbackData
 */
export const promiseTimeout = <T>(
  promise: Promise<T>,
  timeout: number,
  fallbackData: T,
): Promise<T> => {
  return new Promise<T>((resolve) => {
    // 创建一个超时定时器
    const timeoutId = setTimeout(() => {
      resolve(fallbackData)
    }, timeout)

    // 等待原始的 Promise 完成
    promise.then((result) => {
      // 在 Promise 完成时清除超时定时器，并返回结果
      clearTimeout(timeoutId)
      resolve(result)
    })
  })
}

/**
 * sleep - 用来暂停执行
 * @param ms
 * @returns
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
