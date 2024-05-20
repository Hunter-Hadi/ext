import { useInfiniteQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import {
  PaginationConversationsFilterState,
  PaginationConversationsFilterType,
  PaginationConversationsState,
} from '@/features/chatgpt/store'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import {
  IConversation,
  IPaginationConversation,
} from '@/features/indexed_db/conversations/models/Conversation'
import {
  clientUseIndexedDB,
  createIndexedDBQuery,
  dbSift,
} from '@/features/indexed_db/utils'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

export const PAGINATION_CONVERSATION_QUERY_KEY =
  'PAGINATION_CONVERSATION_QUERY_KEY'

const conversationsToPaginationConversations = async (
  conversations: IConversation[],
) => {
  const paginationConversations = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = conversation.lastMessageId
        ? await createIndexedDBQuery('conversations')
            .messages.get(conversation.lastMessageId)
            .then()
        : undefined
      let conversationDisplaysTime =
        lastMessage?.updated_at || conversation.updated_at || ''
      let conversationDisplaysText = ''
      try {
        // 美化一下时间
        if (dayjs().diff(dayjs(conversation.updated_at), 'days') > 0) {
          conversationDisplaysTime = dayjs(conversation.updated_at).format(
            'MMM DD',
          )
        } else {
          conversationDisplaysTime = dayjs(conversation.updated_at).format(
            'HH:mm',
          )
        }
        // NOTE: 之前发现这里会有不是string的情况，但是没找到原因，这里的代码为了安全性还是留着.
        if (lastMessage && typeof lastMessage?.text !== 'string') {
          lastMessage.text = JSON.stringify(lastMessage.text)
        }
        conversationDisplaysText =
          conversation.name || lastMessage?.text || conversation.title
      } catch (e) {
        console.error('对话列表显示文本错误', e)
      }
      const paginationConversation: IPaginationConversation = {
        id: conversation.id,
        name: conversation.name,
        title: conversation.title,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        type: conversation.type,
        lastMessage,
        AIProvider: conversation.meta.AIProvider,
        AIModel: conversation.meta.AIModel,
        conversationDisplaysText,
        conversationDisplaysTime,
      }
      return paginationConversation
    }),
  )
  return paginationConversations.filter(
    (conversation) => conversation.lastMessage || conversation.name,
  )
}

/**
 * 在使用列表的时候，需要先升级到V3版本
 */
export const useUpgradeConversationsToV3 = () => {
  const [done, setDone] = useState(false)
  const [oldVersionConversationIds, setOldVersionConversationIds] = useState<
    string[]
  >([])
  useEffect(() => {
    if (oldVersionConversationIds.length > 0) {
      const handleUpgradeConversations = async () => {
        if (onceRef.current) return
        onceRef.current = true
        const startTime = Date.now()
        for (let i = 0; i < oldVersionConversationIds.length; i++) {
          console.log(
            `ConversationDB[V3] 开始升级conversation[${i}]: ${oldVersionConversationIds[i]}`,
          )
          try {
            await clientUseIndexedDB('ConversationDBMigrateConversationV3', {
              conversationId: oldVersionConversationIds[i],
            })
            console.log(
              `ConversationDB[V3] 升级conversation成功: ${oldVersionConversationIds[i]}`,
            )
          } catch (e) {
            console.log(
              `ConversationDB[V3] 升级conversation失败: ${oldVersionConversationIds[i]}`,
            )
          }
        }
        console.log(
          `ConversationDB[V3] !!!!升级全部conversation完成, 耗时: ${
            Date.now() - startTime
          }ms`,
        )
        setDone(true)
      }
      handleUpgradeConversations().then().catch()
    }
  }, [oldVersionConversationIds])
  const onceRef = useRef(false)
  useEffect(() => {
    let isFree = false
    ClientConversationManager.getAllOldVersionConversationIds().then(
      (conversations) => {
        if (isFree) return
        if (conversations.length > 0) {
          setOldVersionConversationIds(conversations)
        } else {
          setDone(true)
        }
      },
    )
    return () => {
      isFree = true
    }
  }, [])
  return { done }
}

