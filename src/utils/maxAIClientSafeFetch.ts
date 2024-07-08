import hmac_sha1 from 'crypto-js/hmac-sha1'
import dayjs from 'dayjs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { sm3 } from 'sm-crypto'
import Browser from 'webextension-polyfill'

import { convertHexToString } from '@/background/api/backgroundRequestHeadersGenerator'
import { APP_VERSION } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { aesJsonEncrypt } from '@/utils/encryptionHelper'
import { backgroundGetBrowserUAInfo } from '@/utils/sendMaxAINotification/background'

/**
 * 封装的安全的fetch函数，可以在此处添加一些全局的安全处理
 * @param input 请求的URL或Request对象
 * @param init 可选的请求配置参数
 * @param formUrl 请求的来源URL
 * @returns 返回一个Promise，解析为Response对象
 */
const maxAIClientFetch = async (
  input: RequestInfo,
  init?: RequestInit,
  formUrl?: string,
): Promise<Response> => {
  // 创建一个新的headers对象，并拷贝init中的headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
    ...init?.headers,
  })
  if (init?.body) {
    try {
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
      const keyA = 'ad6e9bb5-b486-4a36-a5b1-4a952701d0c4'
      const keyB = 'eda11778-75b1-49be-8b06-206cd14d3a4c'
      // sm3(hmac_sha1(payload, secret_key)secret_key)
      const payloadHash = sm3(
        hmac_sha1(
          typeof init?.body === 'string'
            ? init?.body
            : JSON.stringify(init?.body),
          keyB,
        ).toString() + keyB,
      )
      headers.set(
        convertHexToString(`582d417574686f72697a6174696f6e`),
        aesJsonEncrypt(
          {
            // X-Client-Domain
            [convertHexToString(`582d436c69656e742d446f6d61696e`)]: domain,
            // X-Client-Path
            [convertHexToString(`582d436c69656e742d50617468`)]: path,
            // T
            [convertHexToString(`54`)]: dayjs(new Date().getTime()).unix(),
            // P
            [convertHexToString(`50`)]: payloadHash,
          },
          keyA,
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
  return fetch(input, modifiedInit)
}

export default maxAIClientFetch
