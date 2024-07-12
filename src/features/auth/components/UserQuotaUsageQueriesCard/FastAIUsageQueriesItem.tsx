import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { IS_UNLIMITED_FLAG } from '@/features/auth/components/UserQuotaUsageQueriesCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { IUserRoleType } from '@/features/auth/types'
import ProLink from '@/features/common/components/ProLink'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

import UsageProgress from './UsageProgress'

interface IFastAIUsageQueriesItemProps {
  usage: number
  sx?: SxProps
}

const FAST_AI_MAX_QUOTA: Partial<Record<IUserRoleType, number>> = {
  free: 0,
  basic: 10000,
  pro: 10000,
  elite: IS_UNLIMITED_FLAG,
}

const FastAIUsageQueriesItem: FC<IFastAIUsageQueriesItemProps> = ({
  usage,
  sx,
}) => {
  const fastAIModelText = 'GPT-3.5 & Claude-3-Haiku & Gemini-1.5-Flash'

  const { t } = useTranslation()
  const {
    currentUserPlan,
    loading: userInfoLoading,
    userQuotaUsage: { loading: quotaUsageLoading },
  } = useUserInfo()

  const isUnlimited = useMemo(() => {
    return usage >= IS_UNLIMITED_FLAG || currentUserPlan.name === 'elite'
  }, [currentUserPlan.name, usage])

  const showUpgradeLink = useMemo(() => {
    if (userInfoLoading || quotaUsageLoading) {
      return false
    }

    return !isUnlimited && usage <= 0
  }, [userInfoLoading, quotaUsageLoading, isUnlimited, usage])

  return (
    <Box
      sx={{
        mb: isUnlimited ? 0 : 1.5,
        ...sx,
      }}
    >
      <ListItem>
        <ListItemText
          primary={t('quota_usage_card:category__fast_text')}
          secondary={fastAIModelText}
        />
        <ListItemText
          sx={{
            textAlign: 'right',
          }}
          primary={
            isUnlimited ? t('common:unlimited') : numberWithCommas(usage, 0)
          }
          secondary={
            <>
              {showUpgradeLink ? (
                <Typography color='text.primary' fontSize={14} lineHeight={1.5}>
                  <ProLink
                    href={`${APP_USE_CHAT_GPT_HOST}/pricing?autoClickPlan=elite_yearly`}
                    underline='always'
                    sx={{
                      color: 'inherit',
                      textDecorationColor: 'inherit',
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
                  >
                    {t('quota_usage_card:upgrade_to_go_unlimited')}
                  </ProLink>
                </Typography>
              ) : null}
            </>
          }
        />
      </ListItem>
      <UsageProgress
        value={usage}
        maxValue={FAST_AI_MAX_QUOTA[currentUserPlan.name] ?? 0}
        sx={{
          px: 3,
        }}
      />
      {isUnlimited ? <Divider /> : null}
    </Box>
  )
}

export default FastAIUsageQueriesItem
