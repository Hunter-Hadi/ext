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
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { PAYWALL_MODAL_VARIANT } from '@/features/abTester/constants'
import useUserABTestInfo from '@/features/abTester/hooks/useUserABTestInfo'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import PlanFeatures from '@/features/pricing/components/PlanFeatures'
import { getMaxAISidebarRootElement } from '@/utils'

const UserUpgradeButton: FC<{ sx?: SxProps }> = ({ sx }) => {
  const { isFreeUser } = useUserInfo()
  const { t } = useTranslation(['client'])
  const { currentConversationId, currentSidebarConversationType } =
    useClientConversation()
  const { abTestInfo } = useUserABTestInfo()
  const { paywallVariant } = abTestInfo

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const href = `${APP_USE_CHAT_GPT_HOST}/pricing`

  const upgradeButtonLoading = false

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

  const onUpgradeClick = () => {
    authEmitPricingHooksLog('click', 'PROACTIVE_UPGRADE', {
      conversationId: currentConversationId,
      conversationType: currentSidebarConversationType,
      paywallType: 'PROACTIVE',
      // 目前只有PAYWALL_MODAL_VARIANT才会显示upgrade按钮
      // 这里记录死防止出现因为网络问题记录错误的值，因为authEmitPricingHooksLog有1s的防抖延迟
      paywallVariant: PAYWALL_MODAL_VARIANT,
      buttonType: 'stripe',
    })
  }

  const onPricingClick = () => {
    authEmitPricingHooksLog('click', 'PROACTIVE_UPGRADE', {
      conversationId: currentConversationId,
      conversationType: currentSidebarConversationType,
      paywallType: 'PROACTIVE',
      buttonType: 'pricing',
    })
    handlePopoverClose()
    window.open(href)
  }

  if (!isFreeUser) return null

  const content =
    paywallVariant === PAYWALL_MODAL_VARIANT ? (
      <Stack>
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
            target='_blank'
            onClick={onPricingClick}
            sx={{ cursor: 'pointer' }}
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
          onClick={onPricingClick}
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
            loading={upgradeButtonLoading}
            onClick={onPricingClick}
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
        onClick={onPricingClick}
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
                  width:
                    paywallVariant === PAYWALL_MODAL_VARIANT ? 700 : 'auto',
                  minWidth:
                    paywallVariant === PAYWALL_MODAL_VARIANT ? 700 : 300,
                  maxWidth:
                    paywallVariant === PAYWALL_MODAL_VARIANT ? '90vw' : 400,
                  maxHeight:
                    paywallVariant === PAYWALL_MODAL_VARIANT ? '70vh' : 'auto',
                  overflow: 'auto',
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
