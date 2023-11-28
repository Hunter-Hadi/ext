import React, { FC } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'

export type IConfirmActionType = 'restore' | 'delete' | 'deleteAll'

interface IProps {
  open: boolean
  confirmText: React.ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  onClose?(): void
  onConfirm?(): void
  children?: React.ReactNode
}

const CustomConfirm: FC<IProps> = ({
  open,
  confirmText,
  confirmButtonText,
  cancelButtonText,
  onClose,
  onConfirm,
  children,
}) => {
  const { t } = useTranslation(['settings', 'common'])

  const handleConfirm = () => {
    onConfirm && onConfirm()
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
        {children ? children : <Typography>{confirmText}</Typography>}
        <Stack direction={'row-reverse'} gap={1} mt={2}>
          <Button variant="contained" onClick={onClose}>
            {cancelButtonText ?? t('common:cancel')}
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
            {confirmButtonText ?? t('common:confirm')}
          </Button>
        </Stack>
      </Paper>
    </Modal>
  )
}

export default CustomConfirm
