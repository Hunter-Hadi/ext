import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { AppSettingsState } from '@/store'
import CustomMarkdown from '@/components/CustomMarkdown'
import {
  FloatingContextMenuDraftState,
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu/store'
import cloneDeep from 'lodash-es/cloneDeep'
import { useRangy } from '@/features/contextMenu'
import Typography from '@mui/material/Typography'
import isEmpty from 'lodash-es/isEmpty'
import { CHAT_GPT_PROMPT_PREFIX } from '@/constants'

const WritingMessageBox: FC<{
  onChange?: (value: string) => void
}> = (props) => {
  const { onChange } = props
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const { userSettings } = useRecoilValue(AppSettingsState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const prevMessageIdRef = useRef<string | null>(null)
  const [, setFloatingDropdownMenuSystemItems] = useRecoilState(
    FloatingDropdownMenuSystemItemsState,
  )
  const [floatingContextMenuDraft, setFloatingContextMenuDraft] =
    useRecoilState(FloatingContextMenuDraftState)
  useEffect(() => {
    console.log('AIInput writingMessage remove: ', floatingDropdownMenu.open)
    setFloatingContextMenuDraft({
      draft: '',
      draftList: [],
    })
  }, [floatingDropdownMenu.open])
  useEffect(() => {
    const writingMessageText = conversation.writingMessage?.text
    const writingMessageId = conversation.writingMessage?.messageId
    if (writingMessageId && writingMessageText) {
      let isSameMessage = true
      if (
        prevMessageIdRef.current &&
        prevMessageIdRef.current !== writingMessageId
      ) {
        console.log(
          'AIInput writingMessage reset: ',
          conversation.writingMessage,
        )
        isSameMessage = false
      }
      prevMessageIdRef.current = writingMessageId
      // ChatGPT 有可能第一个回答会返回之前的问题
      if (writingMessageText.includes(CHAT_GPT_PROMPT_PREFIX)) {
        return
      }
      setFloatingContextMenuDraft((prevState) => {
        const copyDraftList = cloneDeep(prevState.draftList)
        if (isSameMessage) {
          console.log('AIInput writingMessage update: ', writingMessageText)
          // 更新最后一行
          copyDraftList.pop()
          copyDraftList.push(writingMessageText)
        } else {
          // 说明新增了一行
          copyDraftList.push(writingMessageText)
          console.log(
            'AIInput writingMessage update new line: ',
            writingMessageText,
          )
        }
        return {
          draft: copyDraftList.join('\n\n').replace(/\n{2,}/, '\n\n'),
          draftList: copyDraftList,
        }
      })
    }
  }, [conversation.writingMessage])
  useEffect(() => {
    console.log('AIInput update: ', floatingContextMenuDraft.draft)
    setFloatingDropdownMenuSystemItems((prev) => {
      return {
        ...prev,
        lastOutput: floatingContextMenuDraft.draft,
      }
    })
    onChange?.(floatingContextMenuDraft.draft)
  }, [floatingContextMenuDraft.draft])
  const boxRef = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    // scroll to bottom
    boxRef.current?.scrollTo({
      top: boxRef.current.scrollHeight,
    })
  }, [floatingContextMenuDraft.draft])
  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.stopPropagation()
        if (e.key === 'C' || e.key === 'c' || e.key === 'x' || e.key === 'X') {
          // save to clipboard
          const selection = window.getSelection()
          if (selection) {
            const range = selection.getRangeAt(0)
            const text = range.toString()
            if (text) {
              e.preventDefault()
              navigator.clipboard.writeText(text)
            }
          }
        }
      }
    }
    boxRef.current?.addEventListener('keydown', keydownHandler)
    return () => {
      boxRef.current?.removeEventListener('keydown', keydownHandler)
    }
  }, [])
  return (
    <Stack
      className={'chat-message--text'}
      whiteSpace={'pre-wrap'}
      width={'100%'}
      sx={{
        wordBreak: 'break-word',
        borderBottomLeftRadius: 0,
        color:
          userSettings?.colorSchema === 'dark'
            ? '#FFFFFFDE'
            : 'rgba(0,0,0,0.87)',
        '& .markdown-body': {
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
      {isEmpty(floatingContextMenuDraft.draft) ? <ContextText /> : null}
      <div
        tabIndex={-1}
        ref={boxRef}
        style={{
          textAlign: 'left',
        }}
        className={`markdown-body ${
          userSettings?.colorSchema === 'dark' ? 'markdown-body-dark' : ''
        }`}
      >
        <CustomMarkdown>
          {floatingContextMenuDraft.draft.replace(/^\s+/, '')}
        </CustomMarkdown>
      </div>
    </Stack>
  )
}

const ContextText: FC = () => {
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
      <span style={{ flexShrink: 0 }}>Context: </span>
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
