import React, { FC, useState } from 'react'
import { Stack } from '@mui/material'
import TooltipIconButton from '@/components/TooltipIconButton'
import EditIcon from '@mui/icons-material/Edit'
import DoneIcon from '@mui/icons-material/Done'

const GmailChatBoxUserTools: FC<{
  editAble?: boolean
  onEdit: () => void
  onSave: () => void
}> = (props) => {
  const { onEdit, onSave, editAble } = props
  const [mode, setMode] = useState('done')
  return (
    <Stack direction={'row'} alignItems={'center'}>
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
