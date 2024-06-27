import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { IPaywallVariant } from '@/features/abTester/types'
import { PricingHooksFeatureIcon } from '@/features/auth/components/PermissionPricingHookCard/icons'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCard } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { isUsageLimitPermissionSceneType } from '@/features/auth/utils/permissionHelper'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ISystemChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { openGlobalVideoPopup } from '@/features/video_popup/utils'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

interface IProps {
  permissionSceneType: PermissionWrapperCardSceneType
  message: ISystemChatMessage
  paywallVariant?: IPaywallVariant
}

const PermissionPricingHookCard: FC<IProps> = ({
  permissionSceneType,
  message,
}) => {
  const { t } = useTranslation()
  const { currentConversationIdRef } = useClientConversation()
  const { currentUserPlan, userInfo, isPayingUser } = useUserInfo()
  const permissionCard = usePermissionCard(permissionSceneType)

  const chatSystemMessageType =
    message.meta?.systemMessageType ||
    message.extra?.systemMessageType ||
    'normal'

  const systemMessageText = useMemo(
    () => formatChatMessageContent(message, false),
    [message],
  )
  const ctaButtonText = useMemo(() => {
    if (permissionCard?.ctaButtonText) {
      return permissionCard?.ctaButtonText
    }
    return t('client:permission__pricing_hook__button__upgrade_now')
  }, [permissionCard?.ctaButtonText, t])

  const ctaButtonLink = useMemo(() => {
    if (permissionCard?.ctaButtonLink) {
      return permissionCard?.ctaButtonLink
    }
    return `${APP_USE_CHAT_GPT_HOST}/pricing`
  }, [permissionCard?.ctaButtonLink])

  const ctaButtonClick = (e: React.MouseEvent) => {
    authEmitPricingHooksLog('click', permissionSceneType, {
      conversationId: currentConversationIdRef.current,
      paywallType: 'RESPONSE',
    })

    permissionCard?.ctaButtonOnClick && permissionCard?.ctaButtonOnClick(e)
  }

  useEffect(() => {
    // 付费卡点如果对不符合当前角色的用户展示，则发送 lark bot 通知
    // 由于目前的 pricing 内容是 只要是 付费用户（basic、pro、elite）都可以使用所有功能、只有 不同模型 使用量的限制
    // 所以这里 判断 是付费用户 就不应该出现 pricing hook，出现了就需要发送 lark bot 通知
    if (
      chatSystemMessageType === 'needUpgrade' &&
      isPayingUser &&
      !isUsageLimitPermissionSceneType(permissionSceneType)
    ) {
      // TODO: 用量卡点 的 pricing hook 的出现，完全是后端控制的，需要想法判断 出现的时机是否正确
      clientSendMaxAINotification(
        'PRICING',
        `[Pricing] Pro show pricing card`,
        JSON.stringify({
          user: userInfo,
          plan: currentUserPlan,
          sceneType: permissionSceneType,
        }),
        {
          uuid: '7a04bc02-6155-4253-bcdb-ade3db6de492',
        },
      )
    }
  }, [
    userInfo,
    isPayingUser,
    currentUserPlan,
    chatSystemMessageType,
    permissionSceneType,
  ])

  // 获取到 permissionCard 才渲染
  if (permissionCard) {
    return (
      <Stack
        spacing={1.5}
        data-testid={'pricing-hooks-card'}
        data-permission-scene-type={
          permissionSceneType ? permissionSceneType : undefined
        }
        sx={{
          p: 1.5,
          borderRadius: 2,
          boxSizing: 'border-box',
          bgcolor: '#3B3D3E',
          color: 'white',
        }}
      >
        {permissionCard.imageUrl ? (
          <Stack
            sx={{
              position: 'relative',
              cursor: permissionCard.videoUrl ? 'pointer' : 'auto',
            }}
            onClick={() => {
              permissionCard.videoUrl &&
                openGlobalVideoPopup(permissionCard.videoUrl, true)
            }}
          >
            <img
              src={permissionCard.imageUrl}
              alt={permissionSceneType}
              height={'auto'}
            />
            {permissionCard.videoUrl ? (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  // boxShadow: "0px 2.58px 10.31px 0px #00000040",
                  color: 'white',
                  p: 2,
                  borderRadius: '50%',
                  lineHeight: 0,
                  bgcolor: '#00000080',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <PlayArrowIcon
                  sx={{
                    fontSize: 36,
                  }}
                />
              </Box>
            ) : null}
          </Stack>
        ) : null}
        <Stack direction={'row'} alignItems='start' spacing={1}>
          {typeof permissionCard.title !== 'string' ? (
            permissionCard.title
          ) : (
            <>
              <PricingHooksFeatureIcon
                sx={{
                  color: 'primary.main',
                  fontSize: '24px',
                }}
              />
              <Typography fontSize={20} fontWeight={700} lineHeight={1.4}>
                {permissionCard.title}
              </Typography>
            </>
          )}
        </Stack>

        {typeof permissionCard.description !== 'string' ? (
          permissionCard.description
        ) : (
          <Typography
            fontSize={14}
            lineHeight={1.5}
            sx={{
              whiteSpace: 'pre-wrap',
            }}
          >
            {permissionCard.description}
          </Typography>
        )}

        {/* cta button */}
        <Stack spacing={1} mt={'16px !important'}>
          <Button
            fullWidth
            sx={{
              height: 48,
              fontSize: '16px',
              fontWeight: 500,
            }}
            variant={'contained'}
            color={'primary'}
            target={'_blank'}
            startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
            href={ctaButtonLink}
            onClick={ctaButtonClick}
          >
            {ctaButtonText}
          </Button>
          <Stack direction={'row'} spacing={0.5} alignItems='start'>
            {/*<PricingHooksRocketIcon*/}
            {/*  sx={{*/}
            {/*    fontSize: 20,*/}
            {/*    color: 'primary.main',*/}
            {/*  }}*/}
            {/*/>*/}
            <Typography fontSize={14} color='rgba(255, 255, 255, 0.7)'>
              {t('client:permission__pricing_hook__footer_tip')}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    )
  }

  // 获取不到 permissionCard 渲染 systemMessageText
  // 理论上不该执行到这
  return (
    <Stack direction={'row'} alignItems='flex-start' spacing={1.5} mb={2}>
      {systemMessageText}
    </Stack>
  )
}

export default PermissionPricingHookCard
