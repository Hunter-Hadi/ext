import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureGmailAssistantCard from '@/pages/settings/pages/help_me_write/FeatureGmailAssistantCard'
import FeatureOutlookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureOutlookAssistantCard'

const SettingsHelpMeWritePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureGmailAssistantCard />
      <FeatureOutlookAssistantCard />
    </Stack>
  )
}

export default SettingsHelpMeWritePage
