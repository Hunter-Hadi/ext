import React from 'react'
import './OptionsPage.less'
import { Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import { UseChatGptIcon } from '@/components/CustomIcon'
import ContextMenuSettings from '@/pages/options/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'

const APP_NAME = process.env.APP_NAME

const OptionsPage = () => {
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <Container maxWidth={'lg'}>
      <Stack spacing={4} my={4}>
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          <UseChatGptIcon
            sx={{
              fontSize: 32,
            }}
          />
          <Typography fontSize={24} fontWeight={700}>
            {APP_NAME} Settings
          </Typography>
        </Stack>
        <Tabs value={value} onChange={handleChange}>
          {<Tab value={0} label="Edit options" />}
        </Tabs>
        {value === 0 && (
          <ContextMenuSettings
            iconSetting
            defaultContextMenuJson={defaultContextMenuJson}
            settingsKey={'contextMenus'}
          />
        )}
      </Stack>
    </Container>
  )
}

export default OptionsPage
