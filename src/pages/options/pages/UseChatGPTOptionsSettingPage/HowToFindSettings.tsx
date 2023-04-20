import React, { FC } from 'react'
import CloseAlert from '@/components/CloseAlert'
import { Stack, Typography } from '@mui/material'

const HowToFindSettings: FC = () => {
  return (
    <CloseAlert
      icon={<></>}
      sx={{
        // bgcolor: '#E2E8F0',
        mt: 1,
        mb: 2,
      }}
    >
      <Stack spacing={1}>
        <Typography fontSize={14} color={'text.primary'}>
          You can always find this Settings page by clicking the Settings icon
          at the top of the sidebar.
        </Typography>
        <img
          src={`https://www.usechatgpt.ai/assets/chrome-extension/settings-entry.png`}
          alt="settings-entry"
          width={466}
          height={121}
        />
      </Stack>
    </CloseAlert>
  )
}
export default HowToFindSettings
