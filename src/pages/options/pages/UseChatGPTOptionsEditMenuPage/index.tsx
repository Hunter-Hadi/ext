import { Stack } from '@mui/material'
import React from 'react'
import UseChatGPTContextMenuSettings from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'

const UseChatGPTOptionsEditMenuPage = () => {
  return (
    <Stack
      sx={{
        width: 700,
        height: '100%',
        mx: 'auto!important',
      }}
    >
      <UseChatGPTContextMenuSettings
        iconSetting
        settingsKey={'contextMenus'}
        defaultContextMenuJson={defaultContextMenuJson}
      />
    </Stack>
  )
}
export default UseChatGPTOptionsEditMenuPage
