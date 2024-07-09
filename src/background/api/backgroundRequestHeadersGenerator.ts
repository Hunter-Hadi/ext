import hmac_sha1 from 'crypto-js/hmac-sha1'
import dayjs from 'dayjs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { sm3 } from 'sm-crypto'
import Browser, { Runtime } from 'webextension-polyfill'

import { getMaxAIChromeExtensionInstalledDeviceId } from '@/background/utils/getMaxAIChromeExtensionInstalledDeviceId'
import { APP_VERSION } from '@/constants'
import {
  aesJsonEncrypt,
  APP_AES_ENCRYPTION_KEY,
  APP_SM3_HASH_KEY,
} from '@/features/security'
import { backgroundGetBrowserUAInfo } from '@/utils/sendMaxAINotification/background'

export const backgroundGetCurrentDomainHost = (fromUrl: string) => {
  try {
    const urlObj = fromUrl ? new URL(fromUrl) : undefined
    if (!urlObj) {
      return ''
    }
    if (urlObj.href.includes(Browser.runtime.id)) {
      const crxPageUrl = urlObj.origin + urlObj.pathname
      // crx page - immersive chat
      if (crxPageUrl === Browser.runtime.getURL('/pages/chat/index.html')) {
        return Browser.runtime.getURL('/pages/chat/index.html')
      } else if (
        // crx page - pdf viewer
        crxPageUrl === Browser.runtime.getURL('/pages/pdf/web/viewer.html')
      ) {
        return Browser.runtime.getURL('/pages/pdf/web/viewer.html')
      } else if (
        // crx page - settings
        crxPageUrl === Browser.runtime.getURL('/pages/settings/index.html')
      ) {
        return Browser.runtime.getURL('/pages/settings/index.html')
      }
    }

    if (urlObj.host === '' && urlObj.origin === 'file://') {
      // 本地文件 (暂定本地文件返回 origin + pathname)
      return urlObj.origin + urlObj.pathname
    }

    const host = urlObj.host.replace(/^www\./, '').replace(/:\d+$/, '')
    // lark doc的子域名是动态的，所以需要特殊处理
    if (host.includes('larksuite.com')) {
      return 'larksuite.com'
    }
    if (host === 'x.com') {
      return 'twitter.com'
    }
    return host
  } catch (e) {
    return ''
  }
}

/**
 * 将字符串转换为16进制表示
 * @param inputString - 需要转换的字符串
 * @returns 16进制表示的字符串
 */
export const convertStringToHex = (inputString: string): string => {
  let hexRepresentation = ''
  for (let i = 0; i < inputString.length; i++) {
    hexRepresentation += inputString.charCodeAt(i).toString(16)
  }
  return hexRepresentation
}

/**
 * 将16进制转换为字符串
 * @param hexString - 需要转换的16进制字符串
 * @returns 解码后的字符串
 */
export const convertHexToString = (hexString: string): string => {
  let decodedString = ''
  for (let i = 0; i < hexString.length; i += 2) {
    decodedString += String.fromCharCode(parseInt(hexString.substr(i, 2), 16))
  }
  return decodedString
}

/**
 * 用于所有的请求添加一些 header
 */
