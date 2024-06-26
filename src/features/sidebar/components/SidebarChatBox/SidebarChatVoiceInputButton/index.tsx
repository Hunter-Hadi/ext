import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import { UseChatGptIcon } from '@/components/CustomIcon'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'

export interface ISidebarChatVoiceInputButtonProps {
  sx?: SxProps
}

const SidebarChatVoiceInputButton: FC<ISidebarChatVoiceInputButtonProps> = (
  props,
) => {
  const { sx } = props
  const testid = 'max-ai__actions__button--voice-input'
  const { smoothConversationLoading } = useSmoothConversationLoading()
  return (
    <Button
      id={`MaxAISidebarVoiceInputButton`}
      variant={'outlined'}
      sx={{
        p: '5px',
        minWidth: 'unset',
        ...sx,
      }}
      data-testid={testid}
      disabled={smoothConversationLoading}
    >
      <UseChatGptIcon
        sx={{
          color: (t: any) =>
            t.palette.mode === 'dark'
              ? 'rgba(255,255,255,.87)'
              : 'rgba(0,0,0,.6)',
          fontSize: '18px',
        }}
      />
    </Button>
  )
}
export default SidebarChatVoiceInputButton
