import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react'

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
  onChangeHeight?: (height: number) => void
}

const SidebarChatBoxMessageItem: FC<IProps> = (props) => {
  const { message, className, loading, order, container, onChangeHeight } =
    props
  const messageBoxRef = useRef<HTMLDivElement | null>(null)
  const messageBoxHeightRef = useRef<number>(0)
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
  useEffect(() => {
    // 检测高度变化，ResizeObserver
    if (messageBoxRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!messageBoxRef.current) {
          return
        }
        if (
          messageBoxRef.current?.querySelector('.maxai--lazy-load--skeleton') ||
          messageBoxRef.current?.querySelector('.maxai--loading')
        ) {
          return
        }
        const height = messageBoxRef.current?.offsetHeight
        if (height && height !== messageBoxHeightRef.current) {
          messageBoxHeightRef.current = height
          if (onChangeHeight) {
            onChangeHeight(height)
          }
        }
      })
      resizeObserver.observe(messageBoxRef.current)
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [onChangeHeight])
  return (
    <Stack
      ref={messageBoxRef}
      component={'div'}
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
    </Stack>
  )
}
export default memo(SidebarChatBoxMessageItem)
