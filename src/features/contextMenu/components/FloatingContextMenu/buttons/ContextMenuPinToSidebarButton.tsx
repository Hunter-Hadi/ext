import { ViewSidebar, ViewSidebarOutlined } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { PaginationConversationMessagesStateFamily } from '@/features/chatgpt/store'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import {
  ContextMenuPinedToSidebarState,
  PinToSidebarState,
} from '@/features/contextMenu/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const ContextMenuPinToSidebarButton: FC = () => {
  const { t } = useTranslation(['client'])
  const [pinToSidebar, setPinToSidebar] = useRecoilState(PinToSidebarState)
  const { conversationId = '' } = useChatPanelContext()
  const { continueConversationInSidebar } = useSidebarSettings()
  const setContextMenuPinedToSidebar = useSetRecoilState(
    ContextMenuPinedToSidebarState,
  )

  const handleAlwaysPinToSidebar = useRecoilCallback(
    ({ snapshot }) =>
      async (always: boolean) => {
        const messages = await snapshot.getPromise(
          PaginationConversationMessagesStateFamily(conversationId),
        )

        if (messages.length > 0 && always) {
          await continueConversationInSidebar(
            conversationId,
            {},
            {
              syncConversationToDB: true,
              waitSync: true,
            },
          )

          setContextMenuPinedToSidebar(true)
        }

        setPinToSidebar({
          once: false,
          always,
        })
      },
    [conversationId, pinToSidebar],
  )

  return (
    <TextOnlyTooltip
      title={
        pinToSidebar.always
          ? t('floating_menu__always_pin_to_sidebar')
          : t('floating_menu__always_unpin_to_sidebar')
      }
      onClick={() => {
        handleAlwaysPinToSidebar(!pinToSidebar.always)
      }}
      floatingMenuTooltip
      placement='top'
    >
      <IconButton
        size='small'
        sx={{
          width: 'auto',
          height: 20,
          color: 'inherit',
          padding: '0 3px',
        }}
      >
        {pinToSidebar.always ? (
          <ViewSidebar
            sx={{
              fontSize: 16,
            }}
            color='primary'
          ></ViewSidebar>
        ) : (
          <ViewSidebarOutlined
            sx={{
              fontSize: 16,
            }}
          />
        )}
      </IconButton>
    </TextOnlyTooltip>
  )
}

export default ContextMenuPinToSidebarButton
