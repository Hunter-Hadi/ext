/**
 * 获取对话消息的分页数据
 * @param conversationId
 */
import { useInfiniteQuery } from '@tanstack/react-query'
import first from 'lodash-es/first'
import last from 'lodash-es/last'
import orderBy from 'lodash-es/orderBy'
import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import useMaxAIBetaFeatures from '@/features/auth/hooks/useMaxAIBetaFeatures'
import { PaginationConversationMessagesStateFamily } from '@/features/chatgpt/store'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

export const PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY =
  'PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY'
const PAGINATION_CONVERSATION_MESSAGES_QUERY_PAGE_SIZE = 10
const usePaginationConversationMessages = (conversationId: string) => {
  const { isLogin } = useAuthLogin()
  const { maxAIBetaFeaturesLoaded, maxAIBetaFeatures } = useMaxAIBetaFeatures()
  const [paginationMessages, setPaginationMessages] = useRecoilState(
    PaginationConversationMessagesStateFamily(conversationId),
  )
  const totalPageRef = useRef(0)
  const remoteConversationMesssagesPageLoadedRef = useRef<
    Record<number, boolean>
  >({})
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      PAGINATION_CONVERSATION_MESSAGES_QUERY_KEY,
      conversationId,
      maxAIBetaFeatures.chat_sync,
    ],
    queryFn: async (data) => {
      // 从远程获取filter.page_size个对话消息
      const time = new Date().getTime()
      let diffTimeUsage = 0
      let remoteMessages: IChatMessage[] = []

      if (
        maxAIBetaFeatures.chat_sync &&
        totalPageRef.current >= data.pageParam &&
        !remoteConversationMesssagesPageLoadedRef.current[data.pageParam]
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
        if (result?.data?.status === 'OK') {
          remoteConversationMesssagesPageLoadedRef.current[data.pageParam] =
            true
          totalPageRef.current = Math.max(result.data?.total_page || 0, 0)
        }
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
    enabled: conversationId !== '' && isLogin && maxAIBetaFeaturesLoaded,
    refetchOnWindowFocus: false,
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
    // 反向遍历，保证消息列表是按照时间顺序排列， 用concat是为了避免直接修改messages
    const newMessages = last(data?.pages)
    if (newMessages) {
      setPaginationMessages((previousMessages) => {
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
        const finalMessageList = orderBy(
          data?.pages.flat() || [],
          ['created_at'],
          ['asc'],
        )
        lastPaginationMessageIdRef.current =
          last(finalMessageList)?.messageId || ''
        console.log(
          `ConversationDB[V3][对话消息列表] conversationId [effect][${conversationId}]`,
          data?.pageParams,
          data?.pages,
          finalMessageList,
        )
        return finalMessageList
      })
    }
  }, [data?.pages])

  const isFetchingRef = useRef(false)
  const isRefetchingRef = useRef(false)
  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage
  }, [isFetchingNextPage])

  useEffect(() => {
    const unsubscribe = OneShotCommunicator.receive(
      'ConversationMessagesUpdate',
      async (data) => {
        const { changeType, messageIds } = data
        switch (changeType) {
          case 'update': {
            const messages =
              await ClientConversationMessageManager.getMessagesByMessageIds(
                messageIds,
              )
            console.log(
              `ConversationDB[V3][对话消息列表] conversationId [update]`,
              messages,
            )
            if (messages.length) {
              const newMessagesMap = new Map<string, IChatMessage>()
              messages.forEach((message) => {
                newMessagesMap.set(message.messageId, message)
              })
              setPaginationMessages((previousMessages) => {
                return previousMessages.map((message) => {
                  return newMessagesMap.get(message.messageId) || message
                })
              })
            }
            break
          }
          case 'delete':
          case 'add': {
            if (!isFetchingRef.current && !isRefetchingRef.current) {
              isRefetchingRef.current = true
              refetch()
                .then()
                .catch()
                .finally(() => {
                  isRefetchingRef.current = false
                })
              break
            }
            return true
          }
        }
        return undefined
      },
    )

    return () => unsubscribe()
  }, [refetch, setPaginationMessages])

  useEffect(() => {
    const listener = () => {
      if (!isFetchingRef.current && !isRefetchingRef.current) {
        isRefetchingRef.current = true
        refetch()
          .then()
          .catch()
          .finally(() => {
            isRefetchingRef.current = false
          })
      }
    }
    window.addEventListener('focus', listener)
    return () => {
      window.removeEventListener('focus', listener)
    }
  }, [])

  /**
   * 当conversationId变化时，重置totalPageRef
   */
  useEffect(() => {
    if (conversationId) {
      totalPageRef.current = 0
      remoteConversationMesssagesPageLoadedRef.current = {}
    }
  }, [conversationId])
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