class BackgroundRequestHeadersGenerator {
  private taskIdHeadersMap: Map<
    string,
    {
      headers: HeadersInit
      createdTime: number
      sender: Runtime.MessageSender
    }
  > = new Map()
  async addTaskIdHeaders(taskId: string, sender: Runtime.MessageSender) {
    // "{\"browser\":{\"name\":\"Chrome\",\"version\":\"125.0.0.0\",\"major\":\"125\"},\"os\":{\"name\":\"Mac OS\",\"version\":\"10.15.7\"}}"
    const uaInfo = await backgroundGetBrowserUAInfo()
    const senderUrl = (sender.tab?.url || sender.url || '').slice(0, 1000)
    const domain = backgroundGetCurrentDomainHost(senderUrl)
    const path = senderUrl
    // 稍微添加一下逆向的难度
    const hexHeaders = {
      // X-Browser-Name
      [convertHexToString('582d42726f777365722d4e616d65')]:
        uaInfo?.browser?.name || convertHexToString('554e4b4e4f574e'),
      // X-Browser-Version
      [convertHexToString('582d42726f777365722d56657273696f6e')]:
        uaInfo?.browser?.version || convertHexToString('554e4b4e4f574e'),
      // X-Browser-Major
      [convertHexToString('582d42726f777365722d4d616a6f72')]:
        uaInfo?.browser?.major || convertHexToString('554e4b4e4f574e'),
      // X-App-Version
      [convertHexToString(`582d4170702d56657273696f6e`)]: APP_VERSION,
      // X-App-Env - MaxAI-Browser-Extension
      [convertHexToString(`582d4170702d456e76`)]: convertHexToString(
        `4d617841492d42726f777365722d457874656e73696f6e`,
      ),
      // 下方的字段在获取的时候都要合并到 // X-Authorization
      // X-Client-Domain
      [convertHexToString(`582d436c69656e742d446f6d61696e`)]: domain,
      // X-Client-Path
      [convertHexToString(`582d436c69656e742d50617468`)]: path,
      // T
      [convertHexToString(`54`)]: dayjs(new Date().getTime()).unix(),
      // D
      [convertHexToString(`44`)]: getMaxAIChromeExtensionInstalledDeviceId(),
    }
    this.taskIdHeadersMap.set(taskId, {
      headers: hexHeaders,
      createdTime: Date.now(),
      sender,
    })
    this.removeUnusedTaskIdHeaders()
  }
  removeUnusedTaskIdHeaders() {
    const now = Date.now()
    for (const [taskId, { createdTime }] of this.taskIdHeadersMap) {
      if (now - createdTime > 1000 * 60 * 5) {
        this.taskIdHeadersMap.delete(taskId)
      }
    }
  }
  getTaskIdHeaders(taskId?: string, initBody?: BodyInit) {
    const headers = new Headers(
      taskId ? this.taskIdHeadersMap.get(taskId)?.headers : {},
    )
    if (headers.has(convertHexToString(`54`))) {
      const body = initBody || ''
      // sm3(hmac_sha1(payload, secret_key)secret_key)
      const payloadHash = sm3(
        hmac_sha1(
          typeof body === 'string' ? body : JSON.stringify(body),
          APP_SM3_HASH_KEY,
        ).toString() + APP_SM3_HASH_KEY,
      )
      // X-Authorization
      headers.set(
        convertHexToString(`582d417574686f72697a6174696f6e`),
        aesJsonEncrypt(
          {
            // X-Client-Domain
            [convertHexToString(`582d436c69656e742d446f6d61696e`)]: headers.get(
              convertHexToString(`582d436c69656e742d446f6d61696e`),
            ),
            // X-Client-Path
            [convertHexToString(`582d436c69656e742d50617468`)]: headers.get(
              convertHexToString(`582d436c69656e742d50617468`),
            ),
            // T
            [convertHexToString(`54`)]: headers.get(convertHexToString(`54`)),
            // P
            [convertHexToString(`50`)]: payloadHash,
            // D
            [convertHexToString(`44`)]: headers.get(convertHexToString(`44`)),
          },
          APP_AES_ENCRYPTION_KEY,
        ),
      )
      // 移除不需要的header
      // X-Client-Domain
      headers.delete(convertHexToString(`582d436c69656e742d446f6d61696e`))
      // X-Client-Path
      headers.delete(convertHexToString(`582d436c69656e742d50617468`))
      // T
      headers.delete(convertHexToString(`54`))
      // D
      headers.delete(convertHexToString(`44`))
    }
    // to object
    const headersObject: Record<string, string> = {}
    headers.forEach((value, key) => {
      headersObject[key] = value
    })
    return headersObject
  }
}

export const backgroundRequestHeadersGenerator =
  new BackgroundRequestHeadersGenerator()
