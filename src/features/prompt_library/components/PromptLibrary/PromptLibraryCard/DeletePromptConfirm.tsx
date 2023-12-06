import { LoadingButton } from '@mui/lab'
import { Button, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'

import CustomModal from '@/components/CustomModal'
import Paper from '@mui/material/Paper'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['prompt_library'])
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
      <Paper
        sx={{
          p: 2,
          height: 'max-content',
        }}
        elevation={0}
      >
        <Stack spacing={2}>
          <Typography>{t('prompt_library:delete_prompt__title')}</Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <LoadingButton
              loading={loading}
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onConfirm?.()
              }}
            >
              {t('prompt_library:delete_prompt__action__confirm__title')}
            </LoadingButton>
            <Button
              variant="contained"
              type="submit"
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onCancel?.()
              }}
            >
              {t('prompt_library:delete_prompt__cancel__confirm__title')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </CustomModal>
  )
}

export default DeletePromptConfirm