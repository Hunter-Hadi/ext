import BaseChat from '@/background/src/chat/BaseChat'
import { PoeWebBot } from '@/background/src/chat/PoeChat/poe'
import { Event } from '@/background/src/chat/BingChat/bing/types'

class PoeChat extends BaseChat {
  private poeLib: PoeWebBot
  constructor() {
    super('PoeChat')
    this.poeLib = new PoeWebBot()
    this.status = 'success'
  }
  async init() {
    this.log.info('init')
  }
  async auth() {
    this.active = true
    await this.updateClientStatus('success')
  }
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
      max_history_message_cnt?: number
    },
    onMessage?: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
      }
    }) => void,
  ) {
    const { taskId } = options || {}
    this.log.info('askChatGPT')
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    await this.poeLib.doSendMessage({
      prompt: question,
      signal,
      onEvent(event: Event) {
        console.log(event)
        if (event.type === 'ERROR') {
          onMessage?.({
            type: 'error',
            done: true,
            error: event.error,
            data: {
              text: '',
              conversationId: '',
            },
          })
        } else if (event.type === 'UPDATE_ANSWER') {
          onMessage?.({
            type: 'message',
            done: false,
            error: '',
            data: {
              text: event.data.text,
              conversationId: event.data.conversationId,
            },
          })
        } else if (event.type === 'DONE') {
          onMessage?.({
            type: 'message',
            done: true,
            error: '',
            data: {
              text: '',
              conversationId: event.data.conversationId,
            },
          })
        }
      },
    })
  }
  resetConversation() {
    this.poeLib.resetConversation()
  }
}
export { PoeChat }
