/**
 * 获取对话消息的分页数据
 * @param conversationId
 */
import { useInfiniteQuery } from '@tanstack/react-query'
import first from 'lodash-es/first'
import last from 'lodash-es/last'
import orderBy from 'lodash-es/orderBy'
import { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'

import { clientGetMaxAIBetaFeatureSettings } from '@/background/utils/maxAIBetaFeatureSettings/client'
import { useAuthLogin } from '@/features/auth'
import { PaginationConversationMessagesStateFamily } from '@/features/chatgpt/store'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

export const PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY =
  'PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY'
const PAGINATION_CONVERSATION_MESSAGES_QUERY_PAGE_SIZE = 10
const usePaginationConversationMessages = (conversationId: string) => {
  const { isLogin } = useAuthLogin()
  const [loaded, setLoaded] = useState(false)
  const [paginationMessages, setMessages] = useRecoilState(
    PaginationConversationMessagesStateFamily(conversationId),
  )
  const totalPageRef = useRef(0)
  // 是否开启了云同步功能
  const enableSyncFeatureRef = useRef(false)
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY, conversationId],
      queryFn: async (data) => {
        // 从远程获取filter.page_size个对话消息
        const time = new Date().getTime()
        let diffTimeUsage = 0
        let remoteMessages: IChatMessage[] = []
        if (
          enableSyncFeatureRef.current &&
          (totalPageRef.current >= data.pageParam || totalPageRef.current === 0)
        ) {
          const result = await clientFetchMaxAIAPI<{
            current_page: number
            current_page_size: number
            data: IChatMessage[]
            msg: string
            status: string
            total_page: number
          }>(`/conversation/get_messages_after_datetime`, {
            conversation_id: conversationId,
            page: data.pageParam,
            page_size: PAGINATION_CONVERSATION_MESSAGES_QUERY_PAGE_SIZE,
          })
          totalPageRef.current = Math.max(result.data?.total_page || 0, 0)
          if (result?.data?.data) {
            remoteMessages = result.data.data
            await ClientConversationMessageManager.diffRemoteConversationMessagesData(
              conversationId,
              remoteMessages,
            )
          }
          diffTimeUsage = new Date().getTime() - time
        }
        // 从本地获取filter.page_size个对话消息
        const filterMessageIds =
          await ClientConversationMessageManager.getMessageIds(conversationId)
        const offset =
          data.pageParam * PAGINATION_CONVERSATION_MESSAGES_QUERY_PAGE_SIZE
        const limit = PAGINATION_CONVERSATION_MESSAGES_QUERY_PAGE_SIZE
        const offsetMessageIds = filterMessageIds.slice(offset, offset + limit)
        const paginationMessages =
          await ClientConversationMessageManager.getMessagesByMessageIds(
            offsetMessageIds,
          )
        console.log(
          `ConversationDB[V3][对话消息列表] 远程API耗时[${diffTimeUsage}]ms, 获取消息列表[${
            data.pageParam
          }][${paginationMessages.length}]耗时[${
            new Date().getTime() - time - diffTimeUsage
          }]ms`,
        )
        // await new Promise((resolve) => setTimeout(resolve, 3000))
        return paginationMessages
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        // 说明本地和远程都没有数据
        if (lastPage.length === 0) {
          // console.log(
          //   `ConversationDB[V3][对话消息列表] 获取列表[${lastPageParam}]没有数据`,
          // )
          return undefined
        }
        return lastPageParam + 1
      },
      enabled: conversationId !== '' && isLogin && loaded,
    })
  const lastPaginationMessageIdRef = useRef<string>('')
  const previousPageLastMessageIdRef = useRef<{
    messageId: string
    times: number
  }>({
    messageId: '',
    times: 0,
  })
  const getPreviousPageLastMessageId = () => {
    if (previousPageLastMessageIdRef.current.messageId) {
      previousPageLastMessageIdRef.current = {
        messageId: previousPageLastMessageIdRef.current.messageId,
        times: previousPageLastMessageIdRef.current.times + 1,
      }
      return previousPageLastMessageIdRef.current.messageId
    }
    return ''
  }
  const resetPreviousPageLastMessageId = (resetMessageId: string) => {
    if (
      (resetMessageId === '' &&
        previousPageLastMessageIdRef.current.times > 0) ||
      resetMessageId
    ) {
      if (resetMessageId === previousPageLastMessageIdRef.current.messageId) {
        return
      }
      if (resetMessageId) {
        console.log(`scroll to message [重置为] [${resetMessageId}]`)
      } else {
        console.log(`scroll to message [重置为空]`)
      }
      previousPageLastMessageIdRef.current = {
        messageId: resetMessageId,
        times: 0,
      }
    }
  }
  useEffect(() => {
    console.log(
      `ConversationDB[V3][对话消息列表] conversationId[${conversationId}]`,
      data?.pageParams,
      data?.pages,
    )
    // 反向遍历，保证消息列表是按照时间顺序排列， 用concat是为了避免直接修改messages
    const newMessages = last(data?.pages)
    if (newMessages) {
      setMessages((previousMessages) => {
        if (data?.pages.length) {
          if (data?.pages.length > 1) {
            // 如果分页大于1，取上一页的最后一个消息，其实就是messages的第一条消息
            const previousPageLastMessageId = previousMessages?.[0]?.messageId
            if (previousPageLastMessageId) {
              console.log(
                `scroll to message [分页] id: ${previousPageLastMessageId}`,
              )
              previousPageLastMessageIdRef.current = {
                messageId: previousPageLastMessageId,
                times: 0,
              }
            }
          } else if (data?.pages.length === 1) {
            // 第一页的第一个消息
            const renderScrollMessageId = first(data.pages[0])?.messageId
            if (renderScrollMessageId) {
              console.log(
                `scroll to message [首次] id: ${renderScrollMessageId}`,
              )
              previousPageLastMessageIdRef.current = {
                messageId: renderScrollMessageId,
                times: 0,
              }
            }
          }
        }
        // 基于updated_at和messageId更新
        const newMessagesMap = new Map<string, IChatMessage>()
        newMessages.forEach((message) => {
          newMessagesMap.set(message.messageId, message)
        })
        const newList = previousMessages.map((message) => {
          const newMessage = newMessagesMap.get(message.messageId)
          if (newMessage) {
            newMessagesMap.delete(message.messageId)
            if (
              newMessage?.updated_at &&
              message?.updated_at &&
              new Date(newMessage.updated_at).getTime() >=
                new Date(message.updated_at).getTime()
            ) {
              return newMessage
            }
          }
          return message
        })
        // 添加新的消息
        const newMessageList = [
          ...newList,
          ...Array.from(newMessagesMap.values()),
        ]
        const finalMessageList = orderBy(
          newMessageList,
          ['created_at'],
          ['asc'],
        )
        lastPaginationMessageIdRef.current =
          last(finalMessageList)?.messageId || ''
        return finalMessageList
      })
    }
  }, [data?.pages])
  /**
   * 当conversationId变化时，重置totalPageRef
   */
  useEffect(() => {
    if (conversationId) {
      totalPageRef.current = 0
    }
  }, [conversationId])
  useEffect(() => {
    clientGetMaxAIBetaFeatureSettings().then((settings) => {
      enableSyncFeatureRef.current = settings.chat_sync
      setLoaded(true)
    })
  }, [])
  return {
    data,
    paginationMessages,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    lastPaginationMessageIdRef,
    getPreviousPageLastMessageId,
    resetPreviousPageLastMessageId,
  }
}
export default usePaginationConversationMessages
