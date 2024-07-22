import hmac_sha1 from 'crypto-js/hmac-sha1'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { sm3 } from 'sm-crypto'
import Browser, { Runtime } from 'webextension-polyfill'

import { getMaxAIChromeExtensionInstalledDeviceId } from '@/background/utils/getMaxAIChromeExtensionInstalledDeviceId'
import { APP_VERSION } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import {
  aesJsonEncrypt,
  APP_AES_ENCRYPTION_KEY,
  APP_SM3_HASH_KEY,
  convertHexToString,
  getMaxAIAPIFetchTimestamp,
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
      // t
      [convertHexToString(`74`)]: await getMaxAIAPIFetchTimestamp(),
      // d
      [convertHexToString(`44`)]:
        await getMaxAIChromeExtensionInstalledDeviceId(),
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

  async getTaskIdHeaders(taskId: string, input: string, initBody?: BodyInit) {
    const headers = new Headers(
      taskId ? this.taskIdHeadersMap.get(taskId)?.headers : {},
    )

    if (headers.has(convertHexToString(`74`))) {
      const body = initBody || ''
      // sm3(hmac_sha1(payload, secret_key)secret_key)
      // api_full_path: 请求的完全路径，包含查询参数，不携带fragment ，注意需要对 URL 做解码
      //             - 例: `http://127.0.0.1:8001/tt?a=b&a=c&a=d&b=%E8%A7%A3#htest` => `/tt?a=b&a=c&a=d&b=解`
      //             -  `/tt?` 问号后面没有查询参数需要删除问号 -> `/tt`
      const apiURL = new URL(input)
      let api_full_path = apiURL.pathname + apiURL.search
      if (api_full_path.endsWith('?')) {
        api_full_path = api_full_path.slice(0, -1)
      }
      // req_json: 请求的 json 体，如果为空则当`{}`处理
      //          - 例: `{"a":1,"b":2}` => `{"a":1,"b":2}`
      //          - 例: `""` => `{}`
      //          - 例: `null` => `{}`
      //          - 例: `undefined` => `{}`
      let req_json = '{}'
      if (typeof body === 'string') {
        try {
          req_json = JSON.stringify(JSON.parse(body))
        } catch (e) {
          req_json = '{}'
        }
      }
      // req_data: 请求的 form 表单，如果为空则当`{}`处理
      //          - 例: `{"a":1,"b":2}` => `{"a":1,"b":2}`
      //          - 例: `""` => `{}`
      //          - 例: `null` => `{}`
      //          - 例: `undefined` => `{}`
      let req_data = '{}'
      if (body instanceof FormData) {
        const jsonData: Record<string, any> = {}
        body.forEach((value, key) => {
          if (!(value instanceof File)) {
            jsonData[key] = String(value)
          }
        })
        req_data = JSON.stringify(jsonData)
      }
      // req_time: 请求的时间，精确到千分之秒
      //          - 例: `1634021280000` => `1634021280000`
      const req_time = Number(headers.get(convertHexToString(`74`)))
      const app_version = APP_VERSION
      const user_agent = navigator.userAgent
      const user_token = await getMaxAIChromeExtensionAccessToken()
      const sign_str = `${app_version}:${req_time}:${api_full_path}:${user_agent}:${req_json}:${req_data}:${user_token}`
      const sha1_secret_key = `${req_time}:${APP_SM3_HASH_KEY}`
      const sha1_hash = hmac_sha1(sign_str, sha1_secret_key).toString()
      const sm3_sign = sm3(`${req_time}:${sha1_hash}:${APP_SM3_HASH_KEY}`)
      console.log(
        `
MAXAI_API_FETCH_LOG:\n
body:\n,
`,
        typeof body === 'string' ? body : body,
        `
\napi_full_path: ${api_full_path}\n
req_json: ${req_json}\n
req_data: ${req_data}\n
req_time: ${req_time}\n
app_version: ${app_version}\n
user_agent: ${user_agent}\n
user_token: ${user_token}\n
sign_str: ${sign_str}\n
sha1_secret_key: ${sha1_secret_key}\n
sha1_hash: ${sha1_hash}\n
sm3_sign: ${sm3_sign}\n
      `,
      )
      const payloadHash = sm3_sign
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
            // t
            [convertHexToString(`74`)]: Number(req_time),
            // p
            [convertHexToString(`70`)]: payloadHash,
            // d
            [convertHexToString(`64`)]: headers.get(convertHexToString(`64`)),
          },
          APP_AES_ENCRYPTION_KEY,
        ),
      )
      // 移除不需要的header
      // X-Client-Domain
      headers.delete(convertHexToString(`582d436c69656e742d446f6d61696e`))
      // X-Client-Path
      headers.delete(convertHexToString(`582d436c69656e742d50617468`))
      // t
      headers.delete(convertHexToString(`74`))
      // d
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
