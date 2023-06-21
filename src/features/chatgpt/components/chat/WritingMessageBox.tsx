import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useMemo } from 'react'
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
    if (conversation.writingMessage?.text) {
      const writingMessageText = conversation.writingMessage.text
      // ChatGPT 有可能第一个回答会返回之前的问题，所以删掉
      if (writingMessageText.includes(CHAT_GPT_PROMPT_PREFIX)) {
        setFloatingContextMenuDraft((prevState) => {
          console.log(prevState.draftList)
          debugger
          return prevState
        })
        return
      }
      setFloatingContextMenuDraft((prevState) => {
        const copyDraftList = cloneDeep(prevState.draftList)
        const lastMessageIndex = Math.max(copyDraftList.length - 1, 0)
        const lastMessage = copyDraftList[lastMessageIndex] || ''
        if (writingMessageText.length < lastMessage.length) {
          // 说明新增了一行
          console.log(
            'AIInput writingMessage update new line: ',
            writingMessageText,
          )
          copyDraftList.push(writingMessageText)
        } else {
          console.log('AIInput writingMessage update: ', writingMessageText)
          copyDraftList[lastMessageIndex] = writingMessageText
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
          '& p:last-child': {
            mb: '1em',
          },
        },
      }}
    >
      {isEmpty(floatingContextMenuDraft.draft) ? <ContextText /> : null}
      <div
        ref={boxRef}
        className={`markdown-body ${
          userSettings?.colorSchema === 'dark' ? 'markdown-body--dark' : ''
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
    if (currentSelection?.selectionElement?.selectionText) {
      const context = currentSelection.selectionElement.selectionText
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
