import Browser from 'webextension-polyfill'

import { APP_VERSION, isProduction } from '@/constants'
import {
  getMaxAIChromeExtensionEmail,
  getMaxAIChromeExtensionUserId,
} from '@/features/auth/utils'
import { aesJsonEncrypt } from '@/features/security'
import {
  botUuid,
  SendNotificationType,
} from '@/utils/sendMaxAINotification/types'

export const backgroundSendMaxAINotification = async (
  type: SendNotificationType,
  title: string,
  message = '',
  attr?: { uuid?: botUuid; [key: string]: any },
) => {
  const userId = await getMaxAIChromeExtensionUserId()
  const userEmail = await getMaxAIChromeExtensionEmail()
  const { browser, os } = await backgroundGetBrowserUAInfo()
  // const { getBrowser, getOS } = new UAParser()
  // const browser = getBrowser()
  // const os = getOS()
  const text = aesJsonEncrypt(
    {
      env: isProduction ? 'prod' : 'dev',
      type: type,
      app: 'MAXAI',
      data: {
        title,
        message,
        ...attr,
      },
      user_id: userId,
      email: userEmail,
      app_version: APP_VERSION,
      browser: browser.name,
      browser_version: browser.version,
      platform: os.name,
      platform_version: os.version,
      languages: navigator.languages,
    },
    'MaxAI',
  )
  return fetch(
    'https://api.extensions-hub.com/extensionhub/send_notification',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msg: text,
      }),
    },
  )
    .then()
    .catch()
}
/**
 * background获取客户端缓存的浏览器信息
 */
export const backgroundGetBrowserUAInfo = async () => {
  try {
    const browserInfo = await Browser.storage.local.get('MAXAI_BROWSER_INFO')
    if (browserInfo.MAXAI_BROWSER_INFO) {
      return JSON.parse(browserInfo.MAXAI_BROWSER_INFO)
    }
    return {
      os: {},
      browser: {},
    }
  } catch (e) {
    return {
      os: {},
      browser: {},
    }
  }
}
