import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { usePermissionCard } from '@/features/auth'
import { PricingModalState } from '@/features/auth/store'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import usePaymentCreator from '@/features/pricing/hooks/usePaymentCreator'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

interface IProps {}

const PermissionPricingModal: FC<IProps> = () => {
  const { t } = useTranslation()

  const [pricingModalState, setPricingModalState] =
    useRecoilState(PricingModalState)

  const { loading, createPaymentSubscription } = usePaymentCreator()

  const { show, conversationId, permissionSceneType } = pricingModalState

  useEffect(() => {
    const listener = (event: any) => {
      if (event.data?.event === 'MAX_AI_PRICING_MODAL') {
        const { data } = event.data
        setPricingModalState({
          show: true,
          ...data,
        })
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])

  useEffect(() => {
    if (show && permissionSceneType) {
      // 记录mixpanel防止和response pricing触发防抖冲突
      // 目前只有paywallVariant为2-2会触发当前modal的显示
      setTimeout(() => {
        authEmitPricingHooksLog('show', permissionSceneType, {
          conversationId,
          paywallType: 'MODAL',
          // 这里固定写法是因为如果这段时间内用户登录成功被分配到2-1可能会记录错误
          paywallVariant: '2-2',
        })
      }, 1500)
    }
  }, [show, permissionSceneType])

  const permissionCard = usePermissionCard(permissionSceneType || '')

  const handleClose = (event: any) => {
    event?.stopPropagation()
    setPricingModalState({ show: false })
  }

  const ctaButtonClick = () => {
    if (!permissionSceneType || loading) return
    authEmitPricingHooksLog('click', permissionSceneType, {
      conversationId,
      paywallType: 'MODAL',
    })
    createPaymentSubscription()
  }

  const description =
    permissionCard?.modalDescription || permissionCard?.description

  return (
    <Modal
      open={show}
      onClose={handleClose}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        id='MAX_AI_PRICING_MODAL'
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          maxWidth: '880px',
          bgcolor: 'background.paper',
          width: '100%',
          display: 'flex',
          color: 'black',
          overflow: 'hidden',
          '&:focus': {
            border: 'none',
            outline: 'none',
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          sx={{
            position: 'absolute',
            right: 6,
            top: 6,
          }}
          onClick={handleClose}
        >
          <CloseIcon sx={{ fontSize: '24px' }} />
        </IconButton>

        <Box width='50%' display='flex' flexDirection='column'>
          <Box
            width='100%'
            height='392px'
            sx={{
              backgroundImage: `url(${permissionCard?.modalImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <Stack
            flex={1}
            spacing={2}
            py={2}
            px={3}
            sx={{
              minHeight: '180px',
              bgcolor: 'rgba(244, 244, 244, 1)',
            }}
          >
            {typeof description !== 'string' ? (
              description
            ) : (
              <Typography
                fontSize={16}
                sx={{
                  whiteSpace: 'pre-wrap',
                }}
              >
                {description}
              </Typography>
            )}
          </Stack>
        </Box>

        <Box
          flex={1}
          pt='42px'
          px='20px'
          pb='20px'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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

          <Box>
            <Stack
              spacing={1}
              borderRadius={2}
              sx={{
                p: 2,
                bgcolor: 'rgba(250, 243, 255, 1)',
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
                  {t(
                    'client:permission__pricing_modal__cta_button__footer__title',
                  )}
                </Typography>
              </Stack>
            </Stack>
            <Box mt={1} textAlign='center'>
              <Link
                fontSize={14}
                color='text.secondary'
                href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
                target='_blank'
              >
                {t('client:permission__pricing_modal__footer__title')}
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default PermissionPricingModal