const usePaginationConversations = (
  initFilter: Partial<PaginationConversationsFilterType>,
  controlEnable = false,
) => {
  const { isLogin } = useAuthLogin()
  const [enabled, setEnabled] = useState(false)
  const [filter, setFilter] = useRecoilState(PaginationConversationsFilterState)
  const [paginationConversations, setPaginationConversations] = useRecoilState(
    PaginationConversationsState,
  )
  const totalPageRef = useRef(filter.total_page)
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        PAGINATION_CONVERSATION_QUERY_KEY,
        filter.type,
        filter.isDelete,
        filter.page_size,
      ],
      queryFn: async (data) => {
        // 更新filter
        setFilter((prev) => {
          return {
            ...prev,
            page: data.pageParam,
          }
        })
        // 从远程获取filter.page_size个对话
        const time = new Date().getTime()
        let diffTimeUsage = 0
        let remoteConversations: IConversation[] = []
        if (
          data.pageParam > totalPageRef.current ||
          totalPageRef.current === 0
        ) {
          const result = await clientFetchMaxAIAPI<{
            current_page: number
            current_page_size: number
            data: []
            msg: string
            status: string
            total_page: number
          }>(`/conversation/get_conversation_list`, {
            ...filter,
            page: data.pageParam,
          })
          totalPageRef.current = Math.max(result.data?.total_page || 0, 0)
          setFilter((prev) => {
            return {
              ...prev,
              total_page: totalPageRef.current,
            }
          })
          if (result?.data?.data) {
            remoteConversations = result.data.data
            await ClientConversationManager.diffRemoteConversationData(
              remoteConversations,
            )
            diffTimeUsage = new Date().getTime() - time
          }
        }
        const authorId = await getMaxAIChromeExtensionUserId()
        // 从本地获取filter.page_size个对话
        const conversations = await createIndexedDBQuery('conversations')
          .conversations.orderBy('updated_at')
          .filter(
            dbSift({
              lastMessageId: { $exists: true },
              type: { $eq: filter.type },
              isDelete: { $eq: filter.isDelete },
              authorId: { $eq: authorId },
            }),
          )
          .reverse()
          .offset(data.pageParam * filter.page_size)
          .limit(filter.page_size)
          .toArray()
          .then()
        const paginationConversations =
          await conversationsToPaginationConversations(conversations)
        console.log(
          `ConversationDB[V3][对话列表] 获取列表[${data.pageParam}][${
            conversations.length
          }/${
            paginationConversations.length
          }]耗时: Diff[${diffTimeUsage}]ms, LocalQuery[${
            new Date().getTime() - time - diffTimeUsage
          }】`,
          filter,
        )
        return paginationConversations
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        // 说明本地和远程都没有数据
        if (lastPage.length === 0) {
          // console.log(
          //   `ConversationDB[V3][对话列表] 获取列表[${lastPageParam}]没有数据`,
          // )
          return undefined
        }
        return lastPageParam + 1
      },
      enabled: controlEnable && enabled && isLogin,
    })

  useEffect(() => {
    setPaginationConversations(
      data?.pages?.reduce((acc, page) => acc.concat(page), []) || [],
    )
  }, [data?.pages])
  const fetchPaginationConversations = async () => {
    return []
  }
  const updatePaginationConversations = async (conversationIds: string[]) => {
    const conversations = await createIndexedDBQuery('conversations')
      .conversations.where('id')
      .anyOf(conversationIds)
      .toArray()
      .then()
    const updateMap = new Map<string, IPaginationConversation>()
    const deletedMap = new Map<string, IConversation>()
    const paginationConversations =
      await conversationsToPaginationConversations(
        conversations.filter((conversation) => {
          if (conversation.isDelete) {
            deletedMap.set(conversation.id, conversation)
            return false
          }
          return true
        }),
      )
    paginationConversations.forEach((conversation) => {
      updateMap.set(conversation.id, conversation)
    })
    setPaginationConversations((previous) => {
      // 基于idDelete更新
      return previous
        .map((conversation) => {
          const newConversation = updateMap.get(conversation.id)
          if (newConversation) {
            return newConversation
          }
          return conversation
        })
        .filter((conversation) => {
          return !deletedMap.has(conversation.id)
        })
    })
  }
  const updatePaginationFilter = (
    filter: Partial<PaginationConversationsFilterType>,
  ) => {
    totalPageRef.current = filter.total_page || 0
    setFilter((prev) => {
      return {
        ...prev,
        ...filter,
      }
    })
  }
  // 初始化filter
  useEffect(() => {
    setFilter({
      ...{
        page: 0,
        page_size: 50,
        type: 'Chat',
        isDelete: false,
        total_page: 0,
      },
      ...initFilter,
    })
    setEnabled(controlEnable)
  }, [controlEnable])
  return {
    loading: !enabled || !isLogin || isLoading,
    paginationConversations,
    fetchNextPage,
    fetchPaginationConversations,
    hasNextPage,
    isFetching: isFetchingNextPage,
    updatePaginationConversations,
    updatePaginationFilter,
  }
}

export default usePaginationConversations
