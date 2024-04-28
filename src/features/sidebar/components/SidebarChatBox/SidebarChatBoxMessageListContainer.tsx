import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import throttle from 'lodash-es/throttle'
import React, { FC, lazy, useEffect, useMemo, useRef, useState } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import { useFocus } from '@/features/common/hooks/useFocus'
import useInterval from '@/features/common/hooks/useInterval'
import useMessageListPaginator from '@/features/sidebar/hooks/useMessageListPaginator'
import { getMaxAISidebarRootElement } from '@/utils'

export const messageListContainerId = 'message-list-scroll-container'

const SidebarChatBoxMessageItem = lazy(
  () =>
    import(
      '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'
    ),
)

const messageItemOnReadyFlag = 'message-item-on-ready-flag'

interface IProps {
  conversationId: string
  messages: IChatMessage[]
  writingMessage: IChatMessage | null
  loading?: boolean
  sx?: SxProps
}

const SidebarChatBoxMessageListContainer: FC<IProps> = (props) => {
  const { conversationId, writingMessage, messages, loading, sx } = props

  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // 用于判断 当前触发的 effect 时是否需要滚动到底部
  const needScrollToBottomRef = useRef(true)

  const [messageItemIsReady, setMessageItemIsReady] = useState(false)
  // const { currentSidebarConversationType } = useSidebarSettings()

  const { slicedMessageList, changePageNumber } = useMessageListPaginator(
    !!(messageItemIsReady && conversationId),
    scrollContainerRef,
    messages,
  )

  // 用 interval 来找 message-item-on-ready-flag 元素
  // 用于判断 Suspense 是否完成
  // NOTE: 当然这是不干净的做法，如果找到了更好的做法需要替换
  useInterval(
    () => {
      const sidebarRoot = getMaxAISidebarRootElement()
      const messageItemOnReadyFlagElement = sidebarRoot?.querySelector(
        `#${messageItemOnReadyFlag}`,
      )
      if (messageItemOnReadyFlagElement) {
        setMessageItemIsReady(true)
      }
    },
    messageItemIsReady ? null : 200,
  )

  const handleScrollToBottom = (force = false) => {
    const containerElement = scrollContainerRef.current
    if (force) {
      needScrollToBottomRef.current = true
    }
    if (needScrollToBottomRef.current && containerElement) {
      containerElement.scrollTo(0, containerElement.scrollHeight)
    }
  }

  // messageItemIsReady 为 true 时，滚动到底部
  useEffect(() => {
    messageItemIsReady && handleScrollToBottom()
  }, [messageItemIsReady])

  const lastMessageType = useMemo(() => {
    if (slicedMessageList.length === 0) {
      return ''
    }
    return slicedMessageList[slicedMessageList.length - 1].type
  }, [slicedMessageList])

  // 当 loading 变化为 true 时，强制滚动到底部
  useEffect(() => {
    // 临时解决方案，为了保证在 付费卡点出现 时能够正常滚动到底部
    if (loading && lastMessageType === 'system') {
      handleScrollToBottom(true)
    }
    // 240401: 当用户输入信息后，此时 loading 为 true，writingMessage 为 null
    // 为了保证能正常滚动到底部，需要设置 needScrollToBottomRef 为 true
    // 在 writingMessage 更新后能够正常滚动到底部
    if (!writingMessage) {
      needScrollToBottomRef.current = true
      // 这里 return 是为了避免设置 needScrollToBottomRef 为 true 后立即滚动到底部
      // 因为用户有可能在 writingMessage 更新期间手动滚动导致 needScrollToBottomRef 变成 false
      return
    }
    // if (currentSidebarConversationType === 'Summary' && !writingMessage) {
    //   needScrollToBottomRef.current = true // 240401: 为了在 Summary 板块 chat 时能保证滚到到底部
    //   //加!writingMessage是因为为了summary nav切换的loading更新会滚动到最下面，应该保持在原来的位置
    //   //是因为 summary nav 功能切换的时候loading会为true而writingMessage为空
    //   return
    // }
    if (loading) {
      handleScrollToBottom()
      setTimeout(() => {
        changePageNumber(1)
      }, 0)
    }
  }, [loading, writingMessage, lastMessageType])

  console.log(`slicedMessageList`, loading, lastMessageType)

  useEffect(() => {
    if (writingMessage) {
      handleScrollToBottom()
    }
  }, [writingMessage])

  // 当 conversationId 变化时，强制滚动到底部
  useEffect(() => {
    if (messageItemIsReady && conversationId) {
      // conversationId 变换的时候，message 有几率为空数组导致页面没有 scrollHeight
      // 所以这里需要滚动两次，
      handleScrollToBottom(true)
      setTimeout(() => {
        changePageNumber(1)
        handleScrollToBottom(true)
      }, 500)
    }
  }, [messageItemIsReady && conversationId])

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
      const scrollTop = containerElement.scrollTop
      const scrollHeight = containerElement.scrollHeight
      const clientHeight = containerElement.clientHeight
      const isScrolledToBottom = clientHeight + scrollTop >= scrollHeight
      if (isScrolledToBottom) {
        needScrollToBottomRef.current = true
      }
    }

    const throttleHandleScroll = throttle(handleScroll, 100)
    containerElement.addEventListener('wheel', throttleHandleScroll)
    return () =>
      containerElement.removeEventListener('wheel', throttleHandleScroll)
  }, [])

  // 当页面 onfocus 时，判断 是否需要滚动到底部
  useFocus(handleScrollToBottom)

  // const lastScrollId = useRef('')
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     for (let i = messages.length - 1; i >= 0; i--) {
  //       const message = messages[i]
  //       if (message) {
  //         // if (message.type === 'user' || message.type === 'system') {
  //         const containerElement = scrollContainerRef.current
  //         if (
  //           lastScrollId.current &&
  //           lastScrollId.current !== message.messageId
  //         ) {
  //           needScrollToBottomRef.current = true
  //           setTimeout(() => {
  //             containerElement &&
  //               containerElement.scrollTo(0, containerElement.scrollHeight)
  //           }, 0)
  //         }
  //         lastScrollId.current = message.messageId
  //         break
  //       }
  //     }
  //   }
  // }, [messages])

  useEffect(() => {
    if (loading) {
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
  }, [loading, messages])

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
        <Box id={messageItemOnReadyFlag} />
        {slicedMessageList.map((message, index) => {
          return (
            <SidebarChatBoxMessageItem
              key={message.messageId + '_sidebar_chat_message_' + String(index)}
              className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
              message={message}
              loading={loading}
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
