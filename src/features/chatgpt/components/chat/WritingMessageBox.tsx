import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect } from 'react'
import { AppSettingsState } from '@/store'
import CustomMarkdown from '@/components/CustomMarkdown'
import {
  FloatingContextMenuDraftState,
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu/store'
import cloneDeep from 'lodash-es/cloneDeep'

const WritingMessageBox: FC<{
  onChange?: (value: string) => void
}> = (props) => {
  const { onChange } = props
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const { userSettings } = useRecoilValue(AppSettingsState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(FloatingDropdownMenuSystemItemsState)
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
  /**
   * 当用户选择Try again
   */
  useEffect(() => {
    if (floatingDropdownMenuSystemItems.selectContextMenuId === 'Try again') {
      setFloatingContextMenuDraft((prevState) => {
        if (prevState.draftList.length === 0) {
          return prevState
        }
        const copyDraftList = cloneDeep(prevState.draftList)
        copyDraftList.pop()
        return {
          draft: copyDraftList.join('\n\n').replace(/\n{2,}/, '\n\n'),
          draftList: copyDraftList,
        }
      })
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])
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
export default WritingMessageBox
