import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { UAParser } from 'ua-parser-js'
import Browser from 'webextension-polyfill'
const isProduction = String(process.env.NODE_ENV) === 'production'

export type botUuid =
  // use chatgpt cmd + j not working larkbot
  | 'dd385931-45f4-4de1-8e48-8145561b0f9d'
  // pricing issue
  | '7a04bc02-6155-4253-bcdb-ade3db6de492'
  // maxai api issue
  | '6f02f533-def6-4696-b14e-1b00c2d9a4df'
  // maxai referral
  | '608156c7-e65d-4a69-a055-6c10a6ba7217'

export const sendLarkBotMessage = (
  title: string,
  message = '',
  attr?: { uuid?: botUuid; [key: string]: any },
) => {
  return fetch(APP_USE_CHAT_GPT_API_HOST + '/app/send_notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      env: isProduction ? 'prod' : 'dev',
      title: `MaxAI: ${title}`,
      message,
      ...attr,
    }),
  })
    .then()
    .catch()
}

export const clientGetBrowserInfo = async () => {
  const { getBrowser } = new UAParser()
  await Browser.storage.local.set({
    MAXAI_BROWSER_INFO: JSON.stringify(getBrowser()),
  })
}
export const getBrowserInfo = async () => {
  const { getBrowser } = new UAParser()
  const browserInfo = await Browser.storage.local.get('MAXAI_BROWSER_INFO')
  if (browserInfo.MAXAI_BROWSER_INFO) {
    return JSON.parse(browserInfo.MAXAI_BROWSER_INFO)
  }
  return getBrowser()
}
