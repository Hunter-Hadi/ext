import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { PermissionWrapperCardType } from '@/features/auth/components/PermissionWrapper/types'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import usePaymentCreator from '@/features/pricing/hooks/usePaymentCreator'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

interface IProps {
  conversationId?: string
  permissionCard?: PermissionWrapperCardType | null
  sx?: SxProps
}

const PermissionPricingModalContent: FC<IProps> = (props) => {
  const { t } = useTranslation()
  const { conversationId, permissionCard, sx } = props

  const { loading, createPaymentSubscription } = usePaymentCreator()

  const ctaButtonClick = () => {
    if (!permissionCard?.sceneType || loading) return
    authEmitPricingHooksLog('click', permissionCard.sceneType, {
      conversationId,
      paywallType: 'MODAL',
    })
    createPaymentSubscription()
  }

  return (
    <Box
      flex={1}
      pt='42px'
      px='20px'
      pb='20px'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Box>
        <Typography fontSize={24} fontWeight={700}>
          {t('client:permission__pricing_modal__title')}
        </Typography>
        <Typography fontSize={16} mt={1.5}>
          {t('client:permission__pricing_modal__description')}
        </Typography>

        <Stack mt={2} spacing={1.5}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <CheckCircleOutlineIcon
              sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
            />
            <Typography fontSize={16}>
              {t('client:permission__pricing_modal__item1__title')}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1} alignItems='center'>
            <CheckCircleOutlineIcon
              sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
            />
            <Typography fontSize={16}>
              {t('client:permission__pricing_modal__item2__title')}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1} alignItems='center'>
            <CheckCircleOutlineIcon
              sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
            />
            <Typography fontSize={16}>
              {t('client:permission__pricing_modal__item3__title')}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box mt={1.5}>
        <Stack
          spacing={1}
          borderRadius={2}
          sx={{
            p: 2,
            bgcolor: 'rgba(250, 243, 255, 1)',
            color: 'rgba(0, 0, 0, 1)',
          }}
        >
          <Typography fontSize={16} fontWeight={500}>
            {t('client:permission__pricing_modal__price__title')}
          </Typography>

          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography
              fontSize={20}
              fontWeight={500}
              color='rgba(0, 0, 0, 0.6)'
              sx={{
                textDecoration: 'line-through',
              }}
            >
              $40
            </Typography>
            <Typography fontSize={32} fontWeight={700}>
              $19
            </Typography>
            <Typography fontSize={12} color='rgba(0, 0, 0, 0.6)'>
              {t('client:permission__pricing_modal__price__desc1')}
              <br />
              {t('client:permission__pricing_modal__price__desc2')}
            </Typography>
          </Stack>

          <Box position='relative'>
            <LoadingButton
              variant='contained'
              fullWidth
              startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
              sx={{
                fontSize: 16,
                px: 2,
                py: 1.5,
                borderRadius: 2,
              }}
              loading={loading}
              onClick={ctaButtonClick}
            >
              {t('client:permission__pricing_modal__cta_button__title')}
            </LoadingButton>
            <Box
              sx={{
                position: 'absolute',
                right: 10,
                top: 0,
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 126, 53, 1)',
                color: '#fff',
                borderRadius: 2,
                px: 1,
                py: 0.5,
              }}
            >
              <Typography fontSize={16} fontWeight={500} lineHeight={1}>
                {t('client:permission__pricing_modal__discount__title')}
              </Typography>
            </Box>
          </Box>

          <Stack direction='row' spacing={1} alignItems='center'>
            <Stack direction='row' spacing='-6px'>
              <img
                src={getChromeExtensionAssetsURL(
                  '/images/upgrade/avatars/1.png',
                )}
                width={20}
                height={20}
              />
              <img
                src={getChromeExtensionAssetsURL(
                  '/images/upgrade/avatars/2.png',
                )}
                width={20}
                height={20}
              />
              <img
                src={getChromeExtensionAssetsURL(
                  '/images/upgrade/avatars/3.png',
                )}
                width={20}
                height={20}
              />
            </Stack>
            <Typography fontSize={12}>
              {t('client:permission__pricing_modal__cta_button__footer__title')}
            </Typography>
          </Stack>
        </Stack>
        <Box mt={1} textAlign='center'>
          <Link
            fontSize={14}
            href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
            sx={{
              color: (t) =>
                t.palette.mode === 'dark' ? 'text.secondary' : '#fff',
            }}
            target='_blank'
          >
            {t('client:permission__pricing_modal__footer__title')}
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default PermissionPricingModalContent
