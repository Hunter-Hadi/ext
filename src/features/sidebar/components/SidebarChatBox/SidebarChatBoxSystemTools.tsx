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
import { sendLarkBotMessage } from '@/utils/larkBot'

const SidebarChatBoxSystemTools: FC<{
  onRetry: () => void
  solutionsShow: boolean
  onSolutionToggle: () => void
  message: ISystemChatMessage
}> = (props) => {
  const { onRetry, message, onSolutionToggle, solutionsShow } = props
  const { t } = useTranslation(['common', 'client'])
  const { currentUserPlan, userInfo } = useUserInfo()
  const chatMessageType = message.extra?.systemMessageType || 'normal'
  const chatMessageStatus = message.extra?.status || 'success'
  const permissionCardMap = usePermissionCardMap()
  const { currentAIProviderDetail } = useAIProviderModels()
  const upgradeCardText = useMemo(() => {
    if (
      message.extra?.permissionSceneType &&
      permissionCardMap[message.extra.permissionSceneType]
    ) {
      return permissionCardMap[message.extra!.permissionSceneType].ctaButtonText
    }
    return t('client:sidebar__button__upgrade_to_pro')
  }, [permissionCardMap, message.extra?.permissionSceneType, t])
  useEffect(() => {
    if (
      chatMessageType === 'needUpgrade' &&
      (currentUserPlan.name === 'pro' || currentUserPlan.name === 'elite')
    ) {
      sendLarkBotMessage(
        `[Pricing] Pro show pricing card`,
        JSON.stringify({
          message: message.text,
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
            if (
              message.extra?.systemMessageType === 'needUpgrade' &&
              message.extra.permissionSceneType
            ) {
              authEmitPricingHooksLog(
                'click',
                message.extra.permissionSceneType,
              )
            }
          }}
        >
          {upgradeCardText}
        </Button>
      )}
      {chatMessageStatus === 'error' &&
        message.parentMessageId &&
        currentAIProviderDetail?.isThirdParty && (
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

      {chatMessageType === 'normal' && message.parentMessageId && (
        <Button
          size={'small'}
          variant={'outlined'}
          color={'error'}
          onClick={onRetry}
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
