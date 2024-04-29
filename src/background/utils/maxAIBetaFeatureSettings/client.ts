import Browser from 'webextension-polyfill'

import {
  getMaxAIBetaFeatureSettingsDefault,
  IMaxAIBetaFeatures,
  MAXAI_BETA_FEATURES_SAVE_KEY,
  MAXAI_FETCH_BETA_FEATURES_CYCLE_TIME,
} from '@/background/utils/maxAIBetaFeatureSettings/constant'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

const fetchMaxAIBetaFeatureSettings = async () => {
  const defaultSettings = getMaxAIBetaFeatureSettingsDefault()
  try {
    console.log('同步服务器设置到本地')
    const result = await clientFetchMaxAIAPI<{
      status: string
      data: IMaxAIBetaFeatures
    }>(
      '/user/user_beta_features',
      {},
      {
        method: 'GET',
      },
    )
    if (result.data?.status === 'OK') {
      const settings = result.data.data
      if (Object.keys(settings).length >= Object.keys(defaultSettings).length) {
        return settings
      }
    }
    return defaultSettings
  } catch (e) {
    console.error(e)
    return defaultSettings
  }
}

export const clientGetMaxAIBetaFeatureSettings =
  async (): Promise<IMaxAIBetaFeatures> => {
    const settings = await Browser.storage.local.get(
      MAXAI_BETA_FEATURES_SAVE_KEY,
    )
    if (settings && settings[MAXAI_BETA_FEATURES_SAVE_KEY]) {
      const cacheSettings = settings[MAXAI_BETA_FEATURES_SAVE_KEY]
      // 如果缓存的数据未过期，则直接返回
      if (
        cacheSettings.lastModified + MAXAI_FETCH_BETA_FEATURES_CYCLE_TIME >
        new Date().getTime()
      ) {
        return cacheSettings.data
      }
    }
    const data = await fetchMaxAIBetaFeatureSettings()
    await Browser.storage.local.set({
      [MAXAI_BETA_FEATURES_SAVE_KEY]: {
        lastModified: new Date().getTime(),
        data,
      },
    })
    return data
  }
