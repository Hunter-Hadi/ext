import Browser from 'webextension-polyfill'

import {
  getMaxAIBetaFeatureSettingsDefault,
  IMaxAIBetaFeatures,
  MAXAI_BETA_FEATURES_SAVE_KEY,
  MAXAI_FETCH_BETA_FEATURES_CYCLE_TIME,
} from '@/background/utils/maxAIBetaFeatureSettings/constant'

export const backgroundGetBetaFeatureSettings =
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
    return getMaxAIBetaFeatureSettingsDefault()
  }
