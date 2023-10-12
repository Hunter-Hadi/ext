import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureGmailAssistantCard from '@/pages/settings/pages/help_me_write/FeatureGmailAssistantCard'
import FeatureOutlookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureOutlookAssistantCard'
import FeatureTwitterAssistantCard from '@/pages/settings/pages/help_me_write/FeatureTwitterAssistantCard'
import FeatureLinkedInAssistantCard from '@/pages/settings/pages/help_me_write/FeatureLinkedInAssistantCard'
import FeatureFacebookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureFacebookAssistantCard'
import FeatureYouTubeAssistantCard from '@/pages/settings/pages/help_me_write/FeatureYouTubeAssistantCard'
import FeatureInstagramAssistantCard from '@/pages/settings/pages/help_me_write/FeatureInstagramAssistantCard'

const SettingsHelpMeWritePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureGmailAssistantCard />
      <FeatureOutlookAssistantCard />
      <FeatureLinkedInAssistantCard />
      <FeatureTwitterAssistantCard />
      <FeatureFacebookAssistantCard />
      <FeatureYouTubeAssistantCard />
      <FeatureInstagramAssistantCard />
    </Stack>
  )
}

export default SettingsHelpMeWritePage
