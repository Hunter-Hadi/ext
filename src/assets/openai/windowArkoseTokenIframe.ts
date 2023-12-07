/**
 * 1. 生成ArkoseTokenGenerator
 * 2. 插件和windowArkoseTokenIFrame的通信
 */
import {
  ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
  ArkoseTokenModelType,
} from '@/assets/openai/arkoseTokenIframeId'

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
  model: ArkoseTokenModelType
  private apiLink: string
  private enforcement?: ArkoseEnforcement
  private pendingPromises: {
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }[] = []
  private cacheToken: string = ''
  isReady: boolean
  config: any
  constructor(model: ArkoseTokenModelType, apiLink: string) {
    this.isReady = false
    this.model = model
    this.apiLink = apiLink
    this.enforcement = undefined
    this.pendingPromises = []
    if (this.model === 'gpt_3_5') {
      ;(window as any).useArkoseSetupEnforcementgpt35 = this.useArkoseSetupEnforcement.bind(
        this,
      )
    } else if (this.model === 'gpt_4') {
      ;(window as any).useArkoseSetupEnforcementgpt4 = this.useArkoseSetupEnforcement.bind(
        this,
      )
    }
    this.injectScript()
  }

  private useArkoseSetupEnforcement(enforcement: ArkoseEnforcement) {
    this.enforcement = enforcement
    console.debug(`[${this.model}] bing config`)
    enforcement.setConfig({
      onCompleted: (r) => {
        console.debug(`[${this.model}] enforcement.onCompleted`, r)
        if (this.pendingPromises.length === 0) {
          console.debug(`[${this.model}] enforcement.save Cached`)
          this.cacheToken = r.token
        }
        this.pendingPromises.forEach((promise) => {
          promise.resolve(r.token)
        })
        this.pendingPromises = []
      },
      onReady: () => {
        this.isReady = true
        console.debug(`[${this.model}] enforcement.onReady`)
        enforcement.run()
      },
      onError: (r) => {
        console.debug(`[${this.model}] enforcement.onError`, r)
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
    if (this.model === 'gpt_3_5') {
      script.src = this.apiLink
      script.setAttribute('data-callback', 'useArkoseSetupEnforcementgpt35')
      script.setAttribute('data-status', 'loading')
    } else if (this.model === 'gpt_4') {
      script.src = this.apiLink
      script.setAttribute('data-callback', 'useArkoseSetupEnforcementgpt4')
      script.setAttribute('data-status', 'loading')
    }
    document.body.appendChild(script)
  }

  async generate() {
    if (!this.enforcement) {
      return ''
    }
    if (this.cacheToken) {
      const cache = this.cacheToken
      this.cacheToken = ''
      return cache
    }
    return new Promise((resolve, reject) => {
      this.pendingPromises = [{ resolve, reject }] // store only one promise for now.
      this.enforcement?.run()
    })
  }
}

const gpt35ScriptLink = document
  .querySelector('script[data-arkose_token_gpt_3_5]')
  ?.getAttribute('data-arkose_token_gpt_3_5')
const gpt4ScriptLink = document
  .querySelector('script[data-arkose_token_gpt_4]')
  ?.getAttribute('data-arkose_token_gpt_4')
if (gpt35ScriptLink && gpt4ScriptLink) {
  const GPT35ArkoseTokenIframeGenerator = new ArkoseTokenIframeGenerator(
    'gpt_3_5',
    gpt35ScriptLink,
  )
  const GPT4ArkoseTokenIframeGenerator = new ArkoseTokenIframeGenerator(
    'gpt_4',
    gpt4ScriptLink,
  )
  // 判断是否Ready - 7s
  for (let i = 0; i < 7; i++) {
    if (
      GPT35ArkoseTokenIframeGenerator.isReady ||
      GPT4ArkoseTokenIframeGenerator.isReady
    ) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (
    GPT35ArkoseTokenIframeGenerator.isReady ||
    GPT4ArkoseTokenIframeGenerator.isReady
  ) {
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
    // 2. 插件和windowArkoseTokenIFrame的通信
    window.addEventListener('message', async (event: any) => {
      if (
        event.data &&
        event.data.id === ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID
      ) {
        const model: ArkoseTokenModelType = event.data?.data?.model || 'gpt_3_5'
        if (event.data.type === 'ping') {
          event.source.postMessage(
            {
              type: 'pong',
              id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
              data: {
                success:
                  model === 'gpt_3_5'
                    ? GPT35ArkoseTokenIframeGenerator.isReady
                    : GPT4ArkoseTokenIframeGenerator.isReady,
              },
            },
            event.origin,
          )
        } else if (event.data.type === 'get_token') {
          const arkoseGenerator =
            model === 'gpt_3_5'
              ? GPT35ArkoseTokenIframeGenerator
              : GPT4ArkoseTokenIframeGenerator
          const token = await Promise.race([
            GPT4ArkoseTokenIframeGenerator.generate(),
            GPT35ArkoseTokenIframeGenerator.generate(),
          ])
          console.debug(`[${arkoseGenerator.model}] enforcement.result`, token)
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
