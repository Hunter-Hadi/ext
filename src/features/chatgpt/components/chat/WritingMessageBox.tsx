import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail'
import Stack from '@mui/material/Stack'
import React, { useEffect, useState } from 'react'
import { AppSettingsState } from '@/store'
import CustomMarkdown from '@/components/CustomMarkdown'
import {
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu'

const WritingMessageBox = () => {
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const { userSettings } = useRecoilValue(AppSettingsState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const setFloatingDropdownMenuSystemItems = useSetRecoilState(
    FloatingDropdownMenuSystemItemsState,
  )
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
      setLastWritingMessage(conversation.writingMessage.text)
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
