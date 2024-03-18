import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useRef, useState } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import DevContent from '@/components/DevContent'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import {
  isAIMessage,
  isSystemMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import DevMessageSourceData from '@/features/sidebar/components/SidebarChatBox/DevMessageSourceData'
import {
  SidebarAIMessage,
  SidebarSystemMessage,
  SidebarUserMessage,
} from '@/features/sidebar/components/SidebarChatBox/sidebarMessages'
import useChatMessageExpiredFileUpdater from '@/features/sidebar/hooks/useChatMessageExpiredFileUpdater'
import { useCustomTheme } from '@/hooks/useCustomTheme'

interface IProps {
  message: IChatMessage
  order: number
  className?: string
  loading?: boolean
}

const SidebarChatBoxMessageItem: FC<IProps> = (props) => {
  const { message, className, loading, order } = props
  const { isDarkMode } = useCustomTheme()
  useChatMessageExpiredFileUpdater(message)
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
        width: '100%',
        p: 1,
        color: 'text.primary',
        position: 'relative',
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
        <DevMessageSourceData message={message} />
      </DevContent>
      <AppSuspenseLoadingLayout>
        {isSystemMessage(message) && <SidebarSystemMessage message={message} />}
        {isAIMessage(message) && (
          <SidebarAIMessage
            isDarkMode={isDarkMode}
            message={message as IAIResponseMessage}
            loading={loading}
            order={order}
          />
        )}
        {isUserMessage(message) && (
          <SidebarUserMessage message={message} order={order} />
        )}
      </AppSuspenseLoadingLayout>
    </Stack>
  )
}
export default SidebarChatBoxMessageItem
