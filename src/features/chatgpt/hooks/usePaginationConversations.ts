import { useInfiniteQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import orderBy from 'lodash-es/orderBy'
import { useEffect, useRef, useState } from 'react'

import { useAuthLogin } from '@/features/auth'
import useMaxAIBetaFeatures from '@/features/auth/hooks/useMaxAIBetaFeatures'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
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
import { ISidebarConversationType } from '@/features/sidebar/types'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

export const PAGINATION_CONVERSATION_QUERY_KEY =
  'PAGINATION_CONVERSATION_QUERY_KEY'

export const conversationsToPaginationConversations = async (
  conversations: IConversation[],
) => {
  const paginationConversations = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = conversation.lastMessageId
        ? await ClientConversationMessageManager.getMessageByMessageId(
            conversation.lastMessageId,
          )
        : null
      let conversationDisplaysTime = conversation.updated_at || ''
      let conversationDisplaysText = conversation.name || ''
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
        if (lastMessage && !conversationDisplaysText) {
          conversationDisplaysText = formatChatMessageContent(
            lastMessage,
            false,
          )
        }
        // 理论上不会出现这种情况
        if (!conversationDisplaysText) {
          conversationDisplaysText = conversation.title || ''
        }
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

export type PaginationConversationsFilterType = {
  type: ISidebarConversationType
  page_size: number
  page: number
  isDelete: boolean
  total_page: number
}

export const useFetchPaginationConversations = (
  initFilter: Partial<PaginationConversationsFilterType>,
  controlEnable = false,
) => {
  const { isLogin } = useAuthLogin()
  const [enabled, setEnabled] = useState(false)
  const [filter, setFilter] = useState<PaginationConversationsFilterType>({
    type: 'Chat',
    page_size: 10,
    page: 0,
    isDelete: false,
    total_page: 0,
  })
  const [paginationConversations, setPaginationConversations] = useState<
    Array<IPaginationConversation & { order?: number }>
  >([])
  // 是否开启了云同步功能
  const { maxAIBetaFeaturesLoaded, maxAIBetaFeatures } = useMaxAIBetaFeatures()
  const totalPageRef = useRef(filter.total_page)
  const remoteConversationPageLoadedRef = useRef<Record<number, boolean>>({})
  const {
    refetch,
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      PAGINATION_CONVERSATION_QUERY_KEY,
      maxAIBetaFeatures.chat_sync,
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
      console.debug(
        `ConversationDB[V3] 获取会话列表:`,
        `\nAPI最大页数:`,
        totalPageRef.current,
        `\n当前页数:`,
        data.pageParam,
        `\n是否远程加载:`,
        remoteConversationPageLoadedRef.current[data.pageParam],
      )
      if (
        maxAIBetaFeatures.chat_sync &&
        totalPageRef.current >= data.pageParam &&
        !remoteConversationPageLoadedRef.current[data.pageParam]
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
        remoteConversationPageLoadedRef.current[data.pageParam] = true
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
      console.debug(
        `ConversationDB[V3][对话列表] 获取列表[${data.pageParam}][${
          conversations.length
        }/${
          paginationConversations.length
        }]耗时: Diff[${diffTimeUsage}]ms, LocalQuery[${
          new Date().getTime() - time - diffTimeUsage
        }】`,
        filter,
      )
      return paginationConversations as Array<
        IPaginationConversation & { order?: number }
      >
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
    enabled: controlEnable && maxAIBetaFeaturesLoaded && enabled && isLogin,
    refetchOnWindowFocus: true,
  })

  const updatePaginationFilter = (
    filter: Partial<PaginationConversationsFilterType>,
  ) => {
    totalPageRef.current = filter.total_page || 0
    remoteConversationPageLoadedRef.current = {}
    setFilter((prev) => {
      return {
        ...prev,
        ...filter,
      }
    })
  }
  const isFetchingRef = useRef(false)
  const isRefetchingRef = useRef(false)
  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage
  }, [isFetchingNextPage])

  useEffect(() => {
    const unsubscribe = OneShotCommunicator.receive(
      'ConversationUpdate',
      async (data) => {
        const { changeType } = data
        switch (changeType) {
          case 'add':
          case 'delete':
          case 'update': {
            if (!isFetchingRef.current && !isRefetchingRef.current) {
              isRefetchingRef.current = true
              refetch()
                .then()
                .catch()
                .finally(() => {
                  isRefetchingRef.current = false
                })
            }
            return true
          }
        }
        return undefined
      },
    )

    return () => unsubscribe()
  }, [refetch])

  useEffect(() => {
    if (data) {
      setPaginationConversations((prevState) => {
        const orderMap = new Map<string, number>()
        prevState.forEach((conversation, index) => {
          if (conversation.order) {
            orderMap.set(conversation.id, conversation.order)
          }
        })
        const newConversations = data.pages.flat() || []
        newConversations.forEach((conversation, index) => {
          if (orderMap.has(conversation.id)) {
            conversation.order = orderMap.get(conversation.id)
          }
        })
        return orderBy(
          newConversations.map((conversation) => {
            if (conversation.order === undefined && conversation.updated_at) {
              conversation.order = new Date(conversation.updated_at).getTime()
            }
            return conversation
          }),
          ['order', 'updated_at'],
          ['desc', 'desc'],
        )
      })
    }
  }, [data?.pages])

  // 初始化filter
  useEffect(() => {
    setFilter((prevState) => {
      return {
        ...prevState,
        ...initFilter,
      }
    })
    setEnabled(controlEnable)
  }, [controlEnable])

  return {
    loading: !enabled || !isLogin || isLoading,
    paginationConversations,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingNextPage,
    updatePaginationFilter,
  }
}
