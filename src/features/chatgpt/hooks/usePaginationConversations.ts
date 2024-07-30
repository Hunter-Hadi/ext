import {
  QueryKey,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import dayjs from 'dayjs'
import { isEqual } from 'lodash-es'
import cloneDeep from 'lodash-es/cloneDeep'
import orderBy from 'lodash-es/orderBy'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAuthLogin } from '@/features/auth'
import useMaxAIBetaFeatures from '@/features/auth/hooks/useMaxAIBetaFeatures'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
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
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

export const PAGINATION_CONVERSATION_QUERY_KEY =
  'PAGINATION_CONVERSATION_QUERY_KEY'
export const PAGINATION_CONVERSATION_QUERY_PAGE_SIZE = 20

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
          const messageContent = formatChatMessageContent(lastMessage, false)
          if (isAIMessage(lastMessage)) {
            conversationDisplaysText =
              lastMessage.originalMessage?.metadata?.title?.title ||
              messageContent
          } else {
            conversationDisplaysText = messageContent
          }
        }
        // 理论上不会出现这种情况
        if (!conversationDisplaysText) {
          conversationDisplaysText = conversation.title || ''
        }
      } catch (e) {
        console.error('对话列表显示文本错误', e)
      }
      const paginationConversation: IPaginationConversation & {
        order: number
      } = {
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
        order: new Date(conversation.updated_at).getTime(),
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
  const onceRef = useRef(false)
  useEffect(() => {
    let isFree = false
    ClientConversationManager.getAllOldVersionConversationIds().then(
      (oldVersionConversationIds) => {
        if (isFree) return
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
                await clientUseIndexedDB(
                  'ConversationDBMigrateConversationV3',
                  {
                    conversationId: oldVersionConversationIds[i],
                  },
                )
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
  const { userInfo } = useUserInfo()
  const [enabled, setEnabled] = useState(false)

  const [filter, setFilter] = useState<PaginationConversationsFilterType>(
    () => ({
      type: 'Chat',
      page_size: PAGINATION_CONVERSATION_QUERY_PAGE_SIZE,
      page: 0,
      isDelete: false,
      total_page: 0,
      ...initFilter,
    }),
  )
  const [paginationConversations, setPaginationConversations] = useState<
    Array<IPaginationConversation & { order: number }>
  >([])
  // 是否开启了云同步功能
  const { maxAIBetaFeaturesLoaded, maxAIBetaFeatures } = useMaxAIBetaFeatures()
  const remoteConversationStateRef = useRef<{
    type: string
    totalPage: number
    cache: Record<number, boolean>
    localIndex: number
  }>({
    type: '',
    totalPage: 0,
    cache: {},
    localIndex: 0,
  })

  const queryKey: QueryKey = useMemo(
    () => [
      PAGINATION_CONVERSATION_QUERY_KEY,
      maxAIBetaFeatures.chat_sync,
      filter.type,
      filter.isDelete,
      filter.page_size,
      userInfo?.user_id,
    ],
    [userInfo?.user_id, filter, maxAIBetaFeatures.chat_sync],
  )

  const queryKeyRef = useRef(queryKey)

  const queryClient = useQueryClient()
  // 当数据被标记有被删除的时候，在卸载组件时候清除缓存
  useEffect(() => {
    return () => {
      if (isDeletedRef.current) {
        console.log('clear cache function', queryKeyRef.current)
        queryClient.removeQueries({
          queryKey: queryKeyRef.current,
        })
        isDeletedRef.current = false
      }
    }
  }, [filter.type])

  // WARNING: queryKeyRef的更新需要在清理缓存函数后面
  useEffect(() => {
    queryKeyRef.current = queryKey
  }, [queryKey])

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: async (data) => {
        // 更新filter
        setFilter((prev) => {
          return {
            ...prev,
            page: data.pageParam,
          }
        })
        if (remoteConversationStateRef.current.type !== filter.type) {
          remoteConversationStateRef.current = {
            type: filter.type,
            totalPage: 0,
            cache: {},
            localIndex: 0,
          }
        }
        if (data.pageParam === 0) {
          remoteConversationStateRef.current.localIndex = 0
        }
        const { totalPage, localIndex, cache } =
          remoteConversationStateRef.current
        // 从远程获取filter.page_size个对话
        const time = new Date().getTime()
        let diffTimeUsage = 0
        let remoteConversations: IConversation[] = []
        console.debug(
          `ConversationDB[V3] 获取会话列表:`,
          `\nAPI最大页数:`,
          totalPage,
          `\n当前页数:`,
          data.pageParam,
          `\n是否远程加载:`,
          cache[data.pageParam],
          `\n localIndex:`,
          localIndex,
        )
        if (
          maxAIBetaFeatures.chat_sync &&
          totalPage >= data.pageParam &&
          (!cache[data.pageParam] || data.pageParam === 0)
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
          if (result?.data?.status === 'OK') {
            remoteConversationStateRef.current.cache[data.pageParam] = true
            remoteConversationStateRef.current.totalPage = Math.max(
              result.data?.total_page || 0,
              0,
            )
          }
          setFilter((prev) => {
            return {
              ...prev,
              total_page: totalPage,
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
          .offset(localIndex || data.pageParam * filter.page_size)
          .limit(filter.page_size)
          .toArray()
          .then()
        const paginationConversations =
          await conversationsToPaginationConversations(conversations)

        remoteConversationStateRef.current.localIndex +=
          paginationConversations.length
        console.debug(
          `ConversationDB[V3][对话列表] 获取列表[${data.pageParam}][${
            conversations.length
          }]耗时: Diff[${diffTimeUsage}]ms, LocalQuery[${
            new Date().getTime() - time - diffTimeUsage
          }】index[${remoteConversationStateRef.current.localIndex}]`,
          filter,
        )
        return paginationConversations
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        // 说明本地和远程都没有数据
        if (
          lastPage.length === 0 &&
          lastPageParam >= remoteConversationStateRef.current.totalPage
        ) {
          return undefined
        }
        return lastPageParam + 1
      },
      enabled: controlEnable && maxAIBetaFeaturesLoaded && enabled && isLogin,
      refetchOnWindowFocus: false,
    })

  const updatePaginationFilter = (
    filter: Partial<PaginationConversationsFilterType>,
  ) => {
    remoteConversationStateRef.current = {
      type: filter.type || '',
      totalPage: 0,
      cache: {},
      localIndex: 0,
    }
    setFilter((prev) => {
      const next = {
        ...prev,
        ...filter,
      }
      if (isEqual(prev, next)) return prev

      return next
    })
  }
  const isFetchingRef = useRef(false)
  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage
  }, [isFetchingNextPage])

  const filterTypeRef = useRef(filter.type)
  useEffect(() => {
    filterTypeRef.current = filter.type
  }, [filter.type])

  // 清除切换用户时候的数据
  useEffect(() => {
    if (userInfo?.user_id && paginationConversations.length > 0) {
      setPaginationConversations([])
    }
  }, [userInfo?.user_id])

  const handleUpdatePaginationConversations = useCallback(
    async (
      updatedPaginationConversations: Array<
        IPaginationConversation & { order: number }
      >,
    ) => {
      const updatedPaginationConversationDataMap = new Map<
        string,
        IPaginationConversation & {
          order?: number
        }
      >()
      updatedPaginationConversations.forEach((paginationConversation) => {
        updatedPaginationConversationDataMap.set(
          paginationConversation.id,
          paginationConversation,
        )
      })
      const usedNewConversationMap = new Map<string, boolean>()
      setPaginationConversations((prevState) => {
        const newConversations = prevState
          .map((previousConversation) => {
            if (
              updatedPaginationConversationDataMap.has(previousConversation.id)
            ) {
              const newConversation = mergeWithObject([
                cloneDeep(
                  updatedPaginationConversationDataMap.get(
                    previousConversation.id,
                  ),
                ),
                {
                  order: previousConversation.order,
                },
              ])
              usedNewConversationMap.set(previousConversation.id, true)
              // 因为pagination data是不会更新updated_at的，所以需要手动更新
              return new Date(newConversation.updated_at).getTime() >=
                new Date(previousConversation.updated_at).getTime()
                ? newConversation
                : previousConversation
            }
            return previousConversation
          })
          .concat(
            Array.from(updatedPaginationConversationDataMap.values()).filter(
              (newConversation) =>
                !usedNewConversationMap.has(newConversation.id),
            ),
          )
        const sortedConversations = orderBy(
          newConversations,
          ['order', 'updated_at'],
          ['desc', 'desc'],
        ).filter((paginationConversation: IPaginationConversation) => {
          return paginationConversation.type === filterTypeRef.current
        })
        console.log(
          `ConversationDB[V3][对话列表] 更新列表`,
          sortedConversations,
          updatedPaginationConversationDataMap,
        )
        return sortedConversations
      })
    },
    [],
  )

  // 标记数据是否被删除过，如果删除过的某一条数据的话需要直接删除缓存在下一次进行请求的时候
  const isDeletedRef = useRef(false)

  useEffect(() => {
    const unsubscribe = OneShotCommunicator.receive(
      'ConversationUpdate',
      async (data) => {
        const { changeType, conversationIds } = data
        switch (changeType) {
          case 'add':
          case 'update': {
            const addedConversations =
              await ClientConversationManager.getConversationsByIds(
                conversationIds,
              )

            await handleUpdatePaginationConversations(
              await conversationsToPaginationConversations(addedConversations),
            )
            return true
          }
          case 'delete': {
            setPaginationConversations((prevState) => {
              return prevState.filter((conversation) => {
                return !conversationIds.includes(conversation.id)
              })
            })
            isDeletedRef.current = true
            return true
          }
        }
        return undefined
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (data) {
      const conversations = data.pages.flat()
      handleUpdatePaginationConversations(conversations).then().catch()
    }
  }, [data?.pages])

  // 初始化filter
  useEffect(() => {
    setFilter((prev) => {
      const next = {
        ...prev,
        ...initFilter,
      }
      if (isEqual(prev, next)) return prev

      return next
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
