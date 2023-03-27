import React from 'react'
import './OptionsPage.less'
import { Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import { EzMailAIIcon } from '@/components/CustomIcon'
import ContextMenuSettings from '@/pages/options/EzMailContextMenuSettings'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'

const APP_NAME = process.env.APP_NAME

const OptionsPage = () => {
  const [value, setValue] = React.useState('reply')
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <Container maxWidth={'lg'}>
      <Stack spacing={4} my={4}>
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          <EzMailAIIcon sx={{ fontSize: 32, color: 'inherit' }} />
          <Typography fontSize={24} fontWeight={700}>
            {APP_NAME} Settings
          </Typography>
        </Stack>
        <Tabs value={value} onChange={handleChange}>
          <Tab value={'reply'} label="Edit menu options" />
          {/* <Tab value={'new-email'} label="Edit menu option (new email)" /> */}
        </Tabs>
        {value === 'reply' && (
          <ContextMenuSettings
            iconSetting
            // menuType={'reply'}
            defaultContextMenuJson={defaultGmailToolbarContextMenuJson}
            settingsKey={'gmailToolBarContextMenu'}
          />
        )}
        {/* {value === 'new-email' && (
          <ContextMenuSettings
            iconSetting
            menuType={'new-email'}
            defaultContextMenuJson={defaultGmailToolbarContextMenuJson}
            settingsKey={'gmailToolBarContextMenu'}
          />
        )} */}
      </Stack>
    </Container>
  )
}

export default OptionsPage
