import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import {
  IS_UNLIMITED_FLAG,
  TooltipIcon,
} from '@/features/auth/components/UserQuotaUsageQueriesCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { IUserRoleType } from '@/features/auth/types'
import ProLink from '@/features/common/components/ProLink'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

import UsageProgress from './UsageProgress'

interface IImageAIUsageQueriesItemProps {
  usage: number
  sx?: SxProps
}

const IMAGE_AI_MAX_QUOTA: Partial<Record<IUserRoleType, number>> = {
  free: 0,
  basic: 400,
  pro: 400,
  elite: IS_UNLIMITED_FLAG,
}

const ImageAIUsageQueriesItem: FC<IImageAIUsageQueriesItemProps> = ({
  usage,
  sx,
}) => {
  const imageAIModelText = 'DALL·E 3'

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
          primary={t('quota_usage_card:category__image_generate')}
          secondary={imageAIModelText}
        />
        <ListItemText
          sx={{
            textAlign: 'right',
          }}
          primary={
            <Stack
              direction={'row'}
              alignItems='center'
              justifyContent={'flex-end'}
              spacing={0.5}
            >
              {/* 这里默认写死, 并且默认0 - @huangsong */}
              <Typography fontSize={16} lineHeight={1.5}>
                {isUnlimited ? t('common:unlimited') : 0}
                {/* {isUnlimited ? t('common:unlimited') : numberWithCommas(usage, 0)} */}
              </Typography>
            </Stack>
          }
          secondary={
            <>
              {isUnlimited ? (
                <Stack
                  direction={'row'}
                  alignItems='center'
                  justifyContent={'flex-end'}
                  spacing={0.5}
                >
                  <Typography fontSize={14} color='text.secondary'>
                    {t('quota_usage_card:image_generate__secondary__content', {
                      QUERIES: numberWithCommas(usage, 0),
                    })}
                  </Typography>

                  <TextOnlyTooltip
                    arrow
                    placement='bottom'
                    title={t(
                      'quota_usage_card:image_generate__secondary__content__tooltip',
                    )}
                  >
                    <Stack
                      alignItems={'center'}
                      justifyContent='center'
                      borderRadius={'50%'}
                      color={'text.primary'}
                      width={20}
                      height={24}
                    >
                      <TooltipIcon />
                    </Stack>
                  </TextOnlyTooltip>
                </Stack>
              ) : null}
              {!isUnlimited ? (
                <Typography color='text.primary' fontSize={14} lineHeight={1.5}>
                  <ProLink
                    href={`${APP_USE_CHAT_GPT_HOST}/pricing?autoClickPlan=elite_yearly&paymentType=yearly`}
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
        //  这里默认写死, 并且默认0 - @huangsong
        value={0}
        // value={usage}
        maxValue={IMAGE_AI_MAX_QUOTA[currentUserPlan.name] ?? 0}
        sx={{
          px: 3,
        }}
      />
    </Box>
  )
}

export default ImageAIUsageQueriesItem
