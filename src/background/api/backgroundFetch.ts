import Browser from 'webextension-polyfill'

import { chromeExtensionLogout } from '@/background/utils'
import {
  APP_USE_CHAT_GPT_API_HOST,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
} from '@/constants'

export const getAccessToken = async () => {
  const cache = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
    // 应该用accessToken
    return cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
      ?.refreshToken as string
  }
  return ''
}

interface IResponse<T> {
  status: 'OK' | 'ERROR'
  data?: T
  msg?: string
}

export const backgroundPost = <T>(
  pathname: string,
  data: any,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  return new Promise((resolve, reject) => {
    const { headers, ...rest } = options || {}
    getAccessToken().then((accessToken) => {
      if (!accessToken) {
        reject(new Error('no accessToken'))
        chromeExtensionLogout()
        return
      }
      fetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...headers,
        },
        ...rest,
      })
        .then((response) => {
          if (response.ok) {
            resolve(response.json())
          } else {
            if (response.status === 401) {
              // token过期
              chromeExtensionLogout()
            }
            reject(response)
          }
          return undefined
        })
        .catch((e) => {
          console.error(e)
          return undefined
        })
    })
  })
}

export const backgroundGet = <T>(
  pathname: string,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  return new Promise((resolve, reject) => {
    try {
      const { headers, ...rest } = options || {}
      getAccessToken().then((accessToken) => {
        if (!accessToken) {
          reject(new Error('no accessToken'))
          chromeExtensionLogout()
          return
        }
        fetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...headers,
          },
          ...rest,
        })
          .then((response) => {
            if (response.ok) {
              resolve(response.json())
            } else {
              if (response.status === 401) {
                // token过期
                chromeExtensionLogout()
              }
              reject(response)
            }
            return undefined
          })
          .catch((e) => {
            console.error(e)
            reject(e)
            return undefined
          })
      })
    } catch (e) {
      reject(e)
    }
  })
}
