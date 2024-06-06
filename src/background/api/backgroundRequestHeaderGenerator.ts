import merge from 'lodash-es/merge'
import Browser, { Runtime } from 'webextension-polyfill'

import { APP_VERSION } from '@/constants'
import { aesJsonEncrypt } from '@/utils/encryptionHelper'
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
class BackgroundRequestHeaderGenerator {
  private taskIdHeaderMap: Map<
    string,
    {
      headers: HeadersInit
      createdTime: number
      sender: Runtime.MessageSender
    }
  > = new Map()
  async addTaskIdHeader(taskId: string, sender: Runtime.MessageSender) {
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
      // X-Authorization
      [convertHexToString(`582d417574686f72697a6174696f6e`)]: aesJsonEncrypt({
        // X-Client-Domain
        [convertHexToString(`582d436c69656e742d446f6d61696e`)]: domain,
        // X-Client-Path
        [convertHexToString(`582d436c69656e742d50617468`)]: path,
      }),
    }
    this.taskIdHeaderMap.set(taskId, {
      headers: hexHeaders,
      createdTime: Date.now(),
      sender,
    })
    this.removeUnusedTaskIdHeader()
  }
  removeUnusedTaskIdHeader() {
    const now = Date.now()
    for (const [taskId, { createdTime }] of this.taskIdHeaderMap) {
      if (now - createdTime > 1000 * 60 * 5) {
        this.taskIdHeaderMap.delete(taskId)
      }
    }
  }
  getTaskIdHeader(taskId?: string, headers?: HeadersInit) {
    return merge(
      taskId ? this.taskIdHeaderMap.get(taskId)?.headers : undefined,
      headers,
    )
  }
}

export const backgroundRequestHeaderGenerator =
  new BackgroundRequestHeaderGenerator()
