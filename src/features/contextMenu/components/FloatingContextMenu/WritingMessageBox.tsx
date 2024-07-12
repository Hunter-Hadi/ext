import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import CustomMarkdown from '@/components/CustomMarkdown'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
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
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

import MessageContexts from './MessageContext'

const WritingMessageBox: FC<{
  onChange?: (value: string) => void
}> = ({ onChange }) => {
  const theme = useCustomTheme()
  const { t } = useTranslation(['client'])
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const [, setFloatingDropdownMenuSystemItems] = useRecoilState(
    ContextWindowDraftContextMenuState,
  )

  const { clientConversation, clientConversationMessages } =
    useClientConversation()

  const { clientWritingMessage } = useClientConversation()
  const {
    currentFloatingContextMenuDraft,
    activeAIResponseMessage,
    historyMessages,
    activeMessageIndex,
  } = useFloatingContextMenuDraft()

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

  // const { paginationMessages } = usePaginationConversationMessages(
  //   clientConversation?.id || '',
  // )

  const lastUserMessage = useMemo(() => {
    return clientWritingMessage.loading
      ? clientConversationMessages.findLast((msg) => isUserMessage(msg))
      : historyMessages[activeMessageIndex]?.selectedDraftMessage
  }, [
    clientWritingMessage,
    historyMessages,
    activeMessageIndex,
    clientConversationMessages,
  ])

  const lastContent = useMemo(
    () => lastUserMessage?.meta?.contexts?.[0]?.value?.trim() || '',
    [lastUserMessage],
  )

  const title = useMemo(() => {
    if (!lastUserMessage) return ''

    const text = formatUserMessageContent(lastUserMessage)
    // 去除草稿部分
    const draftIndex = text.indexOf(':\n"""\n')
    return draftIndex === -1 ? text : text.slice(0, draftIndex)
  }, [lastUserMessage])

  const [open, setOpen] = useState(false)
  const tooltipContainer = useMemo(
    () => getMaxAIFloatingContextMenuRootElement() || document.body,
    [],
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
      {!!lastUserMessage && (
        <Stack
          direction={'row'}
          gap={'8px'}
          alignItems={'center'}
          height={'auto'}
        >
          <Typography
            color={'text.primary'}
            padding={'10px 0'}
            fontSize={'18px'}
            fontWeight={600}
            lineHeight={'150%'}
          >
            {title}
          </Typography>

          <Typography
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            color={'text.secondary'}
            flex={1}
            fontSize={'14px'}
            sx={{
              whiteSpace: 'nowrap',
              userSelect: 'none',
              cursor: 'default',
            }}
          >
            {lastContent}
          </Typography>

          <MessageContexts
            message={lastUserMessage}
            container={tooltipContainer}
            sx={{
              mt: 1,
              mb: 2,
              '& > div': {
                maxWidth: '100%',
                width: '100%',
                '& > div': {
                  width: '100%',
                },
                '& p[data-testid="user-message-short-contexts"]': {
                  width: '100%',
                },
              },
            }}
          />

          {/* <Tooltip */}
          {/*   title={lastContent} */}
          {/*   open={open} */}
          {/*   placement='top' */}
          {/*   PopperProps={{ */}
          {/*     container: getMaxAIFloatingContextMenuRootElement(), */}
          {/*     style: { */}
          {/*       zIndex: 2147483647, */}
          {/*     }, */}
          {/*   }} */}
          {/*   sx={{ */}
          {/*     bgcolor: (t) => */}
          {/*       t.palette.mode === 'dark' ? '#393743' : '#ffffff', */}
          {/*     // borderLeft: '4px solid #9065B0', */}
          {/*     color: 'rgba(0, 0, 0, 0.87)', */}
          {/*     fontSize: 12, */}
          {/*     boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08);`, */}
          {/*     maxWidth: 'none', */}
          {/*     mt: 1, */}
          {/*     mb: 2, */}
          {/*   }} */}
          {/* > */}
          {/*   <Box */}
          {/*     sx={{ */}
          {/*       display: 'flex', */}
          {/*       gap: '4px', */}
          {/*       borderRadius: '8px', */}
          {/*       border: '1px solid rgba(0, 0, 0, 0.12)', */}
          {/*       padding: '2px 6px', */}
          {/*       alignItems: 'center', */}
          {/*       userSelect: 'none', */}
          {/*       cursor: 'pointer', */}
          {/*     }} */}
          {/*     onClick={() => { */}
          {/*       setOpen(!open) */}
          {/*     }} */}
          {/*   > */}
          {/*     <Box color='text.primary' fontSize={'14px'}> */}
          {/*       {t('floating_menu__button__show_detail')} */}
          {/*     </Box> */}
          {/**/}
          {/*     <KeyboardArrowDown */}
          {/*       sx={{ */}
          {/*         color: '#D9D9D9', */}
          {/*         height: '16px', */}
          {/*         width: '16px', */}
          {/*         transition: 'all 0.2s', */}
          {/*         transform: `rotate(${open ? 0.5 : 0}turn)`, */}
          {/*       }} */}
          {/*     /> */}
          {/*   </Box> */}
          {/* </Tooltip> */}
        </Stack>
      )}

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
