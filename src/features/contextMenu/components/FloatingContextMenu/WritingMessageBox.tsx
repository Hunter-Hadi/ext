import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import CustomMarkdown from '@/components/CustomMarkdown'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import usePaginationConversationMessages from '@/features/chatgpt/hooks/usePaginationConversationMessages'
import {
  isSystemMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import {
  ContextWindowDraftContextMenuState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { SidebarSystemMessage } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages'
import { formatUserMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'

const WritingMessageBox: FC<{
  onChange?: (value: string) => void
}> = ({ onChange }) => {
  const theme = useCustomTheme()
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const [, setFloatingDropdownMenuSystemItems] = useRecoilState(
    ContextWindowDraftContextMenuState,
  )

  const { clientConversation } = useClientConversation()

  const { currentFloatingContextMenuDraft, activeAIResponseMessage } =
    useFloatingContextMenuDraft()

  const message = useMemo(
    () => currentFloatingContextMenuDraft.replace(/^\s+/, ''),
    [currentFloatingContextMenuDraft],
  )

  useEffect(() => {
    setFloatingDropdownMenuSystemItems((prev) => {
      return {
        ...prev,
        lastOutput: currentFloatingContextMenuDraft,
      }
    })
    onChange?.(currentFloatingContextMenuDraft)
  }, [currentFloatingContextMenuDraft, floatingDropdownMenu.open])
  const containerRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // scroll to bottom
    setTimeout(() => {
      boxRef.current?.scrollTo({
        top: boxRef.current.scrollHeight,
      })
    }, 0)
  }, [currentFloatingContextMenuDraft])

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.stopPropagation()
        if (e.key === 'C' || e.key === 'c' || e.key === 'x' || e.key === 'X') {
          // save to clipboard
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const text = range.toString() || selection.toString()
            if (text) {
              e.preventDefault()
              navigator.clipboard.writeText(text)
            }
          }
        }
      }
    }
    boxRef.current?.addEventListener('keydown', keydownHandler, true)
  }, [])

  const { paginationMessages } = usePaginationConversationMessages(
    clientConversation?.id || '',
  )

  const lastUserMessage = useMemo(
    () => paginationMessages.findLast((message) => isUserMessage(message)),
    [paginationMessages],
  )

  return (
    <Stack
      ref={containerRef}
      className={'chat-message--text max-ai__writing-message-box'}
      whiteSpace={'pre-wrap'}
      width={'100%'}
      sx={{
        wordBreak: 'break-word',
        borderBottomLeftRadius: 0,
        flex: 1,
        overflowY: 'auto',
        color: (t) =>
          t.palette.mode === 'dark' ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
        '& .markdown-body': {
          userSelect: 'text',
          overflowY: 'auto',
          '*': {
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif!important',
          },
          '& p:last-child': {
            mb: '1em',
          },
        },
      }}
      component={'div'}
    >
      <Stack>
        {!!lastUserMessage && (
          <Typography
            color={(t) =>
              t.palette.mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)'
            }
            padding={'10px 0'}
            fontSize={'18px'}
            fontWeight={600}
            lineHeight={'150%'}
          >
            {formatUserMessageContent(lastUserMessage)}
          </Typography>
        )}
      </Stack>

      {activeAIResponseMessage && isSystemMessage(activeAIResponseMessage) && (
        <SidebarSystemMessage
          message={activeAIResponseMessage}
          sx={{
            boxSizing: 'border-box',
            my: 1,
            gap: 0,
          }}
        />
      )}

      <div
        tabIndex={-1}
        // ref={boxRef}
        style={{
          textAlign: 'left',
          // maxHeight: `${markdownMaxHeight}px`,
        }}
        ref={boxRef}
        className={`markdown-body ${
          theme.isDarkMode ? 'markdown-body-dark' : ''
        }`}
      >
        {!!message && <CustomMarkdown>{message}</CustomMarkdown>}
      </div>
    </Stack>
  )
}

export default WritingMessageBox
