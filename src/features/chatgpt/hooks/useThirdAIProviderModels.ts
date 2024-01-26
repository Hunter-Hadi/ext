import { useMemo } from 'react'

import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP } from '@/constants'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { IAIProviderModel } from '@/features/chatgpt/types'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { list2Options } from '@/utils/dataHelper/arrayHelper'

/**
 * 选择第三方AIProvider的model
 * @description - 选择第三方AIProvider的model
 */
const useThirdAIProviderModels = () => {
  const {
    currentAIProvider,
    updateAIProviderModel,
    AI_PROVIDER_MODEL_MAP,
  } = useAIProviderModels()
  const { sidebarSettings, updateSidebarSettings } = useSidebarSettings()
  const currentThirdAIProvider =
    sidebarSettings?.chat?.thirdAIProvider || AI_PROVIDER_MAP.OPENAI
  const currentThirdAIProviderDetail = useMemo(() => {
    return AIProviderOptions.find((AIProviderOption) => {
      return AIProviderOption.value === currentThirdAIProvider
    })
  }, [currentThirdAIProvider])
  const currentThirdAIProviderModelOptions = useMemo(() => {
    const data: IAIProviderModel[] =
      AI_PROVIDER_MODEL_MAP[currentThirdAIProvider] || []
    return list2Options(data, {
      labelKey: 'title',
      valueKey: 'value',
    })
  }, [AI_PROVIDER_MODEL_MAP, currentThirdAIProvider])
  const isSelectedThirdAIProvider =
    sidebarSettings?.chat?.thirdAIProvider === currentAIProvider
  const updateThirdAIProviderModel = async (
    AIProvider: IAIProviderType,
    model: string,
  ) => {
    await updateAIProviderModel(AIProvider, model)
    await updateSidebarSettings({
      chat: {
        thirdAIProvider: AIProvider,
        thirdAIProviderModel: model,
      },
    })
  }
  /**
   * 设置当前的Model为第三方AIProvider的model
   */
  const setAIProviderModelToThirdParty = async () => {
    await updateThirdAIProviderModel(
      sidebarSettings?.chat?.thirdAIProvider || AI_PROVIDER_MAP.OPENAI,
      sidebarSettings?.chat?.thirdAIProviderModel ||
        'text-davinci-002-render-sha',
    )
  }
  return {
    currentThirdAIProvider: sidebarSettings?.chat?.thirdAIProvider,
    currentThirdAIProviderModel: sidebarSettings?.chat?.thirdAIProviderModel,
    currentThirdAIProviderDetail,
    isSelectedThirdAIProvider,
    setAIProviderModelToThirdParty,
    updateThirdAIProviderModel,
    currentThirdAIProviderModelOptions,
  }
}
export default useThirdAIProviderModels
