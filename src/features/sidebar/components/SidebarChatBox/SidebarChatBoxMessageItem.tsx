import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import React, { FC, useMemo, useRef, useState } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import DevContent from '@/components/DevContent'
import {
  isAIMessage,
  isSystemMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import {
  IAIResponseMessage,
  IChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import DevMessageSourceData from '@/features/sidebar/components/SidebarChatBox/DevMessageSourceData'
import {
  SidebarAIMessage,
  SidebarSystemMessage,
  SidebarUserMessage,
} from '@/features/sidebar/components/SidebarChatBox/sidebarMessages'
import useChatMessageExpiredFileUpdater from '@/features/sidebar/hooks/useChatMessageExpiredFileUpdater'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IProps {
  message: IChatMessage
  order: number
  className?: string
  loading?: boolean
  container?: HTMLElement
}

const SidebarChatBoxMessageItem: FC<IProps> = (props) => {
  const { message, className, loading, order, container } = props
  const { isDarkMode } = useCustomTheme()
  useChatMessageExpiredFileUpdater(message)
  const isInImmersiveChat = isMaxAIImmersiveChatPage()
  const [isHover, setIsHover] = useState(false)
  const hoverTimer = useRef<any>(null)
  const hoverSx = useMemo(() => {
    return {
      ...(isHover
        ? {
            '& *': {
              userSelect: 'text!important',
            },
          }
        : {
            '& *': {
              userSelect: 'none!important',
            },
          }),
    }
  }, [isHover])

  return (
    <Stack
      className={className}
      sx={{
        maxWidth: isInImmersiveChat ? '768px' : 'initial',
        width: '100%',
        mx: isInImmersiveChat ? 'auto' : 'initial',
        p: 1,
        color: 'text.primary',
        position: 'relative',
        boxSizing: 'border-box',
        '& .chat-message--text': {
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: 1.4,
          fontWeight: 400,
        },
        ...hoverSx,
      }}
      onCopy={(event) => {
        // save plain text to clipboard
        event.preventDefault()
        event.stopPropagation()
        // get plain text
        const currentSelection = window.getSelection()
        if (currentSelection && currentSelection.toString().trim()) {
          const plainText = currentSelection.toString().trim()
          if (plainText) {
            navigator.clipboard.writeText(plainText)
          }
        }
      }}
      onMouseEnter={() => {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current)
        }
        setIsHover(true)
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current)
        }
        hoverTimer.current = setTimeout(() => {
          setIsHover(false)
          const currentSelection = window.getSelection()
          if (
            currentSelection &&
            currentSelection.toString().trim() &&
            currentSelection.focusNode &&
            currentSelection.focusNode.isSameNode(document.body)
          ) {
            // clear
            currentSelection.removeAllRanges()
          }
        }, 500)
      }}
      key={message.messageId}
    >
      <DevContent>
        <Typography color={'text.primary'}>
          !!!!!!{order}-
          {dayjs(message.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </Typography>
        <DevMessageSourceData message={message} />
      </DevContent>
      <AppSuspenseLoadingLayout>
        {isSystemMessage(message) && (
          <SidebarSystemMessage loading={loading} message={message} />
        )}
        {isAIMessage(message) && (
          <SidebarAIMessage
            isDarkMode={isDarkMode}
            message={message as IAIResponseMessage}
            order={order}
          />
        )}
        {isUserMessage(message) && (
          <SidebarUserMessage
            message={message}
            order={order}
            container={container}
          />
        )}
      </AppSuspenseLoadingLayout>
    </Stack>
  )
}
export default SidebarChatBoxMessageItem
