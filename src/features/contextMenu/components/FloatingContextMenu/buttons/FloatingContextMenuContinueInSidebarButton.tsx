import Button from '@mui/material/Button'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

// import { useSetRecoilState } from 'recoil'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
// import { PinToSidebarState } from '@/features/contextMenu/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const FloatingContextMenuContinueInSidebarButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { currentConversationId, clientConversationMessages } =
    useClientConversation()
  const { continueConversationInSidebar } = useSidebarSettings()
  // const setPinToSidebar = useSetRecoilState(PinToSidebarState)

  const handleClick = () => {
    if (!currentConversationId) return

    // setPinToSidebar({
    //   once: true,
    //   always: false,
    // })
    continueConversationInSidebar(
      currentConversationId,
      {},
      {
        syncConversationToDB: true,
        waitSync: true,
      },
    ).catch()
  }

  if (!clientConversationMessages.length) {
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
      variant='outlined'
    >
      {t('context_window__chat_history__continue_in_sidebar__title')}
    </Button>
  )
}

export default FloatingContextMenuContinueInSidebarButton
