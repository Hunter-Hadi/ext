import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureAIResponseLanguageCard from '@/pages/settings/pages/language/FeatureAIResponseLanguageCard'
const SettingsLanguagePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureAIResponseLanguageCard />
    </Stack>
  )
}
export default SettingsLanguagePage
