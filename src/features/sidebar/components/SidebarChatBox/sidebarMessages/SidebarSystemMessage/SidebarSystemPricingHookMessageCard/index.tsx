import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import {
  isUsageLimitPermissionSceneType,
  PermissionWrapperCardSceneType,
} from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCard } from '@/features/auth/hooks/usePermissionCard'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import AdvancedModelCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/cards/AdvancedModelCard'
import AISearchCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/cards/AISearchCard'
import AISummaryAndAskCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/cards/AISummaryAndAskCard'
import FastModelCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/cards/FastModelCard'
import ImageModelCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/cards/ImageModelCard'
import InstantReplyCard from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarSystemPricingHookMessageCard/cards/InstantReplyCard'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

interface IProps {
  permissionSceneType: PermissionWrapperCardSceneType
  message: ISystemChatMessage
}

const instantReplyPermissionSceneTypeList = new Set([
  'GMAIL_CONTEXT_MENU',
  'GMAIL_DRAFT_BUTTON',
  'GMAIL_REPLY_BUTTON',
  'OUTLOOK_COMPOSE_NEW_BUTTON',
  'OUTLOOK_COMPOSE_REPLY_BUTTON',
  'OUTLOOK_REFINE_DRAFT_BUTTON',
  'TWITTER_COMPOSE_NEW_BUTTON',
  'TWITTER_COMPOSE_REPLY_BUTTON',
  'TWITTER_REFINE_DRAFT_BUTTON',
  'FACEBOOK_COMPOSE_NEW_BUTTON',
  'FACEBOOK_COMPOSE_REPLY_BUTTON',
  'FACEBOOK_REFINE_DRAFT_BUTTON',
  'LINKEDIN_COMPOSE_NEW_BUTTON',
  'LINKEDIN_COMPOSE_REPLY_BUTTON',
  'LINKEDIN_REFINE_DRAFT_BUTTON',
  'YOUTUBE_COMPOSE_NEW_BUTTON',
  'YOUTUBE_COMPOSE_REPLY_BUTTON',
  'YOUTUBE_REFINE_DRAFT_BUTTON',
  'INSTAGRAM_COMPOSE_NEW_BUTTON',
  'INSTAGRAM_COMPOSE_REPLY_BUTTON',
  'INSTAGRAM_REFINE_DRAFT_BUTTON',
  'REDDIT_COMPOSE_NEW_BUTTON',
  'REDDIT_COMPOSE_REPLY_BUTTON',
  'REDDIT_REFINE_DRAFT_BUTTON',
  'DISCORD_COMPOSE_REPLY_BUTTON',
  'DISCORD_REFINE_DRAFT_BUTTON',
  'SLACK_COMPOSE_REPLY_BUTTON',
  'SLACK_REFINE_DRAFT_BUTTON',
  'WHATSAPP_COMPOSE_REPLY_BUTTON',
  'WHATSAPP_REFINE_DRAFT_BUTTON',
  'TELEGRAM_COMPOSE_REPLY_BUTTON',
  'TELEGRAM_REFINE_DRAFT_BUTTON',
  'MESSENGER_COMPOSE_REPLY_BUTTON',
  'MESSENGER_REFINE_DRAFT_BUTTON',
])

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
    return t('client:permission__pricing_hook__button__upgrade_now')
  }, [permissionCardMap, permissionSceneType, t])

  const ctaButtonClick = () => {
    if (chatSystemMessageType === 'needUpgrade' && permissionSceneType) {
      authEmitPricingHooksLog('click', permissionSceneType)
    }
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

  // TODO: 临时方案 手动对 卡点进行分类，后续需要优化掉，删除弃用的卡点

  // 普通模型卡点 / 第三方 provider 用量 卡点
  if (
    permissionSceneType === 'MAXAI_FAST_TEXT_MODEL' ||
    permissionSceneType === 'THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT'
  ) {
    return <FastModelCard ctaButtonClick={ctaButtonClick} />
  }

  // 高级模型卡点
  if (permissionSceneType === 'MAXAI_ADVANCED_MODEL') {
    return <AdvancedModelCard ctaButtonClick={ctaButtonClick} />
  }

  // 图像模型卡点
  if (
    permissionSceneType === 'SIDEBAR_ART_AND_IMAGES' ||
    permissionSceneType === 'MAXAI_IMAGE_GENERATE_MODEL'
  ) {
    return <ImageModelCard ctaButtonClick={ctaButtonClick} />
  }

  // instant reply 卡点 start
  if (instantReplyPermissionSceneTypeList.has(permissionSceneType)) {
    return (
      <InstantReplyCard
        videoUrl={`https://www.youtube.com/embed/fwaqJyTwefI`}
        ctaButtonClick={ctaButtonClick}
      />
    )
  }
  // instant reply 卡点 end

  // ai summary & ask 卡点
  if (permissionSceneType === 'PAGE_SUMMARY') {
    return (
      <AISummaryAndAskCard
        videoUrl={`https://www.youtube.com/embed/72UM1jMaJhY`}
        ctaButtonClick={ctaButtonClick}
      />
    )
  }

  // ai search 卡点
  if (permissionSceneType === 'SIDEBAR_SEARCH_WITH_AI') {
    return (
      <AISearchCard
        videoUrl={`https://www.youtube.com/embed/1uZuyqqySO0`}
        ctaButtonClick={ctaButtonClick}
      />
    )
  }

  // default render
  return (
    <Stack spacing={1.5}>
      {permissionCard ? (
        <>
          {/* title */}
          {typeof permissionCard?.title === 'string' ? (
            <Typography fontSize={22} fontWeight={700} lineHeight={1.4}>
              {permissionCard?.title}
            </Typography>
          ) : (
            permissionCard?.title
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

      {/* play video */}
      {/* {permissionCard?.videoUrl ? (
        <Button
          size="small"
          variant="contained"
          startIcon={<PlayCircleOutlinedIcon />}
          sx={{
            width: 'max-content',
            px: 1,
            py: 0.2,
            fontSize: 14,
            lineHeight: 1.5,
          }}
          onClick={() => {
            alert('play video')
          }}
        >
          {t('common:watch_video')}
        </Button>
      ) : null} */}

      {/* cta button */}
      {chatSystemMessageType === 'needUpgrade' && (
        <Stack spacing={0.5} mt={'16px !important'}>
          <Button
            fullWidth
            sx={{
              height: 48,
              fontSize: '16px',
              fontWeight: 500,
              // bgcolor: 'promotionColor.backgroundMain',
              // color: 'white',
              // '&:hover': {
              //   bgcolor: '#b56407',
              // },
            }}
            startIcon={<RocketLaunchIcon />}
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
                color: 'primary.main',
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
