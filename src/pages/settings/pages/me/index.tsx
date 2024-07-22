import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem, { listItemClasses } from '@mui/material/ListItem'
import { listItemButtonClasses } from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import UserQuotaUsageQueriesCard from '@/features/auth/components/UserQuotaUsageQueriesCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import UpgradePlanSalesCard from '@/features/pricing/components/UpgradePlanSalesCard'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
const SettingsMePage: FC = () => {
  const { t } = useTranslation(['common', 'settings'])
  const {
    syncUserSubscriptionInfo,
    userInfo,
    isPayingUser,
    isPaymentOneTimeUser,
    isTopPlanUser,
  } = useUserInfo()
  useEffectOnce(() => {
    syncUserSubscriptionInfo().then().catch()
  })
  usePlanPricingInfo(true)
  return (
    <Stack>
      <SettingsFeatureCardLayout
        title={t('settings:feature_card__me__title')}
        id={'user-info'}
      >
        <Stack spacing={2}>
          <List
            component={'nav'}
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#2C2C2C' : '#FFFFFF',
              p: '0 !important',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              '& > * + .MuiListItem-root': {
                borderTop: '1px solid',
                borderColor: 'customColor.borderColor',
              },

              [`& .${listItemClasses.root}, & .${listItemButtonClasses.root}`]:
                {
                  px: 3,
                  py: 2,
                },
            }}
          >
            <ListItem>
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Avatar
                  sx={{ width: 40, height: 40, textTransform: 'capitalize' }}
                >
                  {userInfo?.email?.[0] || 'M'}
                </Avatar>
              </ListItemIcon>
              <ListItemText primary={userInfo?.email || ''} />
              <Button
                component={'a'}
                target={'_blank'}
                href={`${APP_USE_CHAT_GPT_HOST}/logout`}
                sx={{
                  borderColor: 'customColor.borderColor',
                  color: 'text.primary',
                }}
                variant={'outlined'}
              >
                {t('common:log_out')}
              </Button>
            </ListItem>
            {/* <Divider />
            <ListItemButton
              component={'a'}
              target={'_blank'}
              href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
            >
              <ListItemText primary={t('settings:feature_card__me__my_plan')} />
              <ChevronRightOutlinedIcon
                sx={{
                  fontSize: '24px',
                }}
              />
            </ListItemButton> */}
          </List>

          {isPayingUser && !isPaymentOneTimeUser && !isTopPlanUser ? (
            <UpgradePlanSalesCard renderPlan='elite_yearly' />
          ) : null}
        </Stack>
      </SettingsFeatureCardLayout>
      <SettingsFeatureCardLayout title={null} id='user-usage-queries'>
        <Stack spacing={2}>
          <UserQuotaUsageQueriesCard />
          <StripeLinks />
        </Stack>
      </SettingsFeatureCardLayout>
    </Stack>
  )
}

export default SettingsMePage

const StripeLinks = () => {
  const { t } = useTranslation()
  const { isFreeUser, isPaymentOneTimeUser, isTeamPlanUser } = useUserInfo()

  const handleManageClick = async () => {
    window.open(`${APP_USE_CHAT_GPT_HOST}/my-plan`, '_blank')
  }

  if (isTeamPlanUser || isPaymentOneTimeUser || isFreeUser) {
    return null
  }

  return (
    <Stack
      direction='row'
      alignItems='center'
      sx={{
        width: 'max-content',
        gap: 1,
        cursor: 'pointer',
        // cursor: loading ? 'wait' : 'pointer',
      }}
    >
      <Typography
        variant='custom'
        sx={{
          fontSize: 16,
          lineHeight: 1.5,
          textDecorationLine: 'underline',
          color: 'text.primary',
        }}
        onClick={handleManageClick}
      >
        {t('common:manage_my_plan')}
      </Typography>
      {/* {loading && <CircularProgress size='sm' sx={{ width: 16 }} />} */}
    </Stack>
  )
}
