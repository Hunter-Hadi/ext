import Log from '@/utils/Log'

const log = new Log('BackgroundAbortFetch')
/**
 * 给客户端创建可以终止的 fetch
 * @description - 扩展了 Fetch API 并添加了 taskId 参数和 fetchMap 用于维护请求
 */
class BackgroundAbortFetch {
  private fetchMap: Map<string, AbortController>

  constructor() {
    this.fetchMap = new Map<string, AbortController>()
  }

  fetch(
    url: string,
    options?: RequestInit,
    taskId?: string,
  ): Promise<Response> {
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      if (this.fetchMap.has(taskId)) {
        const existingController = this.fetchMap.get(taskId)
        existingController?.abort()
      }
      this.fetchMap.set(taskId, controller)
      log.info(`start [task]`, url, taskId)
    } else {
      log.info(`start [no task]`, url)
    }

    options = { ...options, signal }

    return fetch(url, options).finally(() => {
      if (taskId) {
        this.fetchMap.delete(taskId)
      }
    })
  }

  abort(taskId: string): boolean {
    const controller = this.fetchMap.get(taskId)
    controller?.abort()
    this.fetchMap.delete(taskId)
    log.info(`abort task`, taskId)
    return true
  }
}
export default new BackgroundAbortFetch()
