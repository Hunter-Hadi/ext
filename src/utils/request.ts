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

export const post = <T>(
  pathname: string,
  data: any,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  return new Promise((resolve, reject) => {
    getAccessToken().then((accessToken) => {
      if (!accessToken) {
        reject(new Error('no accessToken'))
        chromeExtensionLogout()
        return
      }
      fetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
        ...options,
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

export const get = <T>(
  pathname: string,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  return new Promise((resolve, reject) => {
    try {
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
          },
          ...options,
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
