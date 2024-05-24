import Button from '@mui/material/Button'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const FloatingContextMenuContinueChatButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { currentConversationId, clientConversation } = useClientConversation()
  const { continueConversationInSidebar } = useSidebarSettings()

  const handleClick = () => {
    if (!currentConversationId) return
    continueConversationInSidebar(currentConversationId, { type: 'Chat' }, true)
      .then()
      .catch()
  }

  if (!clientConversation?.messages.length) {
    // 没有消息不显示
    return null
  }

  return (
    <Button
      onClick={handleClick}
      data-testid={'maxai-context-window-continue-chat-button'}
      sx={{
        height: '28px',
        minWidth: 'unset',
        borderRadius: '8px',
        paddingX: '8px',
        borderColor: 'customColor.borderColor',
      }}
      variant="outlined"
    >
      {t('client:context_window__chat_history__continue_in_chat__title')}
    </Button>
  )
}

export default FloatingContextMenuContinueChatButton
