import { APP_USE_CHAT_GPT_API_HOST } from '@/types'
import { getFingerPrint } from '@/utils/fingerPrint'
import dayjs from 'dayjs'
import Browser from 'webextension-polyfill'
import omit from 'lodash-es/omit'
import { getAccessToken } from '@/utils/request'

interface IChatRequestCountRecordType {
  // 在从start_timestamp到end_timestamp期间内，一共发生过多少次403 errro/chatgpt断连error
  errorCount: number

  // 记录用户发送chat的次数情况
  // time: count - {'2023-05-03':105,'2023-05-04':120,'2023-05-05':50}
  [key: string]: number
}

const CHATGPT_REQUEST_TIME_RECORD = 'chatgpt-request-time-record'
const CHATGPT_REQUEST_COUNT_RECORD = 'chatgpt-request-count-record'

const RECORD_DAY_LIMIT = 3

const getStorageDataKeyByKey = async (key: string) => {
  const res = await Browser.storage.local.get(key)
  return res[key]
}

const clearStorageDataKeyByKey = (key: string) => {
  Browser.storage.local.remove(key)
}

const setChatGPTRequetTime = async (time = Date.now(), force = false) => {
  const cacheTime = await getStorageDataKeyByKey(CHATGPT_REQUEST_TIME_RECORD)
  // 如果已经有了，就不再设置了
  if (cacheTime && !force) return
  await Browser.storage.local.set({
    [CHATGPT_REQUEST_TIME_RECORD]: time,
  })
}

export const increaseChatGPTRequetCount = async (type: 'error' | 'normal') => {
  const cacheData: IChatRequestCountRecordType = (await getStorageDataKeyByKey(
    CHATGPT_REQUEST_COUNT_RECORD,
  )) || { errorCount: 0 }
  const currentDay = dayjs().format('YYYY-MM-DD')

  if (type === 'error') {
    cacheData.errorCount += 1
  }
  // 报错的 chat request 也算一次 chat request count
  cacheData[currentDay] = (cacheData[currentDay] || 0) + 1

  setChatGPTRequetTime(Date.now())

  await Browser.storage.local.set({
    [CHATGPT_REQUEST_COUNT_RECORD]: cacheData,
  })
  const dateRequestCount = omit(cacheData, 'errorCount')
  if (Object.keys(dateRequestCount).length >= RECORD_DAY_LIMIT) {
    fetchChatGPTErrorRecord()
  }
}

const fetchChatGPTErrorRecord = async () => {
  try {
    const fingerprint = await getFingerPrint()
    const startRecordTime = await getStorageDataKeyByKey(
      CHATGPT_REQUEST_TIME_RECORD,
    )
    const info = await getStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)
    const accessToken = await getAccessToken()
    if (startRecordTime && info && accessToken) {
      const { errorCount, ...countInfo } = info

      fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/save_gpt_error_records`, {
        method: 'POST',
        body: JSON.stringify({
          start_timestamp: dayjs(startRecordTime).unix(),
          end_timestamp: dayjs().unix(),
          error_count: errorCount,
          info_object: countInfo,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          fp: `${fingerprint}`,
        },
      })
      clearStorageDataKeyByKey(CHATGPT_REQUEST_TIME_RECORD)
      clearStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)
    }
  } catch (error) {
    console.log('fetchChatGPTErrorRecord error', error)
  }
}
