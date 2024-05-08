import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const SidebarChatBoxSystemTools: FC<{
  solutionsShow: boolean
  onSolutionToggle: () => void
  message: ISystemChatMessage
  loading?: boolean
}> = (props) => {
  const { message, onSolutionToggle, solutionsShow, loading } = props
  const { t } = useTranslation(['common', 'client'])
  const { currentSidebarConversationMessages, currentSidebarConversationType } =
    useSidebarSettings()
  const lastMessage = currentSidebarConversationMessages.at(-1)
  // const { currentUserPlan, userInfo } = useUserInfo()
  const { regenerate } = useClientChat()
  const { regenerateSearchWithAI } = useSearchWithAI()
  const chatSystemMessageType =
    message.meta?.systemMessageType ||
    message.extra?.systemMessageType ||
    'normal'
  const chatSystemMessageStatus =
    message.meta?.status || message.extra?.status || 'success'
  const { currentAIProviderDetail } = useAIProviderModels()

  return (
    <Stack direction={'row'} alignItems={'center'} flexWrap={'wrap'} gap={1}>
      {chatSystemMessageStatus === 'error' &&
        currentAIProviderDetail?.thirdParty && (
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

      {chatSystemMessageStatus !== 'success' &&
        chatSystemMessageType === 'normal' &&
        lastMessage?.messageId === message.messageId &&
        message.parentMessageId && (
          <Button
            size={'small'}
            variant={'outlined'}
            color={'error'}
            disabled={loading}
            sx={{
              border: '1px solid rgba(244, 67, 54, 0.5)',
              color: '#f44336',
            }}
            onClick={async () => {
              if (currentSidebarConversationType === 'Search') {
                await regenerateSearchWithAI(true)
                return
              }
              await regenerate()
            }}
          >
            {t('client:sidebar__button__retry')}
          </Button>
        )}
    </Stack>
  )
}
export default SidebarChatBoxSystemTools
