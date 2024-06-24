import CloseIcon from '@mui/icons-material/Close'
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
import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { PricingModalState } from '@/features/auth/store'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import PlanFeatures from '@/features/pricing/components/PlanFeatures'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

interface IProps {}

const PermissionPricingModal: FC<IProps> = () => {
  const { t } = useTranslation()

  const [pricingModalState, setPricingModalState] =
    useRecoilState(PricingModalState)

  /**
   * 因为目前Paywall modal放在全局弹窗的react节点下，这里先这么处理，否则底下的组件无法正确获取userInfo
   */
  useInitUserInfo(true)
  const { currentUserPlan } = useUserInfo()

  const { show, conversationId, permissionSceneType } = pricingModalState

  useEffect(() => {
    const listener = (event: any) => {
      if (event.data?.event === 'MAX_AI_PRICING_MODAL') {
        const { data } = event.data
        // 记录mixpanel防止和response pricing触发防抖冲突
        authEmitPricingHooksLog.flush()
        authEmitPricingHooksLog('show', data.permissionSceneType, {
          conversationId: data.conversationId,
          paywallType: 'MODAL',
        })
        authEmitPricingHooksLog.flush()
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
    if (!show) return
    // 升级到elite需要隐藏
    if (currentUserPlan.name === 'elite') {
      setPricingModalState({ show: false })
    }
  }, [show, currentUserPlan.name])

  const permissionCard = usePermissionCard(permissionSceneType || '')

  const handleClose = (event: any) => {
    event?.stopPropagation()
    setPricingModalState({ show: false })
  }

  const onUpgradeClick = (plan: RENDER_PLAN_TYPE) => {
    if (!permissionSceneType) return
    authEmitPricingHooksLog('click', permissionSceneType, {
      conversationId,
      paywallType: 'MODAL',
      buttonType: 'stripe',
    })
  }

  const onPricingClick = () => {
    if (!permissionSceneType) return
    authEmitPricingHooksLog('click', permissionSceneType, {
      conversationId,
      paywallType: 'MODAL',
      buttonType: 'pricing',
    })
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
          maxWidth: '1200px',
          maxHeight: '90vh',
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

        <Box
          width='33.3%'
          maxWidth='400px'
          display='flex'
          flexDirection='column'
        >
          <Box
            width='100%'
            height='400px'
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
          mt='42px'
          px='20px'
          pb='20px'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
          }}
        >
          <Typography fontSize={32} fontWeight={700} textAlign='center'>
            {t('client:permission__pricing_modal__title')}
          </Typography>
          <Typography fontSize={16} textAlign='center' mt={1.5}>
            {t('client:permission__pricing_modal__description')}
          </Typography>

          <PlanFeatures sx={{ mt: 3 }} onUpgradeClick={onUpgradeClick} />

          <Box mt={2} textAlign='center'>
            <Link
              fontSize={16}
              color='text.secondary'
              href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
              onClick={onPricingClick}
              target='_blank'
            >
              {t('client:permission__pricing_modal__footer__title')}
            </Link>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default PermissionPricingModal
