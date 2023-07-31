import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureAIResponseLanguageCard from '@/pages/settings/pages/language/FeatureAIResponseLanguageCard'
import FeaturePreferredLanguageCard from '@/pages/settings/pages/language/FeaturePreferredLanguageCard'
const SettingsLanguagePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeaturePreferredLanguageCard />
      <FeatureAIResponseLanguageCard />
    </Stack>
  )
}
export default SettingsLanguagePage
