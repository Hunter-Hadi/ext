import Browser from 'webextension-polyfill'

export const MAXAI_BETA_FEATURES_SAVE_KEY = 'MAXAI_BETA_FEATURES_SAVE_KEY'
export const MAXAI_FETCH_BETA_FEATURES_CYCLE_TIME = 24 * 60 * 60 * 1000 // 24小时
export interface IMaxAIBetaFeatures {
  // 云同步 - 2024-06-27结束betaFeature
  chat_sync?: boolean
  // 语音输入
  voice_input?: boolean
  // 人工制品
  enabled_artifacts?: boolean
  // 项目内容
  project_content?: boolean
}

export const getMaxAIBetaFeatureSettingsDefault = (): IMaxAIBetaFeatures => {
  return {
    chat_sync: false,
    voice_input: false,
    enabled_artifacts: false,
    project_content: false,
  }
}
export const removeMaxAIBetaFeatureSettings = async () => {
  await Browser.storage.local.remove(MAXAI_BETA_FEATURES_SAVE_KEY)
}
