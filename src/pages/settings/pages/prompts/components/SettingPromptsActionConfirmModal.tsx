import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IContextMenuItem } from '@/features/contextMenu/types'

export type IConfirmActionType = 'cancel' | 'restore' | 'delete' | 'deleteAll'

const SettingPromptsActionConfirmModal: FC<{
  open: boolean
  onClose?(): void
  onConfirm?(type: IConfirmActionType): void
  nodeType?: IContextMenuItem['data']['type']
  actionType?: IConfirmActionType
}> = ({
  open,
  nodeType = 'shortcuts',
  actionType = 'delete',
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation(['settings', 'common'])
  const confirmText = useMemo(() => {
    if (actionType === 'delete') {
      return nodeType === 'shortcuts'
        ? t(
            'settings:feature_card__prompts__confirm__delete__prompt__description',
          )
        : t(
            'settings:feature_card__prompts__confirm__delete__prompt_group__description',
          )
    }
    if (actionType === 'deleteAll') {
      return t(
        'settings:feature_card__prompts__confirm__delete_all__description',
      )
    }
    if (actionType === 'cancel') {
      return t('settings:feature_card__prompts__confirm__cancel__description')
    }
    // restore type
    return t('settings:feature_card__prompts__confirm__restore__description')
  }, [actionType, nodeType, t])

  const buttonText = useMemo(() => {
    if (actionType === 'delete' || actionType === 'deleteAll') {
      return t(
        'settings:feature_card__prompts__confirm__delete__confirm_button_text',
      )
    }
    if (actionType === 'cancel') {
      return t(
        'settings:feature_card__prompts__confirm__cancel__confirm_button_text',
      )
    }
    // restore type
    return t(
      'settings:feature_card__prompts__confirm__restore__confirm_button_text',
    )
  }, [actionType])

  const cancelText = useMemo(() => {
    if (actionType === 'cancel') {
      return t(
        'settings:feature_card__prompts__confirm__cancel__cancel_button_text',
      )
    }
    return t('common:cancel')
  }, [actionType])

  const handleConfirm = () => {
    onConfirm && onConfirm(actionType)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          bgcolor: 'background.paper',
          boxShadow: ' 0px 4px 16px rgba(0, 0, 0, 0.08);',
          p: 2,
        }}
      >
        <Typography>{confirmText}</Typography>
        <Stack direction={'row-reverse'} gap={1} mt={2}>
          <Button variant="contained" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#4f4f4f' : '#f5f5f5',
              color: (t) => (t.palette.mode === 'dark' ? '#f5f5f5' : '#626262'),
              ':hover': {
                bgcolor: '#666',
                color: '#fff',
              },
            }}
            onClick={handleConfirm}
          >
            {buttonText}
          </Button>
        </Stack>
      </Paper>
    </Modal>
  )
}

export default SettingPromptsActionConfirmModal
