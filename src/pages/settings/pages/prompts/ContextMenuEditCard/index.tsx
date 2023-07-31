import Stack from '@mui/material/Stack'
import React from 'react'
import UseChatGPTContextMenuSettings from '@/pages/settings/pages/prompts/ContextMenuEditCard/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'

const ContextMenuEditCard = () => {
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
        buttonKey={'textSelectPopupButton'}
        defaultContextMenuJson={defaultContextMenuJson}
      />
    </Stack>
  )
}
export default ContextMenuEditCard
