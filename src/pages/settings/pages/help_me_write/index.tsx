import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureGmailAssistantCard from '@/pages/settings/pages/help_me_write/FeatureGmailAssistantCard'
import FeatureOutlookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureOutlookAssistantCard'
import FeatureTwitterAssistantCard from '@/pages/settings/pages/help_me_write/FeatureTwitterAssistantCard'
import FeatureLinkedInAssistantCard from '@/pages/settings/pages/help_me_write/FeatureLinkedInAssistantCard'
import FeatureFacebookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureFacebookAssistantCard'

const SettingsHelpMeWritePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureGmailAssistantCard />
      <FeatureOutlookAssistantCard />
      <FeatureLinkedInAssistantCard />
      <FeatureTwitterAssistantCard />
      <FeatureFacebookAssistantCard />
    </Stack>
  )
}

export default SettingsHelpMeWritePage
