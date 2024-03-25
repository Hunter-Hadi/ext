import {
  ARKOSE_TOKEN_GENERATOR_POST_MESSAGE_ID,
  ArkoseTokenModelType,
} from '@/assets/openai/arkoseTokenIframeId'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import Log from '@/utils/Log'
import { promiseTimeout } from '@/utils/promiseUtils'

const log = new Log('ArkoseIframeGenerator')

class ChromeExtensionArkoseTokenGenerator {
  static iframeId = 'maxai-arkose-token-generate-iframe'
  iframeInstance: HTMLIFrameElement | null = null
  constructor() {}
  async injectIframe(model: ArkoseTokenModelType) {
    // 先ping一次
    const isPingSuccess = await this.ping(model)
    // 如果ping成功，说明已经注入过了
    if (isPingSuccess) {
      return true
    }
    // 最大1次
    for (let i = 0; i < 1; i++) {
      const success = await promiseTimeout(
        this.injectIframeOnce(),
        10 * 1000,
        false,
      )
      if (success) {
        log.info('inject iframe success')
        return true
      } else {
        log.info('inject iframe fail', 'retry times', i + 1)
        this.removeIframe()
      }
    }
    log.info('inject iframe fail')
    return false
  }
  async generateToken(model: ArkoseTokenModelType, dx?: string) {
    // 第一步 注入iframe
    if (!(await this.injectIframe(model))) {
      return ''
    }
    // 第二步 获取arkoseToken和超时处理
    const token = await promiseTimeout(
      this.postMessageGenerateToken(model, dx),
      15 * 1000,
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
    return getMaxAISidebarRootElement()
  }
  private async ping(model: ArkoseTokenModelType) {
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
              data: {
                model,
              },
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
    return new Promise<boolean>((resolve) => {
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
      iframe.src = 'https://chat.openai.com/robots.txt'
      iframe.style.cssText = `
      position: absolute !important;
      opacity: 0 !important;
      width: 1px !important;
      height: 1px !important;
      top: 0 !important;
      left: 0 !important;
      border: none !important;
      display: block !important;
      z-index: -1 !important;
      pointer-events: none;`
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
  private async postMessageGenerateToken(
    model: ArkoseTokenModelType,
    dx?: string,
  ) {
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
          data: {
            model,
            dx,
          },
        },
        '*',
      )
    })
  }
}

export const chromeExtensionArkoseTokenGenerator =
  new ChromeExtensionArkoseTokenGenerator()
