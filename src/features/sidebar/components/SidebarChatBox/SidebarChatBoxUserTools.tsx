import React, { FC, useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import TooltipIconButton from '@/components/TooltipIconButton'
import EditIcon from '@mui/icons-material/Edit'
import DoneIcon from '@mui/icons-material/Done'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { hideChatBox } from '@/utils'
import { IUserChatMessage } from '@/features/chatgpt/types'
import { useTranslation } from 'react-i18next'

const TEMP_CLOSE_HOSTS = ['www.linkedin.com']

const SidebarChatBoxUserTools: FC<{
  message: IUserChatMessage
  editAble?: boolean
  onEdit: () => void
  onSave: () => void
  onCopy?: () => void
}> = (props) => {
  const { onEdit, onSave, editAble, message } = props
  const { t } = useTranslation(['common', 'client'])
  const [mode, setMode] = useState('done')
  const currentMessage = useMemo(() => {
    return message.extra.meta?.messageVisibleText || message.text
  }, [message])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      width={'100%'}
      justifyContent={'flex-end'}
    >
      <CopyTooltipIconButton
        copyText={currentMessage}
        onCopy={() => {
          props.onCopy?.()
          if (TEMP_CLOSE_HOSTS.includes(window.location.host)) {
            setTimeout(hideChatBox, 1)
          }
        }}
      />
      {mode === 'done' && editAble && (
        <TooltipIconButton
          title={t('common:edit')}
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
          title={t('common:save')}
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
export default SidebarChatBoxUserTools
