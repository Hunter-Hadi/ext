import React from 'react'
import './OptionsPage.less'
import { Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import { EzMailAIIcon } from '@/components/CustomIcon'
import ContextMenuSettings from '@/pages/options/ContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'

const OptionsPage = () => {
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <Container maxWidth={'lg'}>
      <Stack spacing={4} my={4}>
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          <EzMailAIIcon sx={{ fontSize: 32 }}></EzMailAIIcon>
          <Typography fontSize={24} fontWeight={700}>
            EzMail.AI Settings
          </Typography>
        </Stack>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Edit options" />
          <Tab label="Toolbar options" />
        </Tabs>
        {value === 0 && (
          <ContextMenuSettings
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