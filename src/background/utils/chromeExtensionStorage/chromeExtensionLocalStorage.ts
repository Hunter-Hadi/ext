import Browser from 'webextension-polyfill'

import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import {
  BING_MODELS,
  BingConversationStyle,
} from '@/background/src/chat/BingChat/bing/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { MAXAI_GENMINI_MODELS } from '@/background/src/chat/MaxAIGeminiChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import {
  IChromeExtensionLocalStorage,
  IChromeExtensionLocalStorageUpdateFunction,
} from '@/background/utils/chromeExtensionStorage/type'
import {
  AI_PROVIDER_MAP,
  CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY,
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
} from '@/constants'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

export const defaultChromeExtensionLocalStorage = (): IChromeExtensionLocalStorage => {
  return {
    sidebarSettings: {
      chat: {
        conversationId: '',
      },
      summary: {
        conversationId: '',
      },
      search: {
        conversationId: '',
        copilot: false,
        searchEngine: 'google',
        maxResultsCount: 6,
      },
      art: {
        conversationId: '',
        isEnabledConversationalMode: true,
      },
      common: {
        currentAIProvider: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
        chatBoxWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
      },
      cache: {
        chatConversationCache: {},
      },
    },
    thirdProviderSettings: {
      [AI_PROVIDER_MAP.BING]: {
        conversationStyle: BingConversationStyle.Balanced,
        model: BING_MODELS[0].value,
      },
      [AI_PROVIDER_MAP.CLAUDE]: {
        model: CLAUDE_MODELS[0].value,
      },
      [AI_PROVIDER_MAP.BARD]: {
        model: BARD_MODELS[0].value,
      },
      [AI_PROVIDER_MAP.OPENAI]: {
        model: 'text-davinci-002-render-sha',
        plugins: [],
        pluginOptions: [],
        modelOptions: [],
      },
      [AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS]: {
        temperature: 1,
        model: USE_CHAT_GPT_PLUS_MODELS[0].value,
      },
      [AI_PROVIDER_MAP.OPENAI_API]: {
        model: OPENAI_API_MODELS[0].value,
        temperature: 1,
        apiKey: '',
        apiHost: 'https://api.openai.com',
      },
      [AI_PROVIDER_MAP.POE]: {
        model: POE_MODELS[0].value,
      },
      [AI_PROVIDER_MAP.MAXAI_CLAUDE]: {
        model: MAXAI_CLAUDE_MODELS[0].value,
        temperature: 1,
      },
      [AI_PROVIDER_MAP.MAXAI_GEMINI]: {
        model: MAXAI_GENMINI_MODELS[0].value,
        temperature: 1,
      },
      [AI_PROVIDER_MAP.MAXAI_DALLE]: {
        model: MAXAI_IMAGE_GENERATE_MODELS[0].value,
        contentType: 'vivid',
        aspectRatio: '1:1',
        resolution: [1024, 1024],
        generateCount: 1,
      },
    },
  }
}
export const getChromeExtensionLocalStorage = async (): Promise<IChromeExtensionLocalStorage> => {
  const defaultConfig = defaultChromeExtensionLocalStorage()
  const localData = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY,
  )
  try {
    if (localData[CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY]) {
      const localSettings = JSON.parse(
        localData[CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY],
      )
      return mergeWithObject([defaultConfig, localSettings])
    } else {
      return defaultConfig
    }
  } catch (e) {
    // 说明没有这个字段，应该返回默认的配置
    return defaultConfig
  }
}
export const setChromeExtensionLocalStorage = async (
  settingsOrUpdateFunction:
    | IChromeExtensionLocalStorage
    | IChromeExtensionLocalStorageUpdateFunction,
): Promise<boolean> => {
  try {
    const oldSettings = await getChromeExtensionLocalStorage()
    if (settingsOrUpdateFunction instanceof Function) {
      const newSettings = settingsOrUpdateFunction(oldSettings)
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify(newSettings),
      })
    } else {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify(
          mergeWithObject([oldSettings, settingsOrUpdateFunction]),
        ),
      })
    }
    return true
  } catch (e) {
    return false
  }
}
/**
 * 重置chrome extension的local storage
 */
export const resetChromeExtensionLocalStorage = async (): Promise<boolean> => {
  try {
    const oldSettings = await getChromeExtensionLocalStorage()
    const openAIAPIKey = oldSettings.thirdProviderSettings?.OPENAI_API?.apiKey
    const openAIAPIHost = oldSettings.thirdProviderSettings?.OPENAI_API?.apiHost
    const defaultConfig = defaultChromeExtensionLocalStorage()
    if (openAIAPIKey && defaultConfig.thirdProviderSettings?.OPENAI_API) {
      defaultConfig.thirdProviderSettings.OPENAI_API.apiKey = openAIAPIKey
      defaultConfig.thirdProviderSettings.OPENAI_API.apiHost = openAIAPIHost
    }
    await Browser.storage.local.set({
      [CHROME_EXTENSION_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify(defaultConfig),
    })
    return true
  } catch (e) {
    return false
  }
}
