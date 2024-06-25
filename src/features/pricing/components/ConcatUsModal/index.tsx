import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Modal, { ModalProps } from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import CopyTypography from '@/components/CopyTypography'
import { APP_EMAIL } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'

interface ConcatUsModalProps extends Omit<ModalProps, 'children'> {
  planName?: string
}

const ConcatUsModal: FC<ConcatUsModalProps> = (props) => {
  const { planName, sx, ...rest } = props

  const { t } = useTranslation(['common', 'client'])

  const { userInfo } = useUserInfo()

  const emailMailto = `mailto:${APP_EMAIL}?subject=${
    userInfo?.email
  } is interested in upgrading to MaxAI ${planName}&body=${`Hi MaxAI team,
<br/><br/>
I am currently a MaxAI Pro member (paid via AliPay/WeChat), and I would like to upgrade to MaxAI ${planName}.
<br/><br/>
Thanks!
`.replace(/<br\s*\/?>/gm, '%0D%0A')}`

  return (
    <Modal {...rest}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          p: 4,
          ...sx,
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton onClick={() => rest.onClose?.({}, 'escapeKeyDown')}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack spacing={1}>
          {/* title */}
          <Typography mt={2} fontSize={20} fontWeight={700} textAlign='center'>
            {t('client:contact_us_modal__title', { PLAN: planName })}
          </Typography>

          {/* content */}
          <Typography mt={1} fontSize={18} textAlign='center'>
            {t('client:contact_us_modal__desc')}{' '}
            <Link
              href={emailMailto}
              sx={{ color: 'inherit' }}
              target={'_blank'}
              underline='always'
            >
              {APP_EMAIL}
            </Link>{' '}
            <CopyTypography
              text={APP_EMAIL}
              sx={{
                p: 0,
                minWidth: 20,
                display: 'inline-block',
                color: 'rgba(0, 0, 0, 0.38)',
              }}
            />{' '}
            .
          </Typography>

          {/* footer btn */}
          <Stack
            className='global-confirm-footer-btn'
            direction={'row'}
            justifyContent='flex-end'
            spacing={1.5}
            pt={2}
          >
            <Link
              href={emailMailto}
              sx={{ color: 'inherit', width: '100%' }}
              target={'_blank'}
              underline='always'
            >
              <Button
                variant='contained'
                sx={{
                  width: '100%',
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {t('common:contact_us')}
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  )
}

export default ConcatUsModal
