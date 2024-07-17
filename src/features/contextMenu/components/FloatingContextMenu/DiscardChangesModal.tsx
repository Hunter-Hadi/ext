import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import CustomModal from '@/features/common/components/CustomModal'

interface IDiscardChangesModal {
  type: 'AI_RESPONSE' | 'USER_DRAFT'
  open: boolean
  onClose: (reason: 'cancel' | 'discard') => void
  sx?: SxProps
}

const DiscardChangesModal: FC<IDiscardChangesModal> = (props) => {
  const { open, onClose, sx, type } = props
  const { t } = useTranslation(['client', 'common'])
  const discardChangesModalRef = useRef<HTMLDivElement | null>(null)
  const [selectedButton, setSelectedButton] = useState<'cancel' | 'discard'>(
    'discard',
  )

  useEffect(() => {
    setSelectedButton('discard')
    if (open) {
      setTimeout(() => {
        discardChangesModalRef.current?.focus()
      }, 100)
    }
  }, [open])

  return (
    <CustomModal
      show={open}
      onClose={() => {
        onClose('cancel')
      }}
      width={'288px'}
      height={'auto'}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        my: 0,
        boxShadow: 'none',
        borderRadius: 2,
        zIndex: 100,
        p: 4,
        ...sx,
      }}
    >
      <Stack
        component={'div'}
        ref={discardChangesModalRef}
        tabIndex={-1}
        width={'100%'}
        height={'100%'}
        justifyContent='center'
        sx={{
          height: 'auto',
          outline: 'none',
        }}
        alignItems={'center'}
        onKeyDownCapture={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (e.key === 'Escape') {
            onClose('cancel')
          }
          // 方向键
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            setSelectedButton((prev) =>
              prev === 'cancel' ? 'discard' : 'cancel',
            )
          }
          // enter
          if (e.key === 'Enter') {
            onClose(selectedButton)
          }
        }}
      >
        <UseChatGptIcon
          sx={{
            fontSize: '24px',
            color: 'primary.main',
          }}
        />
        <Typography
          my={1}
          fontSize={'16px'}
          fontWeight={500}
          textAlign={'center'}
          color={'text.primary'}
          lineHeight={'20px'}
        >
          {type === 'AI_RESPONSE' &&
            t('client:floating_menu__discard_changes_card__ai_response__title')}
          {type === 'USER_DRAFT' &&
            t('client:floating_menu__discard_changes_card__your_draft__title')}
        </Typography>
        <Stack
          width={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
          mt={2}
          spacing={1}
        >
          <Button
            variant={selectedButton === 'discard' ? 'contained' : 'outlined'}
            fullWidth
            sx={{
              height: '40px',
            }}
            onMouseEnter={() => setSelectedButton('discard')}
            onClick={() => onClose('discard')}
          >
            {t('common:discard')}
          </Button>
          <Button
            variant={selectedButton === 'cancel' ? 'contained' : 'outlined'}
            fullWidth
            sx={{
              height: '40px',
            }}
            onMouseEnter={() => setSelectedButton('cancel')}
            onClick={() => onClose('cancel')}
          >
            {t('common:cancel')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  )
}

export default DiscardChangesModal
