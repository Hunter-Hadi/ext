import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import last from 'lodash-es/last'
import throttle from 'lodash-es/throttle'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'

import usePaginationConversationMessages from '@/features/chatgpt/hooks/usePaginationConversationMessages'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import useBlur from '@/features/common/hooks/useBlur'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import SidebarChatBoxMessageItem from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'

export const messageListContainerId = 'message-list-scroll-container'

interface IProps {
  conversationId: string
  writingMessage: IChatMessage | null
  isAIResponding?: boolean
  sx?: SxProps
  onLoadingChatMessages?: (isLoading: boolean) => void
  onFetchingNextPage?: (isFetchingNextPage: boolean) => void
  tooltipContainer?: HTMLElement
}

const SidebarChatBoxMessageListContainer: FC<IProps> = (props) => {
  const {
    writingMessage,
    isAIResponding,
    sx,
    // onLoadingChatMessages,
    // onFetchingNextPage,
    conversationId,
    tooltipContainer: container,
  } = props

  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // 新增的消息不是通过分页加载到messages里的，是直接插入的
  const lastMessageIdRef = useRef<string | null>(null)
  const {
    paginationMessages: queryPaginationMessages,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    fetchNextPage,
    getPreviousPageLastMessageId,
    resetPreviousPageLastMessageId,
    lastPaginationMessageIdRef,
  } = usePaginationConversationMessages(conversationId || '')

  const paginationMessages = useMemo(() => {
    if (
      queryPaginationMessages.length === 0 ||
      queryPaginationMessages[0].conversationId === conversationId
    )
      return queryPaginationMessages
    return []
  }, [queryPaginationMessages, conversationId])

  const loadMore = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) {
      return
    }
    // load next page
    fetchNextPage().then().catch()
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])
  const loadMoreRef = useRef(loadMore)
  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore])

  const handleScrollToMessage = (messageId: string) => {
    const containerElement = scrollContainerRef.current
    if (!containerElement) {
      return
    }
    const messageElements = containerElement.querySelectorAll(
      `[data-message-id]`,
    ) as NodeListOf<HTMLElement>
    const messageElementIndex = Array.from(messageElements).findIndex(
      (element) => element.getAttribute('data-message-id') === messageId,
    )
    const messageElement = messageElements[messageElementIndex]
    // 如果是向上滚动，需要滚动到 messageElement 的顶部
    // 如果是向下滚动，需要滚动到 messageElement 的底部
    const isLastMessage = messageElementIndex === messageElements.length - 1
    if (messageElement) {
      console.log(
        `scroll to message: ${messageId}`,
        isLastMessage,
        messageElement?.offsetTop + messageElement?.offsetHeight,
        containerElement?.scrollHeight,
      )
      containerElement.scrollTo(
        0,
        isLastMessage
          ? containerElement?.scrollHeight
          : messageElement.offsetTop,
      )
    }
  }

  const handleScrollToBottom = () => {
    const containerElement = scrollContainerRef.current
    if (containerElement) {
      containerElement.scrollTo(0, containerElement.scrollHeight)
    }
  }
  const messageHeightUpdate = () => {
    if (!scrollContainerRef.current) {
      return
    }
    const previousPageLastMessageId = getPreviousPageLastMessageId()
    if (previousPageLastMessageId) {
      // 滚动到上一页的第一条消息
      handleScrollToMessage(previousPageLastMessageId)
    } else {
      console.log(`scroll to message effect nothing`)
    }
  }

  useEffect(() => {
    const containerElement = scrollContainerRef.current
    if (!containerElement) {
      return
    }
    const handleScroll = (event: any) => {
      const scrollTop = containerElement.scrollTop
      const scrollHeight = containerElement.scrollHeight
      const clientHeight = containerElement.clientHeight
      const isScrolledToBottom = clientHeight + scrollTop >= scrollHeight
      // 小于0表示往上滚动
      if (event.deltaY < 0) {
        resetPreviousPageLastMessageId('')
        if (containerElement.scrollTop <= containerElement.offsetHeight / 10) {
          // load more
          loadMoreRef.current()
        }
        return
      } else {
        // 判断是否滚动到底部
        if (isScrolledToBottom) {
          if (lastMessageIdRef.current) {
            console.log(
              `scroll to message [手动滚动到底部]`,
              lastMessageIdRef.current,
            )
            resetPreviousPageLastMessageId(lastMessageIdRef.current)
          }
        }
      }
    }

    const throttleHandleScroll = throttle(handleScroll, 100)
    containerElement.addEventListener('wheel', throttleHandleScroll)
    return () =>
      containerElement.removeEventListener('wheel', throttleHandleScroll)
  }, [])

  /**
   * 如果在其他页面更新了消息，在focus的时候需要滚动到最新消息
   */
  const blurMessageIdRef = useRef<string | null>(null)
  useBlur(() => {
    blurMessageIdRef.current = lastMessageIdRef.current
  })
  useEffect(() => {
    if (blurMessageIdRef.current) {
      const lastPaginationMessage = last(paginationMessages)
      if (lastPaginationMessage?.messageId !== blurMessageIdRef.current) {
        console.log(`scroll to message [失去焦点]`, blurMessageIdRef.current)
        handleScrollToBottom()
      }
      blurMessageIdRef.current = null
    }
  }, [paginationMessages])
  const prevPaginationMessagesLengthRef = useRef(paginationMessages.length)
  useEffect(() => {
    const writingMessageId = writingMessage?.messageId || ''
    if (
      writingMessageId &&
      !paginationMessages.find((msg) => msg.messageId === writingMessageId)
    ) {
      lastMessageIdRef.current = writingMessageId
      console.log(`scroll to message [最新消息]`, lastMessageIdRef.current)
      resetPreviousPageLastMessageId(writingMessageId)
    } else {
      // 因为art/search板块的新消息没有writingMessage，所以需要在这里处理
      if (
        lastPaginationMessageIdRef.current &&
        lastPaginationMessageIdRef.current ===
          last(paginationMessages)?.messageId
      ) {
        // 因为手动上滑要清除lastMessageIdRef.current
        // 通过分页数量的区别来判断新消息，并且只设置一次
        if (
          prevPaginationMessagesLengthRef.current !== paginationMessages.length
        ) {
          console.log(
            `scroll to message [列表最后信息]`,
            lastMessageIdRef.current,
          )
          lastMessageIdRef.current = lastPaginationMessageIdRef.current
          resetPreviousPageLastMessageId(lastPaginationMessageIdRef.current)
        }
      } else {
        console.log(
          `scroll to message [列表最后信息]`,
          lastMessageIdRef.current,
        )
      }
      prevPaginationMessagesLengthRef.current = paginationMessages.length
    }
  }, [writingMessage?.messageId, paginationMessages])

  // useEffect(() => {
  //   onLoadingChatMessages?.(isLoading)
  // }, [isLoading])
  // useEffect(() => {
  //   onFetchingNextPage?.(isFetchingNextPage)
  // }, [isFetchingNextPage])
  // return (
  //   <>
  //     <Typography color={'text.primary'}>
  //       {paginationMessages.length}
  //       {isFetchingNextPage ? `fetching...` : ''}
  //     </Typography>
  //     <Button
  //       disabled={isFetchingNextPage || !hasNextPage}
  //       onClick={() => fetchNextPage()}
  //     >
  //       Fetch next page
  //     </Button>
  //   </>
  // )
  return (
    <Box
      ref={scrollContainerRef}
      id={messageListContainerId}
      sx={{
        flex: 1,
        height: 0,
        overflowY: 'auto',
        display: paginationMessages.length > 0 ? 'block' : 'none',
        ...sx,
      }}
    >
      {isFetchingNextPage && (
        <Stack
          width={'100%'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{
            my: '16px',
          }}
        >
          <CircularProgress size={16} sx={{ m: '0 auto' }} />
        </Stack>
      )}
      <AppLoadingLayout loading={isLoading}>
        {paginationMessages.map((message, index) => {
          return (
            <SidebarChatBoxMessageItem
              key={message.messageId + '_sidebar_chat_message_' + String(index)}
              className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
              message={message}
              loading={isAIResponding}
              order={index + 1}
              onChangeHeight={messageHeightUpdate}
              container={container}
            />
          )
        })}
      </AppLoadingLayout>
      {/* 如果 writingMessage.messageId 在 messages 中存在，则不渲染 */}
      {writingMessage &&
      !paginationMessages.find(
        (msg) => msg.messageId === writingMessage.messageId,
      ) ? (
        <SidebarChatBoxMessageItem
          className={'use-chat-gpt-ai__writing-message-item'}
          message={writingMessage}
          loading={true}
          order={-1}
          onChangeHeight={messageHeightUpdate}
        />
      ) : null}
    </Box>
  )
}
export default SidebarChatBoxMessageListContainer
