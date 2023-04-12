import { ChatStatus } from '@/background/provider/chat'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import Log from '@/utils/Log'

const log = new Log('UseChatGPTPlusChat')
class UseChatGPTPlusChat {
  status: ChatStatus = 'needAuth'
  private token?: string
  constructor() {
    this.init()
  }
  private init() {
    console.log('init')
  }
  async auth() {
    this.status = 'loading'
    this.token = await this.getToken()
    if (this.token) {
      this.status = 'complete'
    }
  }
  private async getToken() {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0Ijp7InVzZXJfaWQiOiIzY2ZiZGRhZC01YzNhLTQxZDQtODE5My00N2ZiYmMzMTc0NzEifSwidHlwZSI6InJlZnJlc2giLCJleHAiOjE2ODc3NDU4OTAsImlhdCI6MTY3OTk2OTg5MCwianRpIjoiN2QzYjc3NTYtYjdkOS00MjgwLTkzNTAtNTM2MDYyY2JhMWUyIn0.yVmT1pfo8PSlnXOn5p7QCz0FNV6YLL4X1zAzWMOqJro'
    this.token = token
    const controller = new AbortController()
    await fetchSSE(`https://dev.usechatgpt.ai/gpt/get_chatgpt_response`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(
        Object.assign({
          message_content: 'give me a long story',
        }),
      ),
      onMessage: (message: string) => {
        log.info(message)
      },
    })
      .then()
      .catch((err) => {
        log.error(err)
      })
    return token
  }
}
export { UseChatGPTPlusChat }
