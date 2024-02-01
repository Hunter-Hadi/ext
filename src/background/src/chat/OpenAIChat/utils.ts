import Browser from 'webextension-polyfill'

import { IAIProviderType } from '@/background/provider/chat'
import backgroundGetContentOfURL from '@/features/shortcuts/utils/web/backgroundGetContentOfURL'

export const REMOTE_AI_PROVIDER_CONFIG_TIME_KEY =
  'REMOTE_AI_PROVIDER_CONFIG_TIME_KEY'
export const REMOTE_AI_PROVIDER_CONFIG_KEY = 'REMOTE_AI_PROVIDER_CONFIG_KEY'

export interface IRemoteAIProviderConfig {
  date: number
  chatGPTWebappModelsWhiteList: string[]
  disabledAIProviders: IAIProviderType[]
  hiddenAIProviders: IAIProviderType[]
}

export const DEFAULT_REMOTE_AI_PROVIDER_CONFIG: IRemoteAIProviderConfig = {
  date: Date.now(),
  chatGPTWebappModelsWhiteList: [],
  disabledAIProviders: [],
  hiddenAIProviders: [],
}

// background发起的
export const updateRemoteAIProviderConfigAsync = async (): Promise<IRemoteAIProviderConfig> => {
  const lastFetchTime = await Browser.storage.local.get(
    REMOTE_AI_PROVIDER_CONFIG_TIME_KEY,
  )
  if (lastFetchTime[REMOTE_AI_PROVIDER_CONFIG_TIME_KEY]) {
    const now = Date.now()
    const diff = now - lastFetchTime[REMOTE_AI_PROVIDER_CONFIG_TIME_KEY]
    // 2小时内不更新
    // if (diff < 2 * 60 * 60 * 1000) {
    if (diff < 2 * 1000) {
      return await getRemoteAIProviderConfigCache()
    }
  }
  const webpageData = await backgroundGetContentOfURL(
    `https://www.phtracker.com/crx/info/provider/v2`,
    10 * 1000,
  )
  if (webpageData.success && webpageData.readabilityText) {
    try {
      const data = JSON.parse(
        webpageData.readabilityText,
      ) as IRemoteAIProviderConfig
      if (data?.date) {
        // set to local storage
        await Browser.storage.local.set({
          [REMOTE_AI_PROVIDER_CONFIG_KEY]: JSON.stringify(data),
        })
        await Browser.storage.local.set({
          [REMOTE_AI_PROVIDER_CONFIG_TIME_KEY]: Date.now(),
        })
        return data
      }
      return DEFAULT_REMOTE_AI_PROVIDER_CONFIG
    } catch (e) {
      console.log(e)
      return DEFAULT_REMOTE_AI_PROVIDER_CONFIG
    }
  }
  return DEFAULT_REMOTE_AI_PROVIDER_CONFIG
}

export const getRemoteAIProviderConfigCache = async (): Promise<IRemoteAIProviderConfig> => {
  try {
    const cache = await Browser.storage.local.get(REMOTE_AI_PROVIDER_CONFIG_KEY)
    if (cache[REMOTE_AI_PROVIDER_CONFIG_KEY]) {
      const data = JSON.parse(cache[REMOTE_AI_PROVIDER_CONFIG_KEY])
      return data
    }
    return DEFAULT_REMOTE_AI_PROVIDER_CONFIG
  } catch (e) {
    console.log(e)
    return DEFAULT_REMOTE_AI_PROVIDER_CONFIG
  }
}
