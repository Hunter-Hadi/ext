import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import cloneDeep from 'lodash-es/cloneDeep'
import throttle from 'lodash-es/throttle'
import React, { FC, useEffect, useRef, useState } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import usePaginationConversationMessages from '@/features/chatgpt/hooks/usePaginationConversationMessages'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import { useFocus } from '@/features/common/hooks/useFocus'
import {
  IAIResponseMessage,
  IChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import SidebarChatBoxMessageItem from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'
import SidebarMessagesListWrapper from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarMessagesList'

export const messageListContainerId = 'message-list-scroll-container'

const messageItemOnReadyFlag = 'message-item-on-ready-flag'

interface IProps {
  conversationId: string
  writingMessage: IChatMessage | null
  isAIResponding?: boolean
  onLoadingChatHistory?: (loading: boolean) => void
  sx?: SxProps
}

const SidebarChatBoxMessageListContainer: FC<IProps> = (props) => {
  const {
    conversationId,
    writingMessage,
    isAIResponding,
    sx,
    onLoadingChatHistory,
  } = props

  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // 用于判断 当前触发的 effect 时是否需要滚动到底部
  const needScrollToBottomRef = useRef(true)

  const [messageItemIsReady, setMessageItemIsReady] = useState(false)

  const { currentConversationId } = useClientConversation()
  const {
    isLoading,
    messages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePaginationConversationMessages(currentConversationId || '')
  const [m2, setM2] = useState<IChatMessage[]>([])
  useEffect(() => {
    setM2(cloneDeep(messages))
  }, [messages])

  const handleScrollToBottom = (force = false) => {
    // TODO
  }

  // 当用户主动滚动 message list 时，如果滚动到底部，设置 needScrollToBottomRef.current 为 true
  // 当用户主动滚动 message list 时，如果往顶部滚动，设置 needScrollToBottomRef.current 为 false
  useEffect(() => {
    const containerElement = scrollContainerRef.current
    if (!containerElement) {
      return
    }
    const handleScroll = (event: any) => {
      if (event.deltaY < 0) {
        needScrollToBottomRef.current = false
        return
      }
    }

    const throttleHandleScroll = throttle(handleScroll, 100)
    containerElement.addEventListener('wheel', throttleHandleScroll)
    return () =>
      containerElement.removeEventListener('wheel', throttleHandleScroll)
  }, [])

  // 当页面 onfocus 时，判断 是否需要滚动到底部
  useFocus(handleScrollToBottom)

  /**
   * 发消息的时候，如果最后一条消息是 search / summary / art，需要滚动到底部
   */
  useEffect(() => {
    if (isAIResponding) {
      // 这里的 scrollToBottom 需要兼容 search / summary 的情况
      // 当在 loading 时，如果最后一条消息是 search / summary
      // 判断 needScrollToBottomRef.current 为 true 时滚动到底部
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        const lastMessageOriginalData = (lastMessage as IAIResponseMessage)
          ?.originalMessage
        if (
          lastMessageOriginalData &&
          (lastMessageOriginalData.metadata?.shareType === 'search' ||
            lastMessageOriginalData.metadata?.shareType === 'summary' ||
            lastMessageOriginalData.metadata?.shareType === 'art')
        ) {
          handleScrollToBottom()
        }
      }
    }
  }, [isAIResponding, messages])

  useEffect(() => {
    if (onLoadingChatHistory) {
      onLoadingChatHistory(isLoading)
    }
  }, [isLoading, onLoadingChatHistory])
  console.log('AutoSizer2 render list', messages.length, messages)
  return (
    <Box
      ref={scrollContainerRef}
      id={messageListContainerId}
      sx={{
        flex: 1,
        height: 0,
        overflowY: 'auto',
        ...sx,
      }}
    >
      <AppLoadingLayout loading={isLoading} />
      {!isLoading && <Box id={messageItemOnReadyFlag} />}
      {isFetchingNextPage && (
        <Stack width={'100%'} alignItems={'center'} justifyContent={'center'}>
          <AppLoadingLayout loading={true} />
        </Stack>
      )}
      <SidebarMessagesListWrapper
        messages={m2}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      {/* 如果 writingMessage.messageId 在 slicedMessageList 中存在，则不渲染 */}
      {writingMessage &&
      !messages.find((msg) => msg.messageId === writingMessage.messageId) ? (
        <SidebarChatBoxMessageItem
          className={'use-chat-gpt-ai__writing-message-item'}
          message={writingMessage}
          loading={true}
          order={-1}
        />
      ) : null}
    </Box>
  )
}
export default SidebarChatBoxMessageListContainer
