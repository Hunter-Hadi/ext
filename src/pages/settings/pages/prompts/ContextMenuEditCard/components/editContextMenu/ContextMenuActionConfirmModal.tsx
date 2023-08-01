import React, { FC, useMemo } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { useTranslation } from 'react-i18next'

export type IConfirmActionType = 'reset' | 'delete'

interface IProps {
  open: boolean
  onClose?(): void
  onConfirm?(type: IConfirmActionType): void
  nodeType?: IContextMenuItem['data']['type']
  actionType?: IConfirmActionType
}

const ContextMenuActionConfirmModal: FC<IProps> = ({
  open,
  nodeType = 'shortcuts',
  actionType = 'reset',
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
    // default reset type
    return t('settings:feature_card__prompts__confirm__restore__description')
  }, [actionType, nodeType, t])

  const buttonText = useMemo(() => {
    if (actionType === 'delete') {
      return t(
        'settings:feature_card__prompts__confirm__delete__confirm_button_text',
      )
    }

    // default reset type
    return t(
      'settings:feature_card__prompts__confirm__restore__confirm_button_text',
    )
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
            {t('common:cancel')}
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

export default ContextMenuActionConfirmModal
