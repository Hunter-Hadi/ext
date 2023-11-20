import { LoadingButton } from '@mui/lab'
import { Button, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'

import CustomModal from '@/components/CustomModal'
import AppPaperCardLayout from '@/layouts/AppPaperCardLayout'

interface IProps {
  show: boolean
  loading: boolean
  promptTitle?: string
  onCancel?: () => void
  onConfirm?: () => void
}

const DeletePromptConfirm: FC<IProps> = ({
  show,
  loading,
  // promptTitle,
  onCancel,
  onConfirm,
}) => {
  return (
    <CustomModal
      show={show}
      width={400}
      bgTransparent
      onClose={onCancel}
      sx={{
        height: 'auto',
        my: '40vh',
      }}
    >
      <AppPaperCardLayout
        sx={{
          height: 'max-content',
          p: 2,
        }}
      >
        <Stack spacing={2}>
          <Typography>
            Are you sure you want to delete this prompt template?
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <LoadingButton
              loading={loading}
              variant="secondary"
              onClick={onConfirm}
            >
              Delete
            </LoadingButton>
            <Button variant="contained" type="submit" onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </AppPaperCardLayout>
    </CustomModal>
  )
}

export default DeletePromptConfirm
