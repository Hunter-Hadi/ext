import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem, { listItemClasses } from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import startCase from 'lodash-es/startCase'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import PayingUserUpgradePopper from '@/features/pricing/components/PayingUserUpgradePopper'

import FastAIUsageQueriesItem from './FastAIUsageQueriesItem'
import ImageAIUsageQueriesItem from './ImageAIUsageQueriesItem'
import SmartAIUsageQueriesItem from './SmartAIUsageQueriesItem'

// 大于等于 100000 表示无限，前端不用显示具体的数; 这个值是后端定的
export const IS_UNLIMITED_FLAG = 100000

// 用户 quota 使用量 卡片
const UserQuotaUsageQueriesCard = () => {
  const { t } = useTranslation()
  const {
    loading: userInfoLoading,
    userQuotaUsage,
    currentUserPlan,
    isTeamPlanUser,
    syncUserQuotaUsageInfo,
    syncUserInfo,
    isPayingUser,
    isFreeUser,
    subscriptionType,
  } = useUserInfo()

  // 只在第一次加载时, 同步用户的 quota 使用量信息
  useEffectOnce(() => {
    syncUserQuotaUsageInfo()
  })

  const loading = useMemo(() => {
    // return true
    return userInfoLoading || userQuotaUsage.loading
  }, [userInfoLoading, userQuotaUsage.loading])

  const shownPlanText = useMemo(() => {
    let text = startCase(currentUserPlan.name)

    if (subscriptionType) {
      if (subscriptionType === 'oneTimePayment') {
        // do nothing`;
      } else {
        text += ` · ${
          subscriptionType === 'monthly'
            ? t('common:monthly')
            : t('common:yearly')
        }`
      }
    }

    return text
  }, [currentUserPlan.name, subscriptionType, t])

  return (
    <Box>
      <List
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#2C2C2C' : '#FFFFFF',
          p: '0 !important',
          borderRadius: '8px',
          border: (t) =>
            t.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
          [`& .${listItemClasses.root}`]: {
            px: 3,
            py: 1,
          },
        }}
      >
        <ListItem
          sx={{
            py: '16px !important',
          }}
        >
          <ListItemText
            primary={
              <Stack direction={'row'} alignItems='center' spacing={1}>
                <Typography fontSize={16} lineHeight={1.5}>
                  {t('quota_usage_card:role_label', {
                    ROLE: shownPlanText,
                  })}{' '}
                  {isTeamPlanUser ? `(${t('common:team_plan')})` : ''}
                </Typography>
                <IconButton
                  size='small'
                  sx={{
                    p: '4px',
                    color: 'primary.main',
                  }}
                  onClick={() => {
                    syncUserInfo(true)
                    syncUserQuotaUsageInfo()
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshOutlinedIcon
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  )}
                </IconButton>
              </Stack>
            }
          />
          {isFreeUser ? (
            <PayingUserUpgradePopper
              renderPlan='elite_yearly'
              sx={{
                width: 'unset',
                px: 0,
              }}
              placement='bottom-end'
            >
              <Button
                variant='contained'
                fullWidth
                startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
                sx={{
                  fontSize: 16,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: 200,
                }}
              >
                {t('client:permission__pricing_hook__button__upgrade_now')}
              </Button>
            </PayingUserUpgradePopper>
          ) : null}
        </ListItem>
        {
          // 免费用户不需要显示下面的 quota 使用量
          isPayingUser ? (
            <>
              <Divider />
              <ListItem
                sx={{
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? '#FFFFFF14' : '#0000000A',
                  color: 'text.secondary',
                }}
              >
                <ListItemText primary={t('quota_usage_card:queries')} />

                {userQuotaUsage.nextRefreshTime ? (
                  <ListItemText
                    sx={{
                      textAlign: 'right',
                    }}
                    primary={
                      <TextOnlyTooltip
                        placement={'top'}
                        title={dayjs
                          .utc(userQuotaUsage.nextRefreshTime)
                          .local()
                          .format('YYYY-MM-DD HH:mm:ss')}
                      >
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={1}
                          ml='auto'
                          justifyContent={'flex-end'}
                          width='max-content'
                        >
                          {/* {loading ? <CircularProgress size={16} /> : null} */}
                          <Typography fontSize={14} lineHeight={1.5}>
                            {t('quota_usage_card:reset_on_date', {
                              DATE: dayjs
                                .utc(userQuotaUsage.nextRefreshTime)
                                .local()
                                .format('YYYY-MM-DD'),
                            })}
                          </Typography>
                        </Stack>
                      </TextOnlyTooltip>
                    }
                  />
                ) : null}
              </ListItem>
              <Divider />
              <FastAIUsageQueriesItem usage={userQuotaUsage.fastText} />
              <SmartAIUsageQueriesItem usage={userQuotaUsage.advancedText} />
              <ImageAIUsageQueriesItem usage={userQuotaUsage.imageGenerate} />
            </>
          ) : null
        }
      </List>
    </Box>
  )
}

export default UserQuotaUsageQueriesCard

export const TooltipIcon = () => {
  return (
    <svg viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_10246_92877)'>
        <path
          d='M16 8.5C16 4.08172 12.4183 0.5 8 0.5C3.58172 0.5 0 4.08172 0 8.5C0 12.9183 3.58172 16.5 8 16.5C12.4183 16.5 16 12.9183 16 8.5Z'
          fill='currentColor'
          fillOpacity='0.08'
        />
        <path
          d='M7.52978 12.5001V6.39101H8.4684V12.5001H7.52978ZM8.00703 5.37283C7.8241 5.37283 7.66633 5.31051 7.53375 5.18589C7.40383 5.06127 7.33887 4.91146 7.33887 4.73646C7.33887 4.56146 7.40383 4.41165 7.53375 4.28703C7.66633 4.16241 7.8241 4.1001 8.00703 4.1001C8.18999 4.1001 8.34647 4.16241 8.47639 4.28703C8.60895 4.41165 8.67519 4.56146 8.67519 4.73646C8.67519 4.91146 8.60895 5.06127 8.47639 5.18589C8.34647 5.31051 8.18999 5.37283 8.00703 5.37283Z'
          fill='currentColor'
          fillOpacity='0.6'
        />
      </g>
      <defs>
        <clipPath id='clip0_10246_92877'>
          <rect
            width='16'
            height='16'
            fill='white'
            transform='translate(0 0.5)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}
