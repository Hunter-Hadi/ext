import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { sendLarkBotMessage } from '@/utils/larkBot'

const SidebarChatBoxSystemTools: FC<{
  solutionsShow: boolean
  onSolutionToggle: () => void
  message: ISystemChatMessage
}> = (props) => {
  const { message, onSolutionToggle, solutionsShow } = props
  const { t } = useTranslation(['common', 'client'])
  const { currentSidebarConversationMessages } = useSidebarSettings()
  const lastMessage =
    currentSidebarConversationMessages.length > 0
      ? currentSidebarConversationMessages[
          currentSidebarConversationMessages.length - 1
        ]
      : undefined
  const { currentUserPlan, userInfo } = useUserInfo()
  const chatMessageType =
    message.meta?.systemMessageType ||
    message.extra?.systemMessageType ||
    'normal'
  const permissionSceneType =
    message.meta?.permissionSceneType || message?.extra?.permissionSceneType
  const chatMessageStatus =
    message.meta?.status || message.extra?.status || 'success'
  const permissionCardMap = usePermissionCardMap()
  const { currentAIProviderDetail } = useAIProviderModels()
  const upgradeCardText = useMemo(() => {
    if (permissionSceneType && permissionCardMap[permissionSceneType]) {
      return permissionCardMap[permissionSceneType].ctaButtonText
    }
    return t('client:sidebar__button__upgrade_to_pro')
  }, [permissionCardMap, permissionSceneType, t])
  useEffect(() => {
    if (
      chatMessageType === 'needUpgrade' &&
      (currentUserPlan.name === 'pro' || currentUserPlan.name === 'elite')
    ) {
      sendLarkBotMessage(
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
  }, [currentUserPlan.name, chatMessageType])
  return (
    <Stack direction={'row'} alignItems={'center'} flexWrap={'wrap'} gap={1}>
      {chatMessageType === 'needUpgrade' && (
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
          href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
          onClick={(event) => {
            if (chatMessageType === 'needUpgrade' && permissionSceneType) {
              authEmitPricingHooksLog('click', permissionSceneType)
            }
          }}
        >
          {upgradeCardText}
        </Button>
      )}
      {chatMessageStatus === 'error' && currentAIProviderDetail?.isThirdParty && (
        <Button
          size={'small'}
          variant={'outlined'}
          color={'error'}
          onClick={onSolutionToggle}
          sx={{
            border: '1px solid rgba(244, 67, 54, 0.5)',
            color: '#f44336',
          }}
        >
          {solutionsShow
            ? t('client:provider__label__hide')
            : t('client:provider__label__view_solutions')}
        </Button>
      )}

      {chatMessageType === 'normal' &&
        lastMessage?.messageId === message.messageId &&
        message.parentMessageId && (
          <Button
            size={'small'}
            variant={'outlined'}
            color={'error'}
            sx={{
              border: '1px solid rgba(244, 67, 54, 0.5)',
              color: '#f44336',
            }}
          >
            {t('client:sidebar__button__retry')}
          </Button>
        )}
    </Stack>
  )
}
export default SidebarChatBoxSystemTools
