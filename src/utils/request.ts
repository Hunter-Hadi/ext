import { chromeExtensionLogout } from '@/background/utils'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import maxAIClientSafeFetch from '@/utils/maxAIClientSafeFetch'

interface IResponse<T> {
  status: 'OK' | 'ERROR'
  data?: T
  msg?: string
}

export const clientMaxAIPost = <T>(
  pathname: string,
  data: any,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  return new Promise((resolve, reject) => {
    getMaxAIChromeExtensionAccessToken().then((accessToken) => {
      if (!accessToken) {
        reject(new Error('no accessToken'))
        chromeExtensionLogout()
        return
      }
      maxAIClientSafeFetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
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

export const clientMaxAIGet = <T>(
  pathname: string,
  options?: RequestInit,
): Promise<IResponse<T>> => {
  return new Promise((resolve, reject) => {
    try {
      getMaxAIChromeExtensionAccessToken().then((accessToken) => {
        if (!accessToken) {
          reject(new Error('no accessToken'))
          chromeExtensionLogout()
          return
        }
        maxAIClientSafeFetch(APP_USE_CHAT_GPT_API_HOST + pathname, {
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
