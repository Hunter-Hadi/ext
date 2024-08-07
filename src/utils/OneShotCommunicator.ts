import { v4 as uuidV4 } from 'uuid'

export type IOneShotCommunicatorCustomEventNameType =
  | 'SetVariablesModal'
  | 'CanUseChatWithImage'
  | 'QuickChatWithImage'
  | 'QuickSearchSelectedText'
  | 'ConversationUpdate'
  | 'ConversationMessagesUpdate'
/**
 * 一次性通信器
 */
class OneShotCommunicator {
  private pending: Map<string, (value: any) => void> = new Map()
  constructor() {}
  /**
   * 发送信息，并等待接收端的响应
   * @param customEventName 事件名称
   * @param data 需要发送的数据
   * @param timeout 超时时间，单位毫秒，默认 5 秒
   * @returns Promise 对象，当接收到响应或超时时将被解决/拒绝
   */
  async send(
    customEventName: IOneShotCommunicatorCustomEventNameType,
    data: any,
    timeout = 5 * 1000,
  ): Promise<any> {
    const uniqueId = uuidV4()
    const eventDetail = { ...data, uuid: uniqueId }

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pending.delete(uniqueId)
        resolve(undefined)
        // reject(
        //   new Error(
        //     'Timeout Error' +
        //     customEventName +
        //     '\n' +
        //     JSON.stringify(data, null, 2),
        //   ),
        // )
      }, timeout)

      this.pending.set(uniqueId, (response: any) => {
        clearTimeout(timeoutHandle)
        resolve(response)
      })

      window.dispatchEvent(
        new CustomEvent(customEventName, { detail: eventDetail }),
      )
    })
  }

  /**
   * 监听并接收信息，处理接收到的信息，并将结果发送回去
   * @param customEventName 事件名称
   * @param callback 用于处理接收到的数据的函数
   */
  receive(
    customEventName: IOneShotCommunicatorCustomEventNameType,
    callback: (data: any) => any,
  ) {
    const listener = async (event: Event) => {
      if (event instanceof CustomEvent && event.detail && event.detail.uuid) {
        const { uuid, ...data } = event.detail
        let response: any

        // 调用回调函数，并等待（如果需要）其完成
        const result = callback(data)
        if (result instanceof Promise) {
          response = await result
        } else {
          response = result
        }
        // 如果回调函数没有返回值，则不发送回去
        if (response === undefined) {
          return
        }
        // 将回调函数的结果发送回去
        const resolver = this.pending.get(uuid)
        if (resolver) {
          resolver(response)
          this.pending.delete(uuid)
        }
      }
    }
    window.addEventListener(customEventName, listener)
    return () => {
      window.removeEventListener(customEventName, listener)
    }
  }
}
//
// // 使用示例：
//
// // 发送端
// const sender = new OneShotCommunicator()
//
// async function doTask() {
//   try {
//     const response = await sender.send('myCustomEventName', {
//       task: 'doSomething',
//     })
//     console.log('Received response:', response)
//   } catch (error) {
//     console.error('Error:', error.message)
//   }
// }
//
// doTask()
//
// // 接收端
// const receiver = new OneShotCommunicator()
//
// receiver.receive('myCustomEventName', async (data) => {
//   if (data.task === 'doSomething') {
//     return 'Task done!'
//   }
//   return 'Unknown task'
// })
export default new OneShotCommunicator()
