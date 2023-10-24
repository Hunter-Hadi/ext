import Browser from 'webextension-polyfill'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '../constants'

export const SEARCH_WITH_AI_STORAGE_KEY = 'SEARCH_WITH_AI_STORAGE_KEY'

export interface ISearchWithAISettings {
  aiProvider: ISearchWithAIProviderType
  enable: boolean
  triggerMode: 'manual' | 'always' | 'question-mask'
  webAccessPrompt: boolean
  arkoseToken: string
}

export const DEFAULT_SEARCH_WITH_AI_SETTING: ISearchWithAISettings = {
  aiProvider: SEARCH_WITH_AI_PROVIDER_MAP.OPENAI,
  enable: true,
  triggerMode: 'always',
  webAccessPrompt: true,
  arkoseToken: '',
}

export const getSearchWithAISettings = async () => {
  const result = await Browser.storage.local.get(SEARCH_WITH_AI_STORAGE_KEY)
  if (result[SEARCH_WITH_AI_STORAGE_KEY]) {
    return result[SEARCH_WITH_AI_STORAGE_KEY] as ISearchWithAISettings
  } else {
    return DEFAULT_SEARCH_WITH_AI_SETTING
  }
}

export const setSearchWithAISettings = async (
  data: Partial<ISearchWithAISettings>,
) => {
  const preCache =
    (await getSearchWithAISettings()) || DEFAULT_SEARCH_WITH_AI_SETTING
  await Browser.storage.local.set({
    [SEARCH_WITH_AI_STORAGE_KEY]: {
      ...preCache,
      ...data,
    },
  })
}
