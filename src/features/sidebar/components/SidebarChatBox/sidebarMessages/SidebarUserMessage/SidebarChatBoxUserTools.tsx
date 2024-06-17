import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { IUserChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { hideChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'

const TEMP_CLOSE_HOSTS = ['www.linkedin.com']

const SidebarChatBoxUserTools: FC<{
  message: IUserChatMessage
}> = (props) => {
  const { message } = props
  const currentMessageText = formatChatMessageContent(message, true)
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      width={'100%'}
      justifyContent={'flex-end'}
    >
      <CopyTooltipIconButton
        sx={{
          padding: '5px',
        }}
        PopperProps={{
          disablePortal: true,
        }}
        copyText={currentMessageText}
        onCopy={() => {
          if (TEMP_CLOSE_HOSTS.includes(window.location.host)) {
            setTimeout(hideChatBox, 1)
          }
        }}
      />
    </Stack>
  )
}
export default SidebarChatBoxUserTools
