import { APP_USE_CHAT_GPT_API_HOST } from '@/types'
import { getFingerPrint } from '@/utils/fingerPrint'
import dayjs from 'dayjs'
import Browser from 'webextension-polyfill'
import omit from 'lodash-es/omit'
import { getAccessToken } from '@/utils/request'
import debounce from 'lodash-es/debounce'
import {
  getChromeExtensionOnBoardingData,
  getChromeExtensionSettings,
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
  try {
    const cacheData: IChatRequestCountRecordType =
      (await getStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)) || {}
    const settings = await getChromeExtensionSettings()
    const provider = settings.chatGPTProvider || 'UNKNOWN_PROVIDER'
    const currentDay = dayjs().format('YYYY-MM-DD')
    if (
      !cacheData[currentDay] ||
      !Object.prototype.hasOwnProperty.call(
        cacheData[currentDay],
        'total_cnt',
      ) ||
      // TODO - 因为上个版本有domain_cnt，这个版本不需要了，直接重新来
      Object.prototype.hasOwnProperty.call(cacheData[currentDay], 'domain_cnt')
    ) {
      cacheData[currentDay] = {
        error_cnt: 0,
        success_cnt: 0,
        total_cnt: 0,
        prompt_cnt: {},
      }
    }
    if (type === 'error') {
      cacheData[currentDay].error_cnt += 1
    } else if (type === 'success') {
      cacheData[currentDay].success_cnt += 1
    } else if (type === 'total') {
      cacheData[currentDay].total_cnt += 1
    } else if (type === 'prompt' && promptDetail) {
      const { name, host, id } = promptDetail
      if (!cacheData[currentDay]['prompt_cnt'][id]) {
        cacheData[currentDay]['prompt_cnt'][id] = {
          name: name,
          ai_provider_cnt: {},
        }
      }
      if (provider) {
        if (
          !cacheData[currentDay]['prompt_cnt'][id]['ai_provider_cnt'][provider]
        ) {
          cacheData[currentDay]['prompt_cnt'][id]['ai_provider_cnt'][provider] =
            {}
        }
        if (
          !cacheData[currentDay]['prompt_cnt'][id]['ai_provider_cnt'][provider][
            host
          ]
        ) {
          cacheData[currentDay]['prompt_cnt'][id]['ai_provider_cnt'][provider][
            host
          ] = {
            total_cnt: 0,
          }
        }
        cacheData[currentDay]['prompt_cnt'][id]['ai_provider_cnt'][provider][
          host
        ]['total_cnt'] += 1
      }
    }
    setChatGPTRequestTime(Date.now())
    await Browser.storage.local.set({
      [CHATGPT_REQUEST_COUNT_RECORD]: cacheData,
    })
    console.log('CHATGPT_REQUEST_COUNT_RECORD', cacheData)
    const dateRequestCount = omit(cacheData)
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
  } catch (e) {
    console.log('increaseChatGPTRequestCount error', e)
  }
}
const debounceFetchChatGPTErrorRecord = debounce(() => {
  fetchChatGPTErrorRecord()
}, RECORD_DEBOUNCE_TIME)

const fetchChatGPTErrorRecord = async () => {
  try {
    // 如果document不可见，就不发送
    if (document.hidden) {
      return
    }
    const fingerprint = await getFingerPrint()
    const startRecordTime = await getStorageDataKeyByKey(
      CHATGPT_REQUEST_TIME_RECORD,
    )
    const info = await getStorageDataKeyByKey(CHATGPT_REQUEST_COUNT_RECORD)
    let dayCount = 0
    let totalCount = 0
    Object.keys(info).forEach((key) => {
      if (info[key].total_cnt > 0) {
        dayCount += 1
        totalCount += info[key].total_cnt
      }
    })
    // 如果没有数据，就不发送
    if (dayCount === 0 || totalCount === 0) {
      return
    }
    const accessToken = await getAccessToken()
    if (startRecordTime && info && accessToken) {
      fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/log`, {
        method: 'POST',
        body: JSON.stringify({
          start_timestamp: dayjs(startRecordTime).unix(),
          end_timestamp: dayjs().unix(),
          info_object: info,
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
      // TODO - 即将废弃，旧的接口
      try {
        let oldErrorCount = 0
        let oldErrorInfo = {}
        Object.keys(info).forEach((date) => {
          if (info[date]) {
            oldErrorCount += info[date].error_cnt
            oldErrorInfo = {
              [date]: info[date].total_cnt,
            }
          }
        })
        fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/save_gpt_error_records`, {
          method: 'POST',
          body: JSON.stringify({
            start_timestamp: dayjs(startRecordTime).unix(),
            end_timestamp: dayjs().unix(),
            error_count: oldErrorCount,
            info_object: oldErrorInfo,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            fp: `${fingerprint}`,
          },
        })
          .then()
          .catch()
      } catch (e) {
        console.log('fetchChatGPTErrorRecord error', e)
      }
    }
  } catch (error) {
    console.log('fetchChatGPTErrorRecord error', error)
  }
}
