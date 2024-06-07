import Browser from 'webextension-polyfill'

export const MAXAI_BETA_FEATURES_SAVE_KEY = 'MAXAI_BETA_FEATURES_SAVE_KEY'
export const MAXAI_FETCH_BETA_FEATURES_CYCLE_TIME = 24 * 60 * 60 * 1000 // 24小时
export interface IMaxAIBetaFeatures {
  chat_sync?: boolean
}
export const getMaxAIBetaFeatureSettingsDefault = (): IMaxAIBetaFeatures => {
  return {
    chat_sync: false,
  }
}
export const removeMaxAIBetaFeatureSettings = async () => {
  await Browser.storage.local.remove(MAXAI_BETA_FEATURES_SAVE_KEY)
}
