import { useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP } from '@/constants'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import useAIProviderModels, {
  useAIProviderModelsMap,
} from '@/features/chatgpt/hooks/useAIProviderModels'
import { ThirdPartyAIProviderConfirmDialogState } from '@/features/chatgpt/store'
import { IAIProviderModel } from '@/features/chatgpt/types'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { list2Options } from '@/utils/dataHelper/arrayHelper'

/**
 * 选择第三方AIProvider的model
 * @description - 选择第三方AIProvider的model
 */
const useThirdAIProviderModels = () => {
  const [, setDialogState] = useRecoilState(
    ThirdPartyAIProviderConfirmDialogState,
  )
  const { currentAIProvider, updateAIProviderModel } = useAIProviderModels()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const { sidebarSettings, updateSidebarSettings } = useSidebarSettings()

  // 当前设置的第三方的AIProvider
  const currentThirdAIProvider =
    sidebarSettings?.chat?.thirdAIProvider || AI_PROVIDER_MAP.OPENAI
  // 当前设置的第三方的AIProvider的详情
  const currentThirdAIProviderDetail = useMemo(() => {
    return AIProviderOptions.find((AIProviderOption) => {
      return AIProviderOption.value === currentThirdAIProvider
    })
  }, [currentThirdAIProvider])
  // 当前设置的第三方的AIProvider的models
  const currentThirdAIProviderModelOptions = useMemo(() => {
    const data: IAIProviderModel[] =
      AI_PROVIDER_MODEL_MAP[currentThirdAIProvider] || []
    return list2Options(data, {
      labelKey: 'title',
      valueKey: 'value',
    })
  }, [AI_PROVIDER_MODEL_MAP, currentThirdAIProvider])
  // 当前的AIProvider是否是第三方AIProvider
  const isSelectedThirdAIProvider =
    sidebarSettings?.chat?.thirdAIProvider === currentAIProvider
  // 更新第三方AIProvider的model
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
  const showThirdPartyAIProviderConfirmDialog = () => {
    setDialogState({
      open: true,
    })
  }
  const hideThirdPartyAIProviderConfirmDialog = () => {
    setDialogState({
      open: false,
    })
  }

  return {
    currentThirdAIProvider: sidebarSettings?.chat?.thirdAIProvider,
    currentThirdAIProviderModel: sidebarSettings?.chat?.thirdAIProviderModel,
    currentThirdAIProviderDetail,
    isSelectedThirdAIProvider,
    setAIProviderModelToThirdParty,
    updateThirdAIProviderModel,
    currentThirdAIProviderModelOptions,
    showThirdPartyAIProviderConfirmDialog,
    hideThirdPartyAIProviderConfirmDialog,
    AI_PROVIDER_MODEL_MAP,
  }
}
export default useThirdAIProviderModels
