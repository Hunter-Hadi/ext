import { useRecoilState, useRecoilValue } from 'recoil'
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
  const { open } = useRecoilValue(FloatingDropdownMenuState)
  const { userSettings } = useRecoilValue(AppSettingsState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(FloatingDropdownMenuSystemItemsState)
  const [lastWritingMessage, setLastWritingMessage] = useState('')
  useEffect(() => {
    if (conversation.loading || !open) {
      setLastWritingMessage('')
    }
  }, [
    conversation.loading,
    open,
    floatingDropdownMenuSystemItems.selectContextMenuId,
  ])
  useEffect(() => {
    if (
      floatingDropdownMenuSystemItems.selectContextMenuId &&
      floatingDropdownMenuSystemItems.selectContextMenuId !== 'Continue writing'
    ) {
      setLastWritingMessage('')
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])
  useEffect(() => {
    if (conversation.writingMessage?.text) {
      setLastWritingMessage(conversation.writingMessage.text)
    }
  }, [conversation.writingMessage])
  useEffect(() => {
    if (!conversation.loading) {
      setFloatingDropdownMenuSystemItems((prev) => {
        return {
          ...prev,
          lastOutput: lastWritingMessage,
        }
      })
    }
  }, [conversation.loading, lastWritingMessage])
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
