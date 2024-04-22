import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
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
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

// 大于等于 100000 表示无限，前端不用显示具体的数; 这个值是后端定的
const IS_UNLIMITED_FLAG = 100000

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
  } = useUserInfo()

  // 只在第一次加载时, 同步用户的 quota 使用量信息
  useEffectOnce(() => {
    syncUserQuotaUsageInfo()
  })

  const loading = useMemo(() => {
    // return true
    return userInfoLoading || userQuotaUsage.loading
  }, [userInfoLoading, userQuotaUsage.loading])

  return (
    <Box>
      <List
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgb(32, 33, 36)'
              : 'rgb(255,255,255)',
          p: '0 !important',
          borderRadius: '4px',
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
              <Stack direction={'row'} alignItems="center" spacing={1}>
                <Typography fontSize={16} lineHeight={1.5}>
                  {t('quota_usage_card:role_label', {
                    ROLE: startCase(currentUserPlan.name),
                  })}{' '}
                  {isTeamPlanUser ? `(${t('common:team_plan')})` : ''}
                </Typography>
                {isPayingUser ? (
                  // 暂时只有付费用户能看到刷新按钮
                  <IconButton
                    size="small"
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
                      <CircularProgress size={16} />
                    ) : (
                      <RefreshOutlinedIcon
                        sx={{
                          fontSize: 20,
                        }}
                      />
                    )}
                  </IconButton>
                ) : null}
              </Stack>
            }
          />
          <Button
            component={'a'}
            target={'_blank'}
            href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
            variant={'contained'}
            endIcon={<OpenInNewOutlinedIcon />}
            sx={{
              height: 44,
            }}
          >
            {t(isPayingUser ? 'common:manage_my_plan' : 'common:upgrade')}
          </Button>
        </ListItem>
        {
          // 免费用户不需要显示下面的 quota 使用量
          isPayingUser ? (
            <>
              <Divider />
              <ListItem
                sx={{
                  bgcolor: 'customColor.secondaryBackground',
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
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          ml="auto"
                          justifyContent={'flex-end'}
                          width="max-content"
                        >
                          {/* {loading ? <CircularProgress size={16} /> : null} */}
                          <Typography fontSize={14} lineHeight={1.5}>
                            {t('quota_usage_card:reset_on_date', {
                              DATE: dayjs
                                .utc(userQuotaUsage.nextRefreshTime)
                                .local()
                                .format('MMM D, YYYY'),
                            })}
                          </Typography>
                        </Stack>
                      </TextOnlyTooltip>
                    }
                  />
                ) : null}
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={t('quota_usage_card:category__fast_text')}
                  secondary={'GPT-3.5 & Claude-3-haiku & Gemini-pro'}
                />

                <ListItemText
                  sx={{
                    textAlign: 'right',
                  }}
                  primary={
                    userQuotaUsage.fastText >= IS_UNLIMITED_FLAG ||
                    currentUserPlan.name === 'elite'
                      ? t('common:unlimited')
                      : numberWithCommas(userQuotaUsage.fastText, 0)
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={t('quota_usage_card:category__advanced_text')}
                  secondary={'GPT-4 & Claude-3-opus/sonnet & Gemini-1.5-pro'}
                />

                <ListItemText
                  sx={{
                    textAlign: 'right',
                  }}
                  primary={
                    userQuotaUsage.advancedText >= IS_UNLIMITED_FLAG ||
                    currentUserPlan.name === 'elite'
                      ? t('common:unlimited')
                      : numberWithCommas(userQuotaUsage.advancedText, 0)
                  }
                  secondary={
                    userQuotaUsage.fastText >= IS_UNLIMITED_FLAG ||
                    currentUserPlan.name === 'elite' ? (
                      <Stack
                        direction={'row'}
                        alignItems="center"
                        justifyContent={'flex-end'}
                        spacing={0.5}
                      >
                        <Typography fontSize={14} color="text.secondary">
                          {t(
                            'quota_usage_card:advanced_text__secondary__content',
                            {
                              QUERIES: numberWithCommas(
                                userQuotaUsage.advancedText,
                                0,
                              ),
                            },
                          )}
                        </Typography>
                        <TextOnlyTooltip
                          arrow
                          placement="bottom"
                          title={t(
                            'quota_usage_card:advanced_text__secondary__content__tooltip',
                          )}
                        >
                          <Stack
                            alignItems={'center'}
                            justifyContent="center"
                            borderRadius={'50%'}
                            width={20}
                            height={20}
                          >
                            <TooltipIcon />
                          </Stack>
                        </TextOnlyTooltip>
                      </Stack>
                    ) : null
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={t('quota_usage_card:category__image_generate')}
                  secondary={'DALL·E 3'}
                />

                <ListItemText
                  sx={{
                    textAlign: 'right',
                  }}
                  primary={
                    userQuotaUsage.imageGenerate >= IS_UNLIMITED_FLAG ||
                    currentUserPlan.name === 'elite'
                      ? t('common:unlimited')
                      : numberWithCommas(userQuotaUsage.imageGenerate, 0)
                  }
                  secondary={
                    userQuotaUsage.fastText >= IS_UNLIMITED_FLAG ||
                    currentUserPlan.name === 'elite' ? (
                      <Stack
                        direction={'row'}
                        alignItems="center"
                        justifyContent={'flex-end'}
                        spacing={0.5}
                      >
                        <Typography fontSize={14} color="text.secondary">
                          {t(
                            'quota_usage_card:image_generate__secondary__content',
                            {
                              QUERIES: numberWithCommas(
                                userQuotaUsage.imageGenerate,
                                0,
                              ),
                            },
                          )}
                        </Typography>
                        <TextOnlyTooltip
                          arrow
                          placement="bottom"
                          title={t(
                            'quota_usage_card:image_generate__secondary__content__tooltip',
                          )}
                        >
                          <Stack
                            alignItems={'center'}
                            justifyContent="center"
                            borderRadius={'50%'}
                            width={20}
                            height={20}
                          >
                            <TooltipIcon />
                          </Stack>
                        </TextOnlyTooltip>
                      </Stack>
                    ) : null
                  }
                />
              </ListItem>
            </>
          ) : null
        }
      </List>
    </Box>
  )
}

export default UserQuotaUsageQueriesCard

const TooltipIcon = () => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_10246_92877)">
        <path
          d="M16 8.5C16 4.08172 12.4183 0.5 8 0.5C3.58172 0.5 0 4.08172 0 8.5C0 12.9183 3.58172 16.5 8 16.5C12.4183 16.5 16 12.9183 16 8.5Z"
          fill="currentColor"
          fillOpacity="0.08"
        />
        <path
          d="M7.52978 12.5001V6.39101H8.4684V12.5001H7.52978ZM8.00703 5.37283C7.8241 5.37283 7.66633 5.31051 7.53375 5.18589C7.40383 5.06127 7.33887 4.91146 7.33887 4.73646C7.33887 4.56146 7.40383 4.41165 7.53375 4.28703C7.66633 4.16241 7.8241 4.1001 8.00703 4.1001C8.18999 4.1001 8.34647 4.16241 8.47639 4.28703C8.60895 4.41165 8.67519 4.56146 8.67519 4.73646C8.67519 4.91146 8.60895 5.06127 8.47639 5.18589C8.34647 5.31051 8.18999 5.37283 8.00703 5.37283Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </g>
      <defs>
        <clipPath id="clip0_10246_92877">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
