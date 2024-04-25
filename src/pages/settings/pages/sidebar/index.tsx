import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import FeatureAutoNewChatCard from '@/pages/settings/pages/sidebar/FeatureAutoNewChatCard'

const SettingsSidebarPage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureAutoNewChatCard />
    </Stack>
  )
}
export default SettingsSidebarPage
