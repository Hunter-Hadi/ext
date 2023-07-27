import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureAppearanceCard from '@/pages/settings/pages/appearance/FeatureAppearanceCard'
import FeatureShortcutHintCard from '@/pages/settings/pages/appearance/FeatureShortcutHintCard'
import FeatureGmailAssistantCard from '@/pages/settings/pages/appearance/FeatureGmailAssistantCard'
import FeaturePDFViewerCard from '@/pages/settings/pages/appearance/FeaturePDFViewerCard'

const SettingsAppearancePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureAppearanceCard />
      <FeatureShortcutHintCard />
      <FeatureGmailAssistantCard />
      <FeaturePDFViewerCard />
    </Stack>
  )
}
export default SettingsAppearancePage
