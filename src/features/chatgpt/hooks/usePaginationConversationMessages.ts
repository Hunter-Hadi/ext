/**
 * 获取对话消息的分页数据
 * @param conversationId
 */
import { useInfiniteQuery } from '@tanstack/react-query'
import orderBy from 'lodash-es/orderBy'
import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import { PaginationConversationMessagesStateFamily } from '@/features/chatgpt/store'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { createIndexedDBQuery } from '@/features/indexed_db/utils'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

export const PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY =
  'PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY'
const PAGINATION_CONVERSATION_MESSAGES_QUERY_PAGE_SIZE = 10
const usePaginationConversationMessages = (conversationId: string) => {
  const { isLogin } = useAuthLogin()
  const [messages, setMessages] = useRecoilState(
    PaginationConversationMessagesStateFamily(conversationId),
  )
  const totalPageRef = useRef(0)
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY, conversationId],
      queryFn: async (data) => {
        // 从远程获取filter.page_size个对话消息
        const time = new Date().getTime()
        let diffTimeUsage = 0
        let remoteMessages: IChatMessage[] = []
        if (
          data.pageParam > totalPageRef.current ||
          totalPageRef.current === 0
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
        const offsetMessageIds = orderBy(
          filterMessageIds,
          ['created_at'],
          ['desc'],
        ).slice(offset, offset + limit)
        const paginationMessages = await createIndexedDBQuery('conversations')
          .messages.where('messageId')
          .anyOf(offsetMessageIds)
          .toArray()
          .then()
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
      enabled: conversationId !== '' && isLogin,
    })
  useEffect(() => {
    console.log(
      `ConversationDB[V3][对话消息列表] conversationId[${conversationId}]`,
      data?.pageParams,
    )
    // 反向遍历，保证消息列表是按照时间顺序排列， 用concat是为了避免直接修改messages
    const newMessages =
      data?.pages
        .map((page) => page)
        .reverse()
        .reduce((prev, current) => prev.concat(current), []) || []
    setMessages(newMessages)
  }, [data?.pages, setMessages])
  /**
   * 当conversationId变化时，重置totalPageRef
   */
  useEffect(() => {
    if (conversationId) {
      totalPageRef.current = 0
    }
  }, [conversationId])
  return {
    messages,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    pageNum: (data?.pageParams?.[data?.pageParams.length - 1] as number) || 0,
  }
}
export default usePaginationConversationMessages
