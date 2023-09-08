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

  private useArkoseSetupEnforcement(enforcement: ArkoseEnforcement) {
    this.enforcement = enforcement
    enforcement.setConfig({
      onCompleted: (result) => {
        console.debug('enforcement.onCompleted', result)
        this.pendingPromises.forEach((promise) => {
          promise.resolve(result.token)
        })
        this.pendingPromises = []
      },
      onReady: () => {
        console.debug('enforcement.onReady')
      },
      onError: (result) => {
        console.debug('enforcement.onError', result)
      },
      onFailed: (result) => {
        console.debug('enforcement.onFailed', result)
        this.pendingPromises.forEach((promise) => {
          promise.reject(new Error('Failed to generate arkose token'))
        })
      },
    })
  }

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

  async generate(): Promise<any> {
    if (!this.enforcement) {
      return
    }
    return new Promise((resolve, reject) => {
      this.pendingPromises = [{ resolve, reject }] // store only one promise for now.
      this.enforcement!.run()
    })
  }
}

export const arkoseTokenGenerator = new ArkoseTokenGenerator()
