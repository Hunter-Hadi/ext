import React from 'react'
import './OptionsPage.less'
import { Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import ContextMenuSettings from '@/pages/options/ContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'

const APP_NAME = process.env.APP_NAME
const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

const OptionsPage = () => {
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <Container maxWidth={'lg'}>
      <Stack spacing={4} my={4}>
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          {isEzMailApp ? (
            <EzMailAIIcon sx={{ fontSize: 32, color: 'inherit' }} />
          ) : (
            <UseChatGptIcon
              sx={{
                fontSize: 32,
              }}
            />
          )}
          <Typography fontSize={24} fontWeight={700}>
            {APP_NAME} Settings
          </Typography>
        </Stack>
        <Tabs value={value} onChange={handleChange}>
          {!isEzMailApp && <Tab label="Edit options" />}
          {isEzMailApp && <Tab label="Toolbar options" />}
        </Tabs>
        {value === 0 && (
          <ContextMenuSettings
            iconSetting
            defaultContextMenuJson={defaultContextMenuJson}
            settingsKey={'contextMenus'}
          />
        )}
        {value === 1 && (
          <ContextMenuSettings
            defaultContextMenuJson={defaultGmailToolbarContextMenuJson}
            settingsKey={'gmailToolBarContextMenu'}
          />
        )}
      </Stack>
    </Container>
  )
}

export default OptionsPage
