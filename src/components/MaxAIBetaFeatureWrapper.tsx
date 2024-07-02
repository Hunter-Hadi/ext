import React, { FC } from 'react'

import { IMaxAIBetaFeatures } from '@/background/utils/maxAIBetaFeatureSettings/constant'
import useMaxAIBetaFeatures from '@/features/auth/hooks/useMaxAIBetaFeatures'

type MaxAIBetaFeatureName = keyof IMaxAIBetaFeatures

const MaxAIBetaFeatureWrapper: FC<{
  betaFeatureName: MaxAIBetaFeatureName
  children: React.ReactNode
}> = (props) => {
  const { betaFeatureName } = props
  const { maxAIBetaFeaturesLoaded, maxAIBetaFeatures } = useMaxAIBetaFeatures()
  if (!maxAIBetaFeaturesLoaded || !maxAIBetaFeatures[betaFeatureName]) {
    return null
  }
  return <>{props.children}</>
}
export default MaxAIBetaFeatureWrapper
