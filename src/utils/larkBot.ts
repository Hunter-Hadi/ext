import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
const isProduction = String(process.env.NODE_ENV) === 'production'

export type botUuid =
  // use chatgpt cmd + j not working larkbot
  | 'dd385931-45f4-4de1-8e48-8145561b0f9d'
  // pricing issue
  | '7a04bc02-6155-4253-bcdb-ade3db6de492'
  // maxai api issue
  | '6f02f533-def6-4696-b14e-1b00c2d9a4df'

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
