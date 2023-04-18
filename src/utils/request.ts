import Browser from 'webextension-polyfill'
import {
  APP_USE_CHAT_GPT_API_HOST,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
} from '@/types'

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

export const post = async <T>(
  pathname: string,
  data: any,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  const accessToken = await getAccessToken()
  return fetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
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
        return response.json()
      }
      return undefined
    })
    .catch((e) => {
      console.error(e)
      return undefined
    })
}
export const get = async <T>(
  pathname: string,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  const accessToken = await getAccessToken()
  return fetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    ...options,
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      return undefined
    })
    .catch((e) => {
      console.error(e)
      return undefined
    })
}