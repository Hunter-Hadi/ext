import React, { FC, useMemo } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { Paper, Stack } from '@mui/material'
import { IContextMenuItem } from '@/features/contextMenu'

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
  const confirmText = useMemo(() => {
    if (actionType === 'delete') {
      return `Are you sure you want to delete this ${
        nodeType === 'shortcuts' ? 'option' : 'group'
      }? Please note that once you delete it, the action cannot be undone.`
    }

    // default reset type
    return `Are you sure you want to reset to the default options? Please note that once you restore to defaults, the action cannot be undone.`
  }, [actionType])

  const buttonText = useMemo(() => {
    if (actionType === 'delete') {
      return `Yes, delete`
    }

    // default reset type
    return `Yes, restore defaults`
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
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#4f4f4f' : '#f5f5f5',
              color: (t) => (t.palette.mode === 'dark' ? '#f5f5f5' : '#626262'),
              ':hover': {
                bgcolor: '#666',
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
