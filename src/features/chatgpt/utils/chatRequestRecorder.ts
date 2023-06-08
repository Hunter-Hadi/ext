import { APP_USE_CHAT_GPT_API_HOST } from '@/types'
import { getFingerPrint } from '@/utils/fingerPrint'
import dayjs from 'dayjs'
import Browser from 'webextension-polyfill'
import omit from 'lodash-es/omit'
import { getAccessToken } from '@/utils/request'
import debounce from 'lodash-es/debounce'
import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'

interface IChatRequestCountRecordType {
  // 记录用户发送chat的次数情况
  [key: string]: any
}

// TODO 放到types.ts里面
const CHATGPT_REQUEST_TIME_RECORD = 'chatgpt-request-time-record'
const CHATGPT_REQUEST_COUNT_RECORD = 'chatgpt-request-count-record'

const RECORD_DAY_LIMIT = 2
const RECORD_DEBOUNCE_TIME = 1000 * 60 * 1 // 5分钟

const getStorageDataKeyByKey = async (key: string) => {
  const res = await Browser.storage.local.get(key)
  return res[key]
}

const clearStorageDataKeyByKey = (key: string) => {
  Browser.storage.local.remove(key)
}

const setChatGPTRequestTime = async (time = Date.now(), force = false) => {
  const cacheTime = await getStorageDataKeyByKey(CHATGPT_REQUEST_TIME_RECORD)
  // 如果已经有了，就不再设置了
  if (cacheTime && !force) return
  await Browser.storage.local.set({
    [CHATGPT_REQUEST_TIME_RECORD]: time,
  })
}

export const increaseChatGPTRequestCount = async (
  type: 'total' | 'error' | 'success' | 'prompt',
  promptDetail?: {
    id: string
    name: string
    host: string
  },
) => {
  const cacheData: IChatRequestCountRecordType =
    (await getStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)) || {}
  const currentDay = dayjs().format('YYYY-MM-DD')
  if (!cacheData[currentDay]?.error) {
    cacheData[currentDay] = {
      error: {
        count: 0,
      },
      success: {
        count: 0,
      },
      total: {
        count: 0,
      },
    }
  }
  if (type === 'error') {
    cacheData[currentDay].error.count += 1
  } else if (type === 'success') {
    cacheData[currentDay].success.count += 1
  } else if (type === 'total') {
    cacheData[currentDay].total.count += 1
  } else if (type === 'prompt' && promptDetail) {
    const { name, host, id } = promptDetail
    if (!cacheData[currentDay][id]) {
      cacheData[currentDay][id] = {
        name: name,
      }
    }
    if (!cacheData[currentDay][id][host]) {
      cacheData[currentDay][id][host] = {
        count: 1,
      }
    } else {
      cacheData[currentDay][id][host].count += 1
    }
  }
  setChatGPTRequestTime(Date.now())
  await Browser.storage.local.set({
    [CHATGPT_REQUEST_COUNT_RECORD]: cacheData,
  })
  console.log('CHATGPT_REQUEST_COUNT_RECORD', cacheData)
  const dateRequestCount = omit(
    cacheData,
    'errorCount',
    'totalCount',
    'successCount',
  )
  const { ON_BOARDING_RECORD_FIRST_MESSAGE } =
    await getChromeExtensionOnBoardingData()
  if (!ON_BOARDING_RECORD_FIRST_MESSAGE) {
    // 用户第一次使用需要发送数据
    fetchChatGPTErrorRecord()
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_RECORD_FIRST_MESSAGE',
      true,
    )
  } else if (Object.keys(dateRequestCount).length >= RECORD_DAY_LIMIT) {
    fetchChatGPTErrorRecord()
  } else {
    debounceFetchChatGPTErrorRecord()
  }
}
const debounceFetchChatGPTErrorRecord = debounce(() => {
  fetchChatGPTErrorRecord()
}, RECORD_DEBOUNCE_TIME)

const fetchChatGPTErrorRecord = async () => {
  try {
    const fingerprint = await getFingerPrint()
    const startRecordTime = await getStorageDataKeyByKey(
      CHATGPT_REQUEST_TIME_RECORD,
    )
    const info = await getStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)
    const accessToken = await getAccessToken()
    if (startRecordTime && info && accessToken) {
      const { errorCount, successCount, totalCount, ...countInfo } = info
      // debugger
      fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/save_gpt_error_records`, {
        method: 'POST',
        body: JSON.stringify({
          start_timestamp: dayjs(startRecordTime).unix(),
          end_timestamp: dayjs().unix(),
          info_object: countInfo,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          fp: `${fingerprint}`,
        },
      }).then(async (res) => {
        try {
          const body = await res.json()
          console.log(body)
          clearStorageDataKeyByKey(CHATGPT_REQUEST_TIME_RECORD)
          clearStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)
        } catch (e) {
          console.log('fetchChatGPTErrorRecord error', e)
        }
      })
    }
  } catch (error) {
    console.log('fetchChatGPTErrorRecord error', error)
  }
}
