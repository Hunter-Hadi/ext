import useSearchWithAISettingsInit from '@/features/searchWithAI/hooks/useSearchWithAISettingsInit'
import { Stack } from '@mui/material'
import React from 'react'
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
