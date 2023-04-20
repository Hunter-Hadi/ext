import { APP_USE_CHAT_GPT_API_HOST } from '@/types'
import { getCurrentBrowserFingerPrint } from '@rajesh896/broprint.js'
import dayjs from 'dayjs'
import Browser from 'webextension-polyfill'

const CHATGPT_NORMAL_TIME_KEY = 'chatgpt-normal-time'

export const setChatGPTNormalTime = async (time: number, force = false) => {
  const res = await Browser.storage.local.get(CHATGPT_NORMAL_TIME_KEY)
  // 如果已经有了，就不再设置了
  console.log('setChatGPTNormalTime res:', res[CHATGPT_NORMAL_TIME_KEY])
  if (res[CHATGPT_NORMAL_TIME_KEY] && !force) return
  await Browser.storage.local.set({
    [CHATGPT_NORMAL_TIME_KEY]: time,
  })
}

export const clearChatGPTNormalTime = () => {
  // 清空 上次保存的时间戳
  Browser.storage.local.remove(CHATGPT_NORMAL_TIME_KEY)
}
export const getChatGPTNormalTime = async () => {
  const res = await Browser.storage.local.get(CHATGPT_NORMAL_TIME_KEY)
  return res[CHATGPT_NORMAL_TIME_KEY]
}

export const saveChatGPTErrorRecord = async () => {
  try {
    const fingerprint = await getCurrentBrowserFingerPrint()
    const time = await getChatGPTNormalTime()
    const intervalTime = dayjs().diff(time, 'second')
    fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/save_gpt_error_record`, {
      method: 'POST',
      body: JSON.stringify({
        interval_time: intervalTime <= 0 ? 1 : intervalTime,
      }),
      headers: {
        'Content-Type': 'application/json',
        fp: `${fingerprint}`,
      },
    })
    clearChatGPTNormalTime()
  } catch (error) {
    console.log('saveChatGPTErrorRecord error', error)
  }
}
