import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import useThirdProviderSetting from '@/features/chatgpt/hooks/useThirdProviderSetting'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import {
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import { useCleanChatGPT } from '@/features/chatgpt/hooks/useCleanChatGPT'
import reverse from 'lodash-es/reverse'
import cloneDeep from 'lodash-es/cloneDeep'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeChat/claude/types'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import { getChatGPTWhiteListModelAsync } from '@/background/src/chat/OpenAiChat/utils'

/**
 * 用来获取当前AI提供商的模型列表
 * @since 2023-07-18
 * @version 1.0.0 - 返回数据结构title\titleTag\maxToken\tags\descriptions
 */

const useAIProviderModels = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const currentProvider = appSettings.chatGPTProvider
  const [loading, setLoading] = useState(false)
  const { currentThirdProviderSettings, saveThirdProviderSettings } =
    useThirdProviderSetting()
  const { cleanChatGPT } = useCleanChatGPT()
  // ===chatgpt 特殊处理开始===
  const [whiteListModels, setWhiteListModels] = useState<string[]>([])
  useEffect(() => {
    if (currentProvider === 'OPENAI') {
      getChatGPTWhiteListModelAsync().then((data) => {
        setWhiteListModels(data)
      })
    }
  }, [currentProvider])
  // ===chatgpt 特殊处理结束===
  const aiProviderModels = useMemo<IAIProviderModel[]>(() => {
    let currentModels: IAIProviderModel[] = []
    if (!currentProvider) {
      return currentModels
    }
    switch (currentProvider) {
      case 'OPENAI':
        {
          // 转换数据结构
          currentModels = (appSettings.models || [])
            .map((item) => {
              const isCodeInterpreter = item.slug === 'gpt-4-code-interpreter'
              const providerModel: IAIProviderModel = {
                title: item.title,
                value: item.slug,
                titleTag:
                  item.tags?.find((tag) =>
                    tag.toLowerCase().includes('beta'),
                  ) ||
                  item.tags?.find((tag) =>
                    tag.toLowerCase().includes('mobile'),
                  ) ||
                  '',
                maxTokens: item.max_tokens,
                tags: item.tags || [],
                descriptions: [
                  {
                    label: 'Max tokens',
                    value: generateMaxTokenText(item.max_tokens),
                  },
                  { label: 'Description', value: item.description },
                ],
                disabled:
                  // 白名单有值才判断
                  whiteListModels.length > 0
                    ? !whiteListModels.includes(item.slug)
                    : false,
                uploadFileConfig: isCodeInterpreter
                  ? {
                      accept: '',
                      acceptTooltip: 'Upload file',
                      maxFileSize: -1,
                      maxCount: 1,
                    }
                  : undefined,
              }
              return providerModel
            })
            .reverse()
        }
        break
      case 'USE_CHAT_GPT_PLUS':
        {
          currentModels = USE_CHAT_GPT_PLUS_MODELS
        }
        break
      case 'BARD':
        {
          currentModels = BARD_MODELS
        }
        break
      case 'BING':
        {
          currentModels = BING_MODELS
        }
        break
      case 'OPENAI_API':
        {
          currentModels = reverse(cloneDeep(OPENAI_API_MODELS))
        }
        break
      case 'CLAUDE':
        {
          currentModels = CLAUDE_MODELS
        }
        break
      case 'POE':
        {
          currentModels = POE_MODELS
        }
        break
      default:
        break
    }
    return currentModels
  }, [currentProvider, appSettings.models, whiteListModels])
  const currentAIProviderModel = useMemo(() => {
    if (currentProvider === 'OPENAI') {
      return appSettings.currentModel
    }
    return  currentThirdProviderSettings?.model || ''
  }, [currentProvider, appSettings.currentModel, currentThirdProviderSettings])
  const currentAIProviderDetail = useMemo(() => {
    return AIProviderOptions.find((item) => item.value === currentProvider)
  }, [currentProvider])
  const currentAIProviderModelDetail = useMemo(() => {
    return aiProviderModels.find(
      (item) => item.value === currentAIProviderModel,
    )
  }, [currentAIProviderModel, aiProviderModels])
  const updateAIProviderModel = useCallback(
    async (model: string) => {
      try {
        // TODO 以后统一处理，现在先用之前的逻辑
        if (currentProvider && currentProvider === 'OPENAI') {
          await setChromeExtensionSettings({
            currentModel: model,
          })
          setAppSettings(await getChromeExtensionSettings())
        } else if (
          currentProvider &&
          aiProviderModels.find((item) => item.value === model)
        ) {
          setLoading(true)
          await saveThirdProviderSettings(currentProvider, {
            model,
          })
        }
        await cleanChatGPT()
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    },
    [currentProvider, saveThirdProviderSettings, aiProviderModels],
  )
  console.log(
    'aiProviderModels',
    aiProviderModels,
    currentAIProviderModel,
    appSettings.chatGPTProvider,
    currentThirdProviderSettings,
  )
  return {
    aiProvider: appSettings.chatGPTProvider,
    aiProviderModel: currentAIProviderModel,
    currentAIProviderDetail,
    currentAIProviderModelDetail,
    aiProviderModels,
    updateAIProviderModel,
    loading,
  }
}

const generateMaxTokenText = (maxTokens?: number) =>
  `${numberWithCommas(maxTokens || 0, 0)} tokens`

export default useAIProviderModels
