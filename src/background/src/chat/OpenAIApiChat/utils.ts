import {
  OPENAI_API_MODELS,
  OPENAI_LOCAL_STORAGE_OPENAI_API_SETTINGS_SAVE_KEY,
} from '@/constants'
import Browser from 'webextension-polyfill'
import { IOpenAIApiSettingsType } from '@/background/src/chat/OpenAiApiChat/types'

export const getOpenAIApiSettings =
  async (): Promise<IOpenAIApiSettingsType> => {
    const cache = await Browser.storage.local.get(
      OPENAI_LOCAL_STORAGE_OPENAI_API_SETTINGS_SAVE_KEY,
    )
    const defaultConfig = {
      apiKey: '',
      apiHost: 'https://api.openai.com',
      apiModel: OPENAI_API_MODELS[0],
      temperature: 1,
    }
    try {
      if (cache[OPENAI_LOCAL_STORAGE_OPENAI_API_SETTINGS_SAVE_KEY]) {
        const settings = {
          // 因为每次版本更新都可能会有新字段，用本地的覆盖默认的就行
          ...defaultConfig,
          ...JSON.parse(
            cache[OPENAI_LOCAL_STORAGE_OPENAI_API_SETTINGS_SAVE_KEY],
          ),
        }
        return settings
      } else {
        return defaultConfig
      }
    } catch (e) {
      // 说明没有这个字段，应该返回默认的配置
      return defaultConfig
    }
  }

export const setOpenAIApiSettings = async (
  settings: IOpenAIApiSettingsType,
): Promise<boolean> => {
  try {
    await Browser.storage.local.set({
      [OPENAI_LOCAL_STORAGE_OPENAI_API_SETTINGS_SAVE_KEY]:
        JSON.stringify(settings),
    })
    return true
  } catch (e) {
    return false
  }
}
