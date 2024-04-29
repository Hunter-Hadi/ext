import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { clientLogUserUsageInfo, IClientLogUserUsageInfoType } from '@/utils'

interface IProps {
  open: boolean
  type: IClientLogUserUsageInfoType
  onClose?(): void
  onConfirm?(): void
}

const SidebarInfoCollectionModal: FC<IProps> = (props) => {
  const { open, type, onClose, onConfirm } = props

  const { t } = useTranslation(['common', 'client'])

  const [content, setContent] = useState('')
  const [checked, setChecked] = useState(true)

  useEffect(() => {
    setContent('')
    setChecked(true)
  }, [open])

  const handleCancel = () => {
    clientLogUserUsageInfo({
      logType: type,
      inputContent: content,
      disableCollect: true,
    })
    onClose?.()
  }

  const handleConfirm = () => {
    clientLogUserUsageInfo({
      logType: type,
      inputContent: content,
      disableCollect: !checked,
    })
    onConfirm?.()
  }

  return (
    <Modal open={open} onClose={handleCancel}>
      <Container
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '4px',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3d3d3d' : '#fff'),
          maxWidth: '512px!important',
          width: '100%',
          p: 2,
        }}
      >
        <Stack spacing={1} mt={1}>
          <TextField
            label={t('common:input_content')}
            multiline
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <Stack direction="row" alignItems="center">
            <Checkbox
              sx={{ flexShrink: 0 }}
              checked={checked}
              onChange={(_, newChecked) => setChecked(newChecked)}
            />
            <Typography color="text.secondary">{t('client:sidebar__nav__concat_us__checkbox_title')}</Typography>
          </Stack>
          <Stack direction={'row'} spacing={1} justifyContent={'end'}>
            <Button variant={'outlined'} onClick={handleCancel}>
              {t('common:cancel')}
            </Button>
            <Button variant={'contained'} onClick={handleConfirm}>
              {t('common:confirm')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  )
}

export default SidebarInfoCollectionModal
