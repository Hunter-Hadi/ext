interface ArkoseEnforcement {
  setConfig(config: {
    onCompleted: (result: any) => void
    onReady: () => void
    onError: (result: any) => void
    onFailed: (result: any) => void
  }): void
  run(): void
}

const MAX_AI_CHAT_GPT_MESSAGE_KEY = 'MAX_AI_CHAT_GPT_MESSAGE_KEY'

class ArkoseTokenGenerator {
  private enforcement?: ArkoseEnforcement
  private pendingPromises: {
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }[] = []
  config: any

  constructor() {
    window.addEventListener('message', async (event: any) => {
      if (
        event.data?.event === MAX_AI_CHAT_GPT_MESSAGE_KEY &&
        event.data?.type === 'arkoseToken'
      ) {
        const result = await this.generate()
        window.postMessage({
          event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
          type: 'arkoseTokenResponse',
          data: {
            taskId: event.data?.data?.taskId,
            token: result,
          },
        })
      }
    })
  }
  // 第二部 拦截setConfig
  private useArkoseSetupEnforcement(enforcement: ArkoseEnforcement) {
    this.enforcement = enforcement
    ;(window as any).useArkoseSetupEnforcement(
      new Proxy(enforcement, {
        get: (target: ArkoseEnforcement, p: string | symbol, receiver: any) => {
          if (p === 'setConfig') {
            debugger
            return (config: any) => {
              this.config = config
              // 包装原本的onCompleted
              const onCompleted = config.onCompleted
              config.onCompleted = (result: any) => {
                onCompleted(result)
                this.pendingPromises.forEach((promise) => {
                  promise.resolve(result.token)
                })
                this.pendingPromises = []
              }
              // 包装原本的onFailed
              const onFailed = config.onFailed
              config.onFailed = (result: any) => {
                onFailed(result)
                this.pendingPromises.forEach((promise) => {
                  promise.reject(new Error('Failed to generate arkose token'))
                })
              }
              return Reflect.get(target, p, receiver)(config)
            }
          }
          return Reflect.get(target, p, receiver)
        },
      }),
    )
    // return
    // this.enforcement = enforcement
    // enforcement.setConfig({
    //   onCompleted: (result) => {
    //     console.debug('enforcement.onCompleted', result)
    //     this.pendingPromises.forEach((promise) => {
    //       promise.resolve(result.token)
    //     })
    //     this.pendingPromises = []
    //   },
    //   onReady: () => {
    //     console.debug('enforcement.onReady')
    //   },
    //   onError: (result) => {
    //     console.debug('enforcement.onError', result)
    //   },
    //   onFailed: (result) => {
    //     console.debug('enforcement.onFailed', result)
    //     this.pendingPromises.forEach((promise) => {
    //       promise.reject(new Error('Failed to generate arkose token'))
    //     })
    //   },
    // })
  }

  // 第一步 注入脚本
  public injectScript(src: string) {
    const win = window as any
    win.useArkoseSetupEnforcement2 = this.useArkoseSetupEnforcement.bind(this)
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.setAttribute('data-callback', 'useArkoseSetupEnforcement2')
    document.body.appendChild(script)
  }
  // 模拟用户输入 生成arkose token
  async loadConfig() {
    const input = (document.querySelector('#prompt-textarea') ||
      document.querySelector('textarea')) as HTMLTextAreaElement
    if (input) {
      input.focus()
      input.select()
      let isLoadedConfig = false
      while (!isLoadedConfig) {
        document.execCommand('insertText', false, 'a')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        isLoadedConfig = !!this.config
      }
    }
    input.select()
    document.execCommand('Delete', false, '')
    return true
  }
  async run() {
    const input = (document.querySelector('#prompt-textarea') ||
      document.querySelector('textarea')) as HTMLTextAreaElement
    if (input) {
      input.focus()
      input.select()
      document.execCommand('Delete', false, '')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      document.execCommand('insertText', false, 'a')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      document.execCommand('Delete', false, '')
    }
  }
  // 当用户用了gpt4相关的model，会调用这个方法
  async generate(): Promise<any> {
    if (!this.enforcement) {
      return
    }
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      this.pendingPromises = [{ resolve, reject }] // store only one promise for now.
      if (!this.config) {
        await this.loadConfig()
      }
      await this.run()
      // this.enforcement!.run()
    })
  }
}

export const arkoseTokenGenerator = new ArkoseTokenGenerator()
