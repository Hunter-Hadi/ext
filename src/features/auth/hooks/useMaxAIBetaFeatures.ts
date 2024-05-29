import { useRecoilState } from 'recoil'

import { clientGetMaxAIBetaFeatureSettings } from '@/background/utils/maxAIBetaFeatureSettings/client'
import { MaxAIBetaFeaturesState } from '@/features/auth/store'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'

/**
 * 获取MaxAI Beta功能开关
 * @param autoFetchSettings 是否自动获取设置
 */
const useMaxAIBetaFeatures = (autoFetchSettings = false) => {
  const [maxAIBetaFeatures, setMaxAIBetaFeatures] = useRecoilState(
    MaxAIBetaFeaturesState,
  )
  useEffectOnce(() => {
    if (autoFetchSettings) {
      clientGetMaxAIBetaFeatureSettings().then((features) => {
        setMaxAIBetaFeatures({
          loaded: true,
          features,
        })
      })
    }
  })
  return {
    maxAIBetaFeatures: maxAIBetaFeatures.features,
    maxAIBetaFeaturesLoaded: maxAIBetaFeatures.loaded,
  }
}
export default useMaxAIBetaFeatures
