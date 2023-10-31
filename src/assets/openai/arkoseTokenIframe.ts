import { ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID } from '@/assets/openai/arkoseTokenIframeId'

interface ArkoseEnforcement {
  config: any
  setConfig(config: {
    onCompleted: (result: any) => void
    onReady: () => void
    onError: (result: any) => void
    onFailed: (result: any) => void
  }): void
  run(): void
}
class ArkoseTokenIframeGenerator {
  private enforcement?: ArkoseEnforcement
  private pendingPromises: {
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }[] = []
  isReady: boolean
  config: any
  constructor() {
    this.isReady = false
    this.enforcement = undefined
    this.pendingPromises = []
    ;(window as any).useArkoseSetupEnforcement = this.useArkoseSetupEnforcement.bind(
      this,
    )
    this.injectScript()
  }

  private useArkoseSetupEnforcement(enforcement: ArkoseEnforcement) {
    this.enforcement = enforcement
    enforcement.setConfig({
      onCompleted: (r) => {
        console.debug('enforcement.onCompleted', r)
        this.pendingPromises.forEach((promise) => {
          promise.resolve(r.token)
        })
        this.pendingPromises = []
      },
      onReady: () => {
        this.isReady = true
        console.debug('enforcement.onReady')
      },
      onError: (r) => {
        console.debug('enforcement.onError', r)
      },
      onFailed: (r) => {
        console.debug('enforcement.onFailed', r)
        this.pendingPromises.forEach((promise) => {
          promise.reject(new Error('Failed to generate arkose token'))
        })
      },
    })
  }

  injectScript() {
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = './js/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js'
    script.setAttribute('data-callback', 'useArkoseSetupEnforcement')
    document.body.appendChild(script)
  }

  async generate() {
    if (!this.enforcement) {
      return
    }
    return new Promise((resolve, reject) => {
      this.pendingPromises = [{ resolve, reject }] // store only one promise for now.
      this.enforcement?.run()
    })
  }
}
const arkoseTokenIframeGenerator = new ArkoseTokenIframeGenerator()
window.onload = async () => {
  let cacheToken: string = ''
  window.addEventListener('message', async (event: any) => {
    if (
      event.data &&
      event.data.id === ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID
    ) {
      if (event.data.type === 'ping') {
        event.source.postMessage(
          {
            type: 'pong',
            id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
            data: {
              success: arkoseTokenIframeGenerator.isReady,
            },
          },
          event.origin,
        )
      } else if (event.data.type === 'get_token') {
        const token =
          cacheToken || (await arkoseTokenIframeGenerator.generate())
        cacheToken = ''
        event.source.postMessage(
          {
            type: 'get_token_response',
            id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
            data: {
              token,
            },
          },
          event.origin,
        )
      }
    }
  })
  // 好像有玄学问题，需要直接执行一次
  arkoseTokenIframeGenerator.generate().then((token) => {
    cacheToken = token as string
  })
  // 判断是否Ready - 5s
  for (let i = 0; i < 5; i++) {
    if (arkoseTokenIframeGenerator.isReady) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (arkoseTokenIframeGenerator.isReady) {
    // 注入成功
    window.parent.postMessage(
      {
        id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
        type: 'inject_iframe_response',
        data: {
          success: true,
        },
      },
      '*',
    )
  } else {
    // 通知需要重新注入iframe
    window.parent.postMessage(
      {
        id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
        type: 'inject_iframe_response',
        data: {
          success: false,
        },
      },
      '*',
    )
  }
}
