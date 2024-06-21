import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grow from '@mui/material/Grow'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import useUserABTestInfo from '@/features/abTester/hooks/useUserABTestInfo'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import PlanButton from '@/features/pricing/components/PlanButton'
import { PROMOTION_CODE_MAP } from '@/features/pricing/constants'
import usePaymentCreator from '@/features/pricing/hooks/usePaymentCreator'
import usePrefetchStripeLinks from '@/features/pricing/hooks/usePrefetchStripeLinks'
import { getMaxAISidebarRootElement } from '@/utils'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const UserUpgradeButton: FC<{ sx?: SxProps }> = ({ sx }) => {
  const { isFreeUser } = useUserInfo()
  const { t } = useTranslation(['client'])
  const {
    currentConversationId,
    currentSidebarConversationType,
  } = useClientConversation()
  const { abTestInfo } = useUserABTestInfo()
  const { loading, createPaymentSubscription } = usePaymentCreator()
  const { paywallVariant } = abTestInfo

  const [isClicked, setIsClicked] = React.useState(false)
  const isClickedRef = React.useRef(false)

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const href = `${APP_USE_CHAT_GPT_HOST}/pricing`

  const { getStripeLink, prefetching } = usePrefetchStripeLinks()

  const prefetchEnabled = paywallVariant === '2-2'

  const upgradeButtonLoading = useMemo(() => {
    if (prefetchEnabled) {
      // 当开启了 prefetchEnabled 时, button Loading 状态不跟着 fetch checkout loading 走
      // 当点击了按钮后才跟着 fetch checkout loading 走
      if (isClicked) {
        return loading || prefetching
      } else {
        return false
      }
    } else {
      return loading
    }
  }, [prefetchEnabled, isClicked, loading, prefetching])

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    authEmitPricingHooksLog('show', 'PROACTIVE_UPGRADE', {
      conversationId: currentConversationId,
      conversationType: currentSidebarConversationType,
      paywallType: 'PROACTIVE',
    })
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const sendLog = () => {
    authEmitPricingHooksLog('click', 'PROACTIVE_UPGRADE', {
      conversationId: currentConversationId,
      conversationType: currentSidebarConversationType,
      paywallType: 'PROACTIVE',
    })
  }

  const handleClick = async () => {
    setIsClicked(true)
    sendLog()
    if (prefetchEnabled) {
      if (prefetching) {
        return
      }

      const targetPlan = 'elite_yearly'
      const promotionCode = PROMOTION_CODE_MAP[targetPlan]
      const cacheStripeLink = await getStripeLink(
        targetPlan,
        promotionCode ? promotionCode : undefined,
      )

      if (cacheStripeLink) {
        window.open(cacheStripeLink)
      } else {
        await createPaymentSubscription(targetPlan)
      }
      handlePopoverClose()
    } else {
      handlePopoverClose()
      window.open(href)
    }
    setIsClicked(false)
  }

  useEffect(() => {
    isClickedRef.current = isClicked
  }, [isClicked])

  useEffect(() => {
    // 作用在，当组件还在 prefetching 时，用户点击了按钮
    // 会把 isClickedRef.current 设置成 true，
    // 等 prefetching 结束后，再执行 handleClick
    if (prefetchEnabled && isClickedRef.current && prefetching === false) {
      setTimeout(handleClick, 0)
    }
  }, [prefetchEnabled, prefetching])

  if (!isFreeUser) return null

  const content =
    paywallVariant === '2-2' ? (
      <Stack spacing={2}>
        <Typography fontSize={18} fontWeight={600}>
          {t('client:permission__pricing_modal__title')}
        </Typography>
        <Typography fontSize={16} mt={1}>
          {t('client:permission__pricing_modal__description')}
        </Typography>

        <Divider />

        <Stack direction='row' spacing={1} alignItems='center'>
          <CheckCircleOutlineIcon
            sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 20 }}
          />
          <Typography fontSize={16}>
            {t('client:permission__pricing_modal__item1__title')}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} alignItems='center'>
          <CheckCircleOutlineIcon
            sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 20 }}
          />
          <Typography fontSize={16}>
            {t('client:permission__pricing_modal__item2__title')}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} alignItems='center'>
          <CheckCircleOutlineIcon
            sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 20 }}
          />
          <Typography fontSize={16}>
            {t('client:permission__pricing_modal__item3__title')}
          </Typography>
        </Stack>
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
            <Typography fontSize={32} fontWeight={700} color='rgb(0, 0, 0)'>
              $19
            </Typography>
            <Typography fontSize={12} color='rgba(0, 0, 0, 0.6)'>
              {t('client:permission__pricing_modal__price__desc1')}
              <br />
              {t('client:permission__pricing_modal__price__desc2')}
            </Typography>
          </Stack>

          <Box position='relative'>
            {paywallVariant === '2-2' ? (
              <PlanButton
                renderType='elite_yearly'
                fullWidth
                startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
                sx={{
                  fontSize: 16,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                }}
                sendLog={sendLog}
                // prefetch
              >
                {t('client:permission__pricing_modal__cta_button__title')}
              </PlanButton>
            ) : (
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
                onClick={handleClick}
              >
                {t('client:permission__pricing_modal__cta_button__title')}
              </LoadingButton>
            )}

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
            color='text.secondary'
            href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
            target='_blank'
          >
            {t('client:permission__pricing_modal__footer__title')}
          </Link>
        </Box>
      </Stack>
    ) : (
      <Stack spacing={2}>
        <Typography fontSize={18} fontWeight={600}>
          {t('client:sidebar__user_upgrade_card__title')}
        </Typography>

        <Divider />

        <Stack direction='row' spacing={1} alignItems='center'>
          <CheckCircleOutlineIcon
            sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 20 }}
          />
          <Typography fontSize={16}>
            {t('client:sidebar__user_upgrade_card__item1__title')}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} alignItems='center'>
          <CheckCircleOutlineIcon
            sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 20 }}
          />
          <Typography fontSize={16}>
            {t('client:sidebar__user_upgrade_card__item2__title')}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} alignItems='center'>
          <CheckCircleOutlineIcon
            sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 20 }}
          />
          <Typography fontSize={16}>
            {t('client:sidebar__user_upgrade_card__item3__title')}
          </Typography>
        </Stack>

        <Link
          color='primary.main'
          target='_blank'
          underline='none'
          onClick={handleClick}
          sx={{ cursor: 'pointer', fontSize: 16 }}
        >
          {t('client:sidebar__user_upgrade_card__learn_more__title')}
        </Link>

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
            onClick={handleClick}
          >
            {t('client:sidebar__top_bar__upgrade__title')}
          </LoadingButton>
          <Typography
            fontSize={12}
            mt={0.5}
            color='text.secondary'
            textAlign='center'
          >
            {t('client:sidebar__user_upgrade_card__footer__title')}
          </Typography>
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
              {t('client:sidebar__user_upgrade_card__discount__title')}
            </Typography>
          </Box>
        </Box>
      </Stack>
    )

  return (
    <LoginLayout>
      <LoadingButton
        sx={{
          borderRadius: 2,
          p: 0.5,
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(178, 115, 255, 0.16)'
              : 'rgba(118, 1, 211, 0.08)',
          '&:hover': {
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(178, 115, 255, 0.24)'
                : 'rgba(118, 1, 211, 0.12)',
          },
          ...sx,
        }}
        loading={upgradeButtonLoading}
        onClick={handleClick}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <Typography
          mx={0.5}
          fontSize={14}
          fontWeight={700}
          lineHeight={1.4}
          color='text.primary'
          sx={{
            userSelect: 'none',
            opacity: upgradeButtonLoading ? 0 : 1,
          }}
        >
          {/*{t('client:sidebar__top_bar__upgrade__title')}*/}
          Upgrade
        </Typography>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement='top'
          container={getMaxAISidebarRootElement()}
          onClick={(event) => {
            event.stopPropagation()
          }}
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: 'center bottom',
              }}
            >
              <Paper
                sx={{
                  borderRadius: 2.5,
                  border: '1px solid #EBEBEB',
                  boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
                  minWidth: 300,
                  maxWidth: 400,
                  p: 2,
                  mb: 1,
                }}
              >
                {content}
              </Paper>
            </Grow>
          )}
        </Popper>
      </LoadingButton>
    </LoginLayout>
  )
}
export default UserUpgradeButton
