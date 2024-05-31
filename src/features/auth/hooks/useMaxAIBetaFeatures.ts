import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { clientGetMaxAIBetaFeatureSettings } from '@/background/utils/maxAIBetaFeatureSettings/client'
import { useAuthLogin } from '@/features/auth'
import { MaxAIBetaFeaturesState } from '@/features/auth/store'

/**
 * 获取MaxAI Beta功能开关
 * @param autoFetchSettings 是否自动获取设置
 */
const useMaxAIBetaFeatures = (autoFetchSettings = false) => {
  const [maxAIBetaFeatures, setMaxAIBetaFeatures] = useRecoilState(
    MaxAIBetaFeaturesState,
  )
  const { loaded, isLogin } = useAuthLogin()
  const onceRef = useRef(false)
  useEffect(() => {
    if (autoFetchSettings && isLogin && !onceRef.current && loaded) {
      onceRef.current = true
      clientGetMaxAIBetaFeatureSettings().then((features) => {
        setMaxAIBetaFeatures({
          features,
          loaded: true,
        })
      })
    }
  }, [loaded, isLogin])
  return {
    maxAIBetaFeatures: maxAIBetaFeatures.features,
    maxAIBetaFeaturesLoaded: maxAIBetaFeatures.loaded,
  }
}
export default useMaxAIBetaFeatures
