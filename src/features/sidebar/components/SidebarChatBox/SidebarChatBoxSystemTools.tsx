import React, { FC } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useTranslation } from 'react-i18next'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'

const SidebarChatBoxSystemTools: FC<{
  onRetry: () => void
  message: ISystemChatMessage
}> = (props) => {
  const { onRetry, message } = props
  const { t } = useTranslation(['common', 'client'])
  const chatMessageType = message.extra.systemMessageType || 'normal'
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
              message.extra.systemMessageType === 'needUpgrade' &&
              message.extra.permissionSceneType
            ) {
              authEmitPricingHooksLog(
                'click',
                message.extra.permissionSceneType,
              )
            }
          }}
        >
          {t('client:sidebar__button__upgrade_to_pro')}
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
