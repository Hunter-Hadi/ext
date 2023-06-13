import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useRef, useState } from 'react'
import { AppSettingsState } from '@/store'
import CustomMarkdown from '@/components/CustomMarkdown'
import {
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu'

const WritingMessageBox: FC<{
  onChange?: (value: string) => void
}> = (props) => {
  const { onChange } = props
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const { userSettings } = useRecoilValue(AppSettingsState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const setFloatingDropdownMenuSystemItems = useSetRecoilState(
    FloatingDropdownMenuSystemItemsState,
  )
  const messagesRef = useRef<string[]>([])
  const [lastWritingMessage, setLastWritingMessage] = useState('')
  useEffect(() => {
    if (!floatingDropdownMenu.open) {
      console.log('AIInput writingMessage remove: ', floatingDropdownMenu.open)
      setLastWritingMessage('')
    }
  }, [floatingDropdownMenu.open])
  useEffect(() => {
    if (conversation.writingMessage?.text) {
      console.log('AIInput writingMessage update: ', lastWritingMessage)
      const text = conversation.writingMessage.text
      const lastMessageIndex = Math.max(messagesRef.current.length - 1, 0)
      const lastMessage = messagesRef.current[lastMessageIndex] || ''
      if (text.length < lastMessage.length) {
        // 说明新增了一行
        messagesRef.current.push(text)
      } else {
        messagesRef.current[lastMessageIndex] = text
      }
      console.log(messagesRef.current, 'Context menu')
      setLastWritingMessage(messagesRef.current.join('\n'))
    }
  }, [conversation.writingMessage])
  useEffect(() => {
    console.log('AIInput update: ', lastWritingMessage)
    setFloatingDropdownMenuSystemItems((prev) => {
      return {
        ...prev,
        lastOutput: lastWritingMessage,
      }
    })
    onChange?.(lastWritingMessage)
  }, [lastWritingMessage])
  return (
    <Stack>
      <div
        className={`markdown-body ${
          userSettings?.colorSchema === 'dark' ? 'markdown-body--dark' : ''
        }`}
      >
        <CustomMarkdown>
          {lastWritingMessage.replace(/^\s+/, '')}
        </CustomMarkdown>
      </div>
    </Stack>
  )
}
export default WritingMessageBox
