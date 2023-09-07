import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureAppearanceCard from '@/pages/settings/pages/appearance/FeatureAppearanceCard'
import FeatureShortcutHintCard from '@/pages/settings/pages/appearance/FeatureShortcutHintCard'
import FeatureGmailAssistantCard from '@/pages/settings/pages/appearance/FeatureGmailAssistantCard'
import FeaturePDFViewerCard from '@/pages/settings/pages/appearance/FeaturePDFViewerCard'
import FeatureQuickAccessViewerCard from '@/pages/settings/pages/appearance/FeatureQuickAccessViewerCard'

const SettingsAppearancePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureAppearanceCard />
      <FeatureQuickAccessViewerCard />
      <FeatureGmailAssistantCard />
      <FeaturePDFViewerCard />
      <FeatureShortcutHintCard />
    </Stack>
  )
}
export default SettingsAppearancePage
