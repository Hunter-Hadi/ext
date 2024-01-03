import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import FeatureOneClickPromptsCard from '@/pages/settings/pages/perks/FeatureOneClickPromptsCard'
import FeatureRewardsCard from '@/pages/settings/pages/perks/FeatureRewardsCard'

const SettingsPerksPage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureOneClickPromptsCard />
      <FeatureRewardsCard />
    </Stack>
  )
}
export default SettingsPerksPage
