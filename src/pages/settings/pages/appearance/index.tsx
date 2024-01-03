import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import FeatureAppearanceCard from '@/pages/settings/pages/appearance/FeatureAppearanceCard'
import FeaturePDFViewerCard from '@/pages/settings/pages/appearance/FeaturePDFViewerCard'
import FeatureQuickAccessViewerCard from '@/pages/settings/pages/appearance/FeatureQuickAccessViewerCard'
import FeatureShortcutHintCard from '@/pages/settings/pages/appearance/FeatureShortcutHintCard'
import FeatureSummarizeButton from '@/pages/settings/pages/appearance/FeatureSummarizeButton'

const SettingsAppearancePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureAppearanceCard />
      <FeatureQuickAccessViewerCard />
      <FeaturePDFViewerCard />
      <FeatureShortcutHintCard />
      <FeatureSummarizeButton />
    </Stack>
  )
}
export default SettingsAppearancePage
