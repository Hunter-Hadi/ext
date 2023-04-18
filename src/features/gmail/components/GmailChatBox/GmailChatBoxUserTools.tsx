import React, { FC, useState } from 'react'
import { Stack } from '@mui/material'
import TooltipIconButton from '@/components/TooltipIconButton'
import EditIcon from '@mui/icons-material/Edit'
import DoneIcon from '@mui/icons-material/Done'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { IGmailChatMessage } from '@/features/gmail/components/GmailChatBox'
import { hideChatBox } from '@/utils'

const TEMP_CLOSE_HOSTS = ['www.linkedin.com']

const GmailChatBoxUserTools: FC<{
  message: IGmailChatMessage
  editAble?: boolean
  onEdit: () => void
  onSave: () => void
  onCopy?: () => void
}> = (props) => {
  const { onEdit, onSave, editAble, message } = props
  const [mode, setMode] = useState('done')
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      width={'100%'}
      justifyContent={'flex-end'}
    >
      <CopyTooltipIconButton
        copyText={message.text}
        onCopy={() => {
          props.onCopy?.()
          if (TEMP_CLOSE_HOSTS.includes(window.location.host)) {
            setTimeout(hideChatBox, 1)
          }
        }}
      />
      {mode === 'done' && editAble && (
        <TooltipIconButton
          title={'edit'}
          onClick={() => {
            onEdit()
            setMode('edit')
          }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
        </TooltipIconButton>
      )}
      {mode === 'edit' && editAble && (
        <TooltipIconButton
          title={'save'}
          onClick={() => {
            onSave()
            setMode('done')
          }}
        >
          <DoneIcon sx={{ fontSize: 16 }} />
        </TooltipIconButton>
      )}
    </Stack>
  )
}
export default GmailChatBoxUserTools
