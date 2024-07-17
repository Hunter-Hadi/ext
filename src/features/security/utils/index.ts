import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import md5 from 'crypto-js/md5'
import Browser from 'webextension-polyfill'

import { APP_AES_ENCRYPTION_KEY } from '../constant'

export const aesJsonEncrypt = (data: any, key = APP_AES_ENCRYPTION_KEY) => {
  return AES.encrypt(JSON.stringify(data), key).toString()
}
export const md5TextEncrypt = (data: string) => {
  console.log('新版Conversation md5TextEncrypt', data)
  return md5(data).toString()
}
export const aesJsonDecrypt = (
  encryptedData: string,
  key = APP_AES_ENCRYPTION_KEY,
) => {
  const decryptedBytes = AES.decrypt(encryptedData, key)
  const decryptedData = decryptedBytes.toString(Utf8)
  try {
    return JSON.parse(decryptedData)
  } catch (e) {
    console.error(e)
    return {}
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
 * MaxAI API请求时间差的Key
 */
const MAXAI_API_FETCH_TIME_DIFF_SAVE_KEY =
  '4d415841495f4150495f46455443485f54494d455f444946465f534156455f4b4559'

/**
 * 获取MaxAI API请求时间差
 */
export const getMaxAIAPIFetchTimeDiff = async () => {
  const data =
    (await Browser.storage.local.get(
      convertHexToString(MAXAI_API_FETCH_TIME_DIFF_SAVE_KEY),
    )) || {}
  return Number(
    data[convertHexToString(MAXAI_API_FETCH_TIME_DIFF_SAVE_KEY)] || 0,
  )
}

/**
 * 获取MaxAI API请求时间戳
 */
export const getMaxAIAPIFetchTimestamp = async () => {
  const timeDiff = await getMaxAIAPIFetchTimeDiff()
  return new Date().getTime() + timeDiff
}

/**
 * 设置MaxAI API请求时间差
 * @param timeDiff
 */
export const setMaxAIAPIFetchTimeDiff = async (timeDiff: number) => {
  await Browser.storage.local.set({
    [convertHexToString(MAXAI_API_FETCH_TIME_DIFF_SAVE_KEY)]: timeDiff,
  })
}

/**
 * 处理安全请求的错误
 * @param response
 */
export const securityHandleFetchErrorResponse = async (response: Response) => {
  if (response.status === 418) {
    // 如果返回401，说明token过期，可以在此处处理token过期的逻辑
    const data = await response.json()
    // 6a61335f746c735f636f6465 -> j3_tls_code
    // 313031303130313031 -> 101010101
    if (
      String(data?.data?.[convertHexToString('6a61335f746c735f636f6465')]) ===
      convertHexToString('313031303130313031')
    ) {
      const serverDate = response.headers.get('Date')
      // 超时纠正时间
      if (serverDate) {
        const systemTime = new Date().getTime()
        const serverTime = new Date(serverDate).getTime()
        const diff = serverTime - systemTime
        await setMaxAIAPIFetchTimeDiff(diff)
      }
    }
    // 101010100:   解码 headers 中的 X-Authorization失败
    // 101010101： 请求时间不在规定时间内
    // 101010102： 当前请求已经请求过一次，第二次重放请求时会触发
    // 101010103： headers 中存在必传的参数没有传递，或者参数格式错误
    // 101010104： 请求签名校验错误
    // 101010105： 请求的 headers 中的 x-app-version 校验失败，是不符合要求的 app-version
  }
  return response
}
