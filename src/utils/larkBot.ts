import { APP_USE_CHAT_GPT_API_HOST } from '@/types'
const isProduction = String(process.env.NODE_ENV) === 'production'

export type botUuid = 'dd385931-45f4-4de1-8e48-8145561b0f9d' // use chatgpt cmd + j not working larkbot
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
      title: `UseChatGPT: ${title}`,
      message,
      ...attr,
    }),
  })
    .then()
    .catch()
}
