import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import FeatureDiscordAssistantCard from '@/pages/settings/pages/help_me_write/FeatureDiscordAssistantCard'
import FeatureFacebookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureFacebookAssistantCard'
import FeatureGmailAssistantCard from '@/pages/settings/pages/help_me_write/FeatureGmailAssistantCard'
import FeatureInstagramAssistantCard from '@/pages/settings/pages/help_me_write/FeatureInstagramAssistantCard'
import FeatureLinkedInAssistantCard from '@/pages/settings/pages/help_me_write/FeatureLinkedInAssistantCard'
import FeatureMessengerAssistantCard from '@/pages/settings/pages/help_me_write/FeatureMessengerAssistantCard'
import FeatureOutlookAssistantCard from '@/pages/settings/pages/help_me_write/FeatureOutlookAssistantCard'
import FeatureRedditAssistantCard from '@/pages/settings/pages/help_me_write/FeatureRedditAssistantCard'
import FeatureSlackAssistantCard from '@/pages/settings/pages/help_me_write/FeatureSlackAssistantCard'
import FeatureTelegramAssistantCard from '@/pages/settings/pages/help_me_write/FeatureTelegramAssistantCard'
import FeatureTwitterAssistantCard from '@/pages/settings/pages/help_me_write/FeatureTwitterAssistantCard'
import FeatureWhatsAppAssistantCard from '@/pages/settings/pages/help_me_write/FeatureWhatsAppAssistantCard'
import FeatureYouTubeAssistantCard from '@/pages/settings/pages/help_me_write/FeatureYouTubeAssistantCard'

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
      <FeatureRedditAssistantCard />
      <FeatureWhatsAppAssistantCard />
      <FeatureSlackAssistantCard />
      <FeatureDiscordAssistantCard />
      <FeatureTelegramAssistantCard />
      <FeatureMessengerAssistantCard />
    </Stack>
  )
}

export default SettingsHelpMeWritePage
