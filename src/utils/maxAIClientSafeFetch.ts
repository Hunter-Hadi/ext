import hmac_sha1 from 'crypto-js/hmac-sha1'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { sm3 } from 'sm-crypto'
import Browser from 'webextension-polyfill'

import { getMaxAIChromeExtensionInstalledDeviceId } from '@/background/utils/getMaxAIChromeExtensionInstalledDeviceId'
import { APP_USE_CHAT_GPT_API_HOST, APP_VERSION } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import {
  aesJsonEncrypt,
  APP_AES_ENCRYPTION_KEY,
  APP_SM3_HASH_KEY,
  convertHexToString,
  getMaxAIAPIFetchTimestamp,
  securityHandleFetchErrorResponse,
} from '@/features/security'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { backgroundGetBrowserUAInfo } from '@/utils/sendMaxAINotification/background'

/**
 * 封装的安全的fetch函数，可以在此处添加一些全局的安全处理
 * @param input 请求的URL或Request对象
 * @param init 可选的请求配置参数
 * @param formUrl 请求的来源URL
 * @returns 返回一个Promise，解析为Response对象
 */
const maxAIClientSafeFetch = async (
  input: RequestInfo,
  init?: RequestInit,
  formUrl?: string,
): Promise<Response> => {
  // 创建一个新的headers对象，并拷贝init中的headers
  const headers = new Headers({
    Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
    ...(init?.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...init?.headers,
  })
  if (
    typeof input === 'string' &&
    input.startsWith(APP_USE_CHAT_GPT_API_HOST!)
  ) {
    try {
      const body = init?.body || ''
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
      if (
        headers.has('Content-Type') &&
        headers.get('Content-Type') === 'application/json'
      ) {
        if (typeof body === 'string') {
          try {
            req_json = JSON.stringify(JSON.parse(body))
          } catch (e) {
            req_json = '{}'
          }
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
      const req_time = await getMaxAIAPIFetchTimestamp()
      const app_version = APP_VERSION
      const user_agent = navigator.userAgent
      const user_token = (headers.get('Authorization') || '').replace(
        'Bearer ',
        '',
      )
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
      const uaInfo = await backgroundGetBrowserUAInfo()
      const senderUrl =
        formUrl ||
        (typeof window !== 'undefined'
          ? window.location.href
          : Browser.runtime.getURL('/pages/settings/index.html'))
      const domain = getCurrentDomainHost(senderUrl)
      const path = senderUrl
      // 稍微添加一下逆向的难度
      // X-Browser-Name
      headers.set(
        convertHexToString('582d42726f777365722d4e616d65'),
        uaInfo?.browser?.name || convertHexToString('554e4b4e4f574e'),
      )
      // X-Browser-Version
      headers.set(
        convertHexToString('582d42726f777365722d56657273696f6e'),
        uaInfo?.browser?.version || convertHexToString('554e4b4e4f574e'),
      )
      // X-Browser-Major
      headers.set(
        convertHexToString('582d42726f777365722d4d616a6f72'),
        uaInfo?.browser?.major || convertHexToString('554e4b4e4f574e'),
      )
      // X-App-Version
      headers.set(convertHexToString(`582d4170702d56657273696f6e`), APP_VERSION)
      // X-App-Env - MaxAI-Browser-Extension
      headers.set(
        convertHexToString(`582d4170702d456e76`),
        convertHexToString(`4d617841492d42726f777365722d457874656e73696f6e`),
      )
      // X-Authorization
      headers.set(
        convertHexToString(`582d417574686f72697a6174696f6e`),
        aesJsonEncrypt(
          {
            // X-Client-Domain
            [convertHexToString(`582d436c69656e742d446f6d61696e`)]: domain,
            // X-Client-Path
            [convertHexToString(`582d436c69656e742d50617468`)]: path,
            // t
            [convertHexToString(`74`)]: req_time,
            // p
            [convertHexToString(`70`)]: payloadHash,
            // D
            [convertHexToString(`64`)]:
              await getMaxAIChromeExtensionInstalledDeviceId(),
          },
          APP_AES_ENCRYPTION_KEY,
        ),
      )
    } catch (e) {
      console.error(e)
    }
  }

  // 创建一个新的RequestInit对象，并深拷贝init中的属性
  const modifiedInit: RequestInit = {
    ...init,
    headers, // 使用修改后的headers
  }

  // 调用原生fetch，并传入修改后的RequestInfo和RequestInit
  return fetch(input, modifiedInit).then(securityHandleFetchErrorResponse)
}

export default maxAIClientSafeFetch
