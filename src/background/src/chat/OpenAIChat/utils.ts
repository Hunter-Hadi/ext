import Browser from 'webextension-polyfill'

const timeKey = 'CHAT_GPT_WHITE_LIST_MODELS_TIME'
const modelKey = 'CHAT_GPT_WHITE_LIST_MODELS'

export const updateChatGPTWhiteListModelAsync = async (): Promise<string[]> => {
  const lastFetchTime = await Browser.storage.local.get(timeKey)
  if (lastFetchTime[timeKey]) {
    const now = Date.now()
    const diff = now - lastFetchTime[timeKey]
    // 1小时内不更新
    if (diff < 60 * 60 * 1000) {
      return await getChatGPTWhiteListModelAsync()
    }
  }
  const webpageData = await backgroundGetContentOfURL(
    `https://www.phtracker.com/crx/info/provider/v1`,
    10 * 1000,
  )
  if (webpageData.success && webpageData.body) {
    try {
      const data = JSON.parse(webpageData.body)
      if (data.models) {
        // set to local storage
        await Browser.storage.local.set({
          [modelKey]: JSON.stringify(data.models),
        })
        await Browser.storage.local.set({
          [timeKey]: Date.now(),
        })
        return data.models
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  return []
}

export const getChatGPTWhiteListModelAsync = async (): Promise<string[]> => {
  try {
    const cache = await Browser.storage.local.get(modelKey)
    if (cache[modelKey]) {
      const data = JSON.parse(cache[modelKey])
      return data
    } else {
      // 说明没有缓存，需要更新
      const webpageData = await backgroundGetContentOfURL(
        'https://www.phtracker.com/crx/info/provider/v1',
        20 * 1000,
      )
      if (webpageData.success && webpageData.body) {
        try {
          const data = JSON.parse(webpageData.body)
          if (data.models) {
            // set to local storage
            await Browser.storage.local.set({
              CHAT_GPT_WHITE_LIST_MODELS: JSON.stringify(data.models),
            })
            await Browser.storage.local.set({
              [timeKey]: Date.now(),
            })
            return data.models
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
    return []
  } catch (e) {
    console.log(e)
    return []
  }
}
import backgroundGetContentOfURL from '@/features/shortcuts/utils/web/backgroundGetContentOfURL'
