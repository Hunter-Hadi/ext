import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import { useCallback, useMemo, useState } from 'react'
import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import useThirdProviderSetting from '@/features/chatgpt/hooks/useThirdProviderSetting'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'

/**
 * 用来获取当前AI提供商的模型列表
 * @since 2023-07-18
 * @version 1.0.0 - 返回数据结构title\titleTag\maxToken\tags\descriptions
 */

const useAIProviderModels = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const currentProvider = appSettings.chatGPTProvider
  const [loading, setLoading] = useState(false)
  const { currentThirdProviderSettings, saveThirdProviderSettings } =
    useThirdProviderSetting()
  const aiProviderModels = useMemo<IAIProviderModel[]>(() => {
    let currentModels: IAIProviderModel[] = []
    if (!currentProvider) {
      return currentModels
    }
    switch (currentProvider) {
      case 'OPENAI':
        {
          // 转换数据结构
          currentModels = (appSettings.models || []).map((item) => {
            const providerModel: IAIProviderModel = {
              title: item.title,
              value: item.slug,
              titleTag:
                item.tags?.find((tag) => tag.toLowerCase().includes('beta')) ||
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
            }
            return providerModel
          })
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
          currentModels = OPENAI_API_MODELS
        }
        break
      case 'CLAUDE':
        {
          currentModels = POE_MODELS
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
  }, [currentProvider, appSettings.models])
  const currentAIProviderModel = useMemo(() => {
    if (currentProvider === 'OPENAI') {
      return appSettings.currentModel
    }
    return currentThirdProviderSettings?.model || ''
  }, [currentProvider, appSettings.currentModel, currentThirdProviderSettings])
  const updateAIProviderModel = useCallback(
    async (model: string) => {
      try {
        if (
          currentProvider &&
          aiProviderModels.find((item) => item.value === model)
        ) {
          setLoading(true)
          await saveThirdProviderSettings(currentProvider, {
            model,
          })
        }
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
    aiProviderModels,
    updateAIProviderModel,
    loading,
  }
}

const generateMaxTokenText = (maxTokens?: number) =>
  `${numberWithCommas(maxTokens || 0, 0)} tokens`

export default useAIProviderModels
