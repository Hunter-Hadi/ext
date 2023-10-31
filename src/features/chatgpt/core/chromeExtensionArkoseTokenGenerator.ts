import Browser from 'webextension-polyfill'
import { getAppRootElement } from '@/utils'
import { promiseTimeout } from '@/utils/promiseUtils'
import Log from '@/utils/Log'
import { ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID } from '@/assets/openai/arkoseTokenIframeId'

const log = new Log('ArkoseIframeGenerator')

class ChromeExtensionArkoseTokenGenerator {
  static iframeId = 'maxai-arkose-token-generate-iframe'
  iframeInstance: HTMLIFrameElement | null = null
  constructor() {}
  async injectIframe() {
    // 先ping一次
    const isPingSuccess = await this.ping()
    // 如果ping成功，说明已经注入过了
    if (isPingSuccess) {
      return true
    }
    // 最大3次
    for (let i = 0; i < 3; i++) {
      const success = await this.injectIframeOnce()
      if (success) {
        log.info('inject iframe success')
        return true
      } else {
        this.removeIframe()
      }
    }
    log.info('inject iframe fail')
    return false
  }
  async generateToken() {
    // 第一步 注入iframe
    if (!(await this.injectIframe())) {
      return ''
    }
    // 第二步 获取arkoseToken和超时处理
    const token = await promiseTimeout(
      this.postMessageGenerateToken(),
      10 * 1000,
      '',
    )
    // 如果获取失败，移除iframe
    if (!token) {
      this.removeIframe()
    }
    log.info(`generateToken ${token ? 'success' : 'fail'}`, token)
    return token
  }
  private getRootContainer(): HTMLElement | undefined {
    return getAppRootElement()
  }
  private async ping() {
    log.info('ping')
    if (this.iframeInstance) {
      // 因为是ping 所以2秒超时
      const pingSuccess = await promiseTimeout(
        new Promise<boolean>((resolve) => {
          const once = (event: any) => {
            if (
              event.data &&
              event.data.id === ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID
            ) {
              const { data, type } = event.data
              if (type === 'pong') {
                log.info('ping result', data?.success === true)
                resolve(data?.success === true)
                window.removeEventListener('message', once)
              }
            }
          }
          window.addEventListener('message', once)
          this.iframeInstance?.contentWindow?.postMessage(
            {
              id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
              type: 'ping',
              data: {},
            },
            '*',
          )
        }),
        2000,
        false,
      )
      if (!pingSuccess) {
        this.removeIframe()
        return false
      }
      return true
    }
    log.info('ping result', false)
    return false
  }
  private injectIframeOnce() {
    return new Promise((resolve) => {
      const once = (event: any) => {
        if (
          event.data &&
          event.data.id === ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID
        ) {
          const { data, type } = event.data
          if (type === 'inject_iframe_response') {
            resolve(data?.success === true)
            window.removeEventListener('message', once)
          }
        }
      }
      window.addEventListener('message', once)
      const iframe = document.createElement('iframe')
      iframe.id = ChromeExtensionArkoseTokenGenerator.iframeId
      iframe.src = Browser.runtime.getURL('/assets/openai/arkoseToken.html')
      this.iframeInstance = iframe
      this.getRootContainer()?.append(iframe)
    })
  }
  private removeIframe() {
    const iframe = this.getRootContainer()?.querySelector(
      `#${ChromeExtensionArkoseTokenGenerator.iframeId}`,
    )
    if (iframe) {
      this.iframeInstance = null
      iframe.remove()
    }
  }
  private async postMessageGenerateToken() {
    return new Promise<string>((resolve) => {
      const once = (event: any) => {
        if (
          event.data &&
          event.data.id === ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID
        ) {
          const { data, type } = event.data
          if (type === 'get_token_response') {
            resolve(data?.token || '')
            window.removeEventListener('message', once)
          }
        }
      }
      window.addEventListener('message', once)
      this.iframeInstance?.contentWindow?.postMessage(
        {
          id: ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
          type: 'get_token',
          data: {},
        },
        '*',
      )
    })
  }
}

export const chromeExtensionArkoseTokenGenerator = new ChromeExtensionArkoseTokenGenerator()
