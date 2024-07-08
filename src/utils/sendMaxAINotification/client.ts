import { UAParser } from 'ua-parser-js'
import Browser from 'webextension-polyfill'

import { APP_VERSION, isProduction } from '@/constants'
import {
  getMaxAIChromeExtensionEmail,
  getMaxAIChromeExtensionUserId,
} from '@/features/auth/utils'
import { aesJsonEncrypt } from '@/features/security'
import { clientProxyFetchAPI } from '@/features/shortcuts/utils'
import {
  botUuid,
  SendNotificationType,
} from '@/utils/sendMaxAINotification/types'

export const clientSendMaxAINotification = async (
  type: SendNotificationType,
  title: string,
  message = '',
  attr?: { uuid?: botUuid; [key: string]: any },
) => {
  const userId = await getMaxAIChromeExtensionUserId()
  const userEmail = await getMaxAIChromeExtensionEmail()
  const { getBrowser, getOS } = new UAParser()
  const browser = getBrowser()
  const os = getOS()
  const dataObject = {
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
  }
  const text = aesJsonEncrypt(dataObject)
  return clientProxyFetchAPI(
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
 * 客户端设置浏览器信息给background
 */
export const clientSetBrowserUAInfo = async () => {
  const { getBrowser, getOS } = new UAParser()
  await Browser.storage.local.set({
    MAXAI_BROWSER_INFO: JSON.stringify({
      browser: getBrowser(),
      os: getOS(),
    }),
  })
}
