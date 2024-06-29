import Browser from 'webextension-polyfill'

export const MAXAI_BETA_FEATURES_SAVE_KEY = 'MAXAI_BETA_FEATURES_SAVE_KEY'
export const MAXAI_FETCH_BETA_FEATURES_CYCLE_TIME = 24 * 60 * 60 * 1000 // 24小时
export interface IMaxAIBetaFeatures {
  // 云同步
  chat_sync?: boolean
  // 语音输入
  voice_input?: boolean
}
export const getMaxAIBetaFeatureSettingsDefault = (): IMaxAIBetaFeatures => {
  return {
    chat_sync: false,
    voice_input: false,
  }
}
export const removeMaxAIBetaFeatureSettings = async () => {
  await Browser.storage.local.remove(MAXAI_BETA_FEATURES_SAVE_KEY)
}
