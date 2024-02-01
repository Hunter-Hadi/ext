import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import { throttle } from 'lodash-es'
import React, { FC, useEffect, useRef } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import useMessageListPaginator from '@/features/sidebar/hooks/useMessageListPaginator'

export const messageListContainerId = 'message-list-scroll-container'

const SidebarChatBoxMessageItem = React.lazy(
  () =>
    import(
      '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'
    ),
)

interface IProps {
  messages: IChatMessage[]
  writingMessage: IChatMessage | null
  loading?: boolean
  sx?: SxProps
}

const SidebarChatBoxMessageListContainer: FC<IProps> = (props) => {
  const { writingMessage, messages, loading, sx } = props

  const scrollContainerRef = useRef<HTMLElement | null>(null)

  const scrolledToBottomRef = useRef(true)

  const { slicedMessageList } = useMessageListPaginator(messages, {
    scrollContainerId: messageListContainerId,
  })

  useEffect(() => {
    const containerElement = scrollContainerRef.current
    if (scrolledToBottomRef.current && containerElement) {
      containerElement.scrollTo(0, containerElement.scrollHeight)
    }
  }, [writingMessage])

  useEffect(() => {
    if (loading) {
      // 这里的 scrollToBottom 需要兼容 search / summary 的情况
      // 当在 loading 时，如果最后一条消息是 search / summary
      // 判断 scrolledToBottomRef.current 为 true 时滚动到底部
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        const lastMessageOriginalData = (lastMessage as IAIResponseMessage)
          ?.originalMessage
        if (
          lastMessageOriginalData &&
          (lastMessageOriginalData.metadata?.shareType === 'search' ||
            lastMessageOriginalData.metadata?.shareType === 'summary')
        ) {
          const containerElement = scrollContainerRef.current
          if (scrolledToBottomRef.current && containerElement) {
            containerElement.scrollTo(0, containerElement.scrollHeight)
          }
        }
      }
    }
  }, [loading, messages])

  useEffect(() => {
    const containerElement = scrollContainerRef.current
    if (!containerElement) {
      return
    }
    const handleScroll = (event: any) => {
      if (event.deltaY < 0) {
        scrolledToBottomRef.current = false
        return
      }
      const scrollTop = containerElement.scrollTop
      const scrollHeight = containerElement.scrollHeight
      const clientHeight = containerElement.clientHeight
      const isScrolledToBottom = clientHeight + scrollTop >= scrollHeight
      if (isScrolledToBottom) {
        scrolledToBottomRef.current = true
      }
    }

    const throttleHandleScroll = throttle(handleScroll, 100)
    containerElement.addEventListener('wheel', throttleHandleScroll)
    return () =>
      containerElement.removeEventListener('wheel', throttleHandleScroll)
  }, [])

  useEffect(() => {
    // 当页面 onfocus 时，需要判断 scrolledToBottomRef.current 是否为 true
    const focusListener = () => {
      const containerElement = scrollContainerRef.current
      if (containerElement) {
        scrolledToBottomRef.current &&
          containerElement.scrollTo(0, containerElement.scrollHeight)

        // TODO
        /**
         * 待优化的点
         * 现在只是用 setTimeout 来等待 SidebarChatBoxMessageItem Suspense 完成的延迟
         * 正确的做法应该是在 SidebarChatBoxMessageItem Suspense 完成时触发一个 callback 来让 scrolledToBottomRef滚动至底部
         * 不过还没找到正确方法
         */
        setTimeout(() => {
          scrolledToBottomRef.current &&
            containerElement.scrollTo(0, containerElement.scrollHeight)
        }, 1000)
      }
    }

    focusListener()
    window.addEventListener('focus', focusListener)
    return () => window.removeEventListener('focus', focusListener)
  }, [])

  const lastScrollId = useRef('')
  useEffect(() => {
    if (messages.length > 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i]
        if (message) {
          // if (message.type === 'user' || message.type === 'system') {
          const containerElement = scrollContainerRef.current
          if (
            lastScrollId.current &&
            lastScrollId.current !== message.messageId
          ) {
            scrolledToBottomRef.current = true
            setTimeout(() => {
              containerElement &&
                containerElement.scrollTo(0, containerElement.scrollHeight)
            }, 0)
          }
          lastScrollId.current = message.messageId
          break
        }
      }
    }
  }, [messages])

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
      <AppSuspenseLoadingLayout>
        {slicedMessageList.map((message, index) => {
          return (
            <SidebarChatBoxMessageItem
              key={message.messageId + '_sidebar_chat_message_' + String(index)}
              className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
              message={message}
              loading={false}
              order={index + 1}
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
            loading={true}
            order={-1}
          />
        ) : null}
      </AppSuspenseLoadingLayout>
    </Box>
  )
}

export default SidebarChatBoxMessageListContainer
