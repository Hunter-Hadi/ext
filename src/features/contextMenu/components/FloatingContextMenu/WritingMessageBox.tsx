import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import debounce from 'lodash-es/debounce'
import isEmpty from 'lodash-es/isEmpty'
import throttle from 'lodash-es/throttle'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import CustomMarkdown from '@/components/CustomMarkdown'
import { useRangy } from '@/features/contextMenu'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import {
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu/store'
import SidebarUserMessageContexts from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarUserMessage/SidebarUserMessageContexts'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

const WritingMessageBox: FC<{
  onChange?: (value: string) => void
}> = (props) => {
  const theme = useCustomTheme()
  const { onChange } = props
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const [, setFloatingDropdownMenuSystemItems] = useRecoilState(
    FloatingDropdownMenuSystemItemsState,
  )
  const { currentFloatingContextMenuDraft, selectedDraftUserMessage } =
    useFloatingContextMenuDraft()
  useEffect(() => {
    console.log(
      'AIInput currentFloatingContextMenuDraft: ',
      currentFloatingContextMenuDraft,
    )
    setFloatingDropdownMenuSystemItems((prev) => {
      return {
        ...prev,
        lastOutput: currentFloatingContextMenuDraft,
      }
    })
    onChange?.(currentFloatingContextMenuDraft)
  }, [currentFloatingContextMenuDraft, floatingDropdownMenu.open])
  const containerRef = useRef<HTMLDivElement>(null)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const throttleUpdateHeight = useCallback(
    throttle(() => {
      const container = containerRef.current
      if (!container) return
      console.log(
        '检测到高度更新:\t',
        boxRef.current?.offsetHeight,
        boxRef.current?.getBoundingClientRect().height,
      )
      container.style.minHeight = `${boxRef.current?.offsetHeight || 0}px`
    }, 100),
    [],
  )
  const debounceUpdateHeight = useCallback(
    debounce(() => {
      const container = containerRef.current
      if (!container) return
      console.log(
        '检测到高度更新:\t',
        boxRef.current?.offsetHeight,
        boxRef.current?.getBoundingClientRect().height,
      )
      container.style.minHeight = `${
        (boxRef.current?.offsetHeight || 0) + 0.01
      }px`
    }, 100),
    [],
  )
  useEffect(() => {
    // scroll to bottom
    setTimeout(() => {
      boxRef.current?.scrollTo({
        top: boxRef.current.scrollHeight,
      })
      throttleUpdateHeight()
      debounceUpdateHeight()
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
  return (
    <Stack
      ref={containerRef}
      className={'chat-message--text max-ai__writing-message-box'}
      whiteSpace={'pre-wrap'}
      width={'100%'}
      sx={{
        wordBreak: 'break-word',
        borderBottomLeftRadius: 0,
        color: (t) =>
          t.palette.mode === 'dark' ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
        '& .markdown-body': {
          userSelect: 'text',
          maxHeight: 'min(40vh, 320px)',
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
      {isEmpty(currentFloatingContextMenuDraft) && !selectedDraftUserMessage ? (
        <ContextText />
      ) : null}
      {selectedDraftUserMessage && (
        <SidebarUserMessageContexts
          container={
            getMaxAIFloatingContextMenuRootElement() || document.documentElement
          }
          sx={{
            mt: 1,
            '& > div': {
              maxWidth: '100%',
              width: '100%',
              '& > div': {
                width: '100%',
              },
            },
          }}
          message={selectedDraftUserMessage}
        />
      )}
      <div
        tabIndex={-1}
        ref={boxRef}
        style={{
          textAlign: 'left',
        }}
        className={`markdown-body ${
          theme.isDarkMode ? 'markdown-body-dark' : ''
        }`}
      >
        <CustomMarkdown>
          {currentFloatingContextMenuDraft.replace(/^\s+/, '')}
        </CustomMarkdown>
      </div>
    </Stack>
  )
}

const ContextText: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { currentSelection } = useRangy()
  const splitCenterText = useMemo(() => {
    if (
      currentSelection?.selectionElement?.editableElementSelectionText ||
      currentSelection?.selectionElement?.selectionText
    ) {
      const context =
        currentSelection?.selectionElement?.editableElementSelectionText ||
        currentSelection?.selectionElement?.selectionText
          .trim()
          .replace(/\u200B/g, '')
      const truncateString = (string: string, count: number) => {
        if (string.length <= count) {
          return {
            start: string,
            end: '',
          }
        }
        const end = string.substring(string.length - count)
        const start = string.substring(0, string.length - count)
        return {
          start,
          end,
        }
      }
      return truncateString(context, 15)
    }
    return {
      start: '',
      end: '',
    }
  }, [currentSelection])
  if (!splitCenterText.start && !splitCenterText.end) {
    return null
  }
  return (
    <Typography
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
      fontSize={'12px'}
      fontWeight={400}
      color={'text.secondary'}
    >
      <span style={{ flexShrink: 0 }}>
        {t('client:floating_menu__draft_card__context__title')}:{' '}
      </span>
      <span
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {splitCenterText.start}
      </span>
      <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        {splitCenterText.end}
      </span>
    </Typography>
  )
}
export default WritingMessageBox
