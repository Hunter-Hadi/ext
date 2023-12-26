import Stack from '@mui/material/Stack'
import React from 'react'

import useSearchWithAISettingsInit from '@/features/searchWithAI/hooks/useSearchWithAISettingsInit'

import FeatureSearchWithAICard from './FeatureSearchWithAICard'
import FeatureTriggerModeCard from './FeatureTriggerModeCard'

const SettingsSearchWithAIPage = () => {
  useSearchWithAISettingsInit()

  return (
    <Stack>
      <FeatureSearchWithAICard />
      <FeatureTriggerModeCard />
    </Stack>
  )
}

export default SettingsSearchWithAIPage
