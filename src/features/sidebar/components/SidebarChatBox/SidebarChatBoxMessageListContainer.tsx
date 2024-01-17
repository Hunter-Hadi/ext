import { Box } from '@mui/material'
import React, { FC } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { IChatMessage } from '@/features/chatgpt/types'
import { scrollContainerId } from '@/features/sidebar/components/SidebarChatBox'
import useMessageListPaginator from '@/features/sidebar/hooks/useMessageListPaginator'

export const messageListContainerId = 'message-list-container'

const SidebarChatBoxMessageItem = React.lazy(
  () =>
    import(
      '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'
    ),
)

interface IProps {
  messages: IChatMessage[]
  writingMessage: IChatMessage | null
}

const SidebarChatBoxMessageListContainer: FC<IProps> = (props) => {
  const { writingMessage, messages } = props
  const { slicedMessageList } = useMessageListPaginator(messages, {
    scrollContainerId: scrollContainerId,
  })

  return (
    <Box id={messageListContainerId}>
      <AppSuspenseLoadingLayout>
        {slicedMessageList.map((message, index) => {
          return (
            <SidebarChatBoxMessageItem
              key={message.messageId + '_sidebar_chat_message_' + String(index)}
              className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
              message={message}
            />
          )
        })}
        {/* 如果 writingMessage.messageId 在 slicedMessageList 中存在，则不渲染 */}
        {writingMessage &&
        !slicedMessageList.find(
          (msg) => msg.messageId === writingMessage.messageId,
        ) ? (
          <SidebarChatBoxMessageItem
            className={'use-chat-gpt-ai__writing-message-item'}
            message={writingMessage}
          />
        ) : null}
      </AppSuspenseLoadingLayout>
    </Box>
  )
}

export default SidebarChatBoxMessageListContainer
