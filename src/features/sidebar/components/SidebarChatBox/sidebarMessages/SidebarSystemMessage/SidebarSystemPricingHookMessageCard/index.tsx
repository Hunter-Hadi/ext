import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCard } from '@/features/auth/hooks/usePermissionCard'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import DailyLimitUsageQueriesCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/DailyLimitUsageQueriesCard'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

interface IProps {
  permissionSceneType: PermissionWrapperCardSceneType
  message: ISystemChatMessage
}

// pricing hook 渲染器
const SidebarSystemPricingHookMessageCard: FC<IProps> = ({
  permissionSceneType,
  message,
}) => {
  const { t } = useTranslation()
  const { currentUserPlan, userInfo, isPayingUser } = useUserInfo()
  const permissionCard = usePermissionCard(permissionSceneType)
  const permissionCardMap = usePermissionCardMap()

  const chatSystemMessageType =
    message.meta?.systemMessageType ||
    message.extra?.systemMessageType ||
    'normal'

  const systemMessageText = useMemo(
    () => formatChatMessageContent(message),
    [message],
  )
  const upgradeCardText = useMemo(() => {
    if (
      permissionSceneType &&
      permissionCardMap[permissionSceneType] &&
      permissionCardMap[permissionSceneType].ctaButtonText
    ) {
      return permissionCardMap[permissionSceneType].ctaButtonText
    }
    return t('client:sidebar__button__upgrade_to_plan', {
      PlAN: 'Elite',
    })
  }, [permissionCardMap, permissionSceneType, t])

  useEffect(() => {
    if (chatSystemMessageType === 'needUpgrade' && isPayingUser) {
      clientSendMaxAINotification(
        'PRICING',
        `[Pricing] Pro show pricing card`,
        JSON.stringify({
          user: userInfo,
          plan: currentUserPlan,
        }),
        {
          uuid: '7a04bc02-6155-4253-bcdb-ade3db6de492',
        },
      )
    }
  }, [isPayingUser, currentUserPlan.name, chatSystemMessageType])

  return (
    <Stack spacing={1.5}>
      {permissionCard ? (
        <>
          {/* title */}
          {typeof permissionCard.title === 'string' ? (
            <Typography fontSize={22} fontWeight={700} lineHeight={1.4}>
              {permissionCard.title}
            </Typography>
          ) : (
            permissionCard.title
          )}
          {/* image */}
          {permissionCard.imageUrl && (
            <img
              src={permissionCard.imageUrl}
              alt={permissionSceneType}
              height={'auto'}
            />
          )}
          {/* description */}
          {typeof permissionCard.description === 'string' ? (
            <Typography fontSize={16} lineHeight={1.5}>
              {permissionCard.description}
            </Typography>
          ) : (
            permissionCard.description
          )}
        </>
      ) : (
        <Stack direction={'row'} alignItems="flex-start" spacing={1.5} mb={2}>
          {systemMessageText}
        </Stack>
      )}

      {/* 如果是 每日限制的 sceneType === TOTAL_CHAT_DAILY_LIMIT */}
      {/* 需要另外渲染一个卡片 */}
      {permissionSceneType === 'TOTAL_CHAT_DAILY_LIMIT' && (
        <DailyLimitUsageQueriesCard />
      )}

      {/* cta button */}
      {chatSystemMessageType === 'needUpgrade' && (
        <Stack spacing={0.5} mt={'16px !important'}>
          <Button
            fullWidth
            sx={{
              height: 48,
              fontSize: '16px',
              fontWeight: 500,
              bgcolor: 'promotionColor.backgroundMain',
              color: 'white',
              '&:hover': {
                bgcolor: '#b56407',
              },
            }}
            variant={'contained'}
            color={'primary'}
            target={'_blank'}
            href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
            onClick={(event) => {
              if (
                chatSystemMessageType === 'needUpgrade' &&
                permissionSceneType
              ) {
                authEmitPricingHooksLog('click', permissionSceneType)
              }
            }}
          >
            {upgradeCardText}
          </Button>
          <Stack
            direction={'row'}
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
          >
            <CheckOutlinedIcon
              sx={{
                fontSize: 20,
                color: 'promotionColor.fontMain',
              }}
            />
            <Typography fontSize={14} color="text.secondary">
              {t('common:cancel_anytime')}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}

export default SidebarSystemPricingHookMessageCard
