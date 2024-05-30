import { useInfiniteQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import cloneDeep from 'lodash-es/cloneDeep'
import orderBy from 'lodash-es/orderBy'
import { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import useMaxAIBetaFeatures from '@/features/auth/hooks/useMaxAIBetaFeatures'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import {
  PaginationConversationsFilterState,
  PaginationConversationsFilterType,
  PaginationConversationsState,
} from '@/features/chatgpt/store'
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
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

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
      let conversationDisplaysTime =
        lastMessage?.updated_at || conversation.updated_at || ''
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
  // 是否开启了云同步功能
  const { maxAIBetaFeaturesLoaded, maxAIBetaFeatures } = useMaxAIBetaFeatures()
  const totalPageRef = useRef(filter.total_page)
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        PAGINATION_CONVERSATION_QUERY_KEY,
        filter.type,
        filter.isDelete,
        filter.page_size,
        maxAIBetaFeatures.chat_sync,
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
          maxAIBetaFeatures.chat_sync &&
          totalPageRef.current >= data.pageParam
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
      enabled: controlEnable && maxAIBetaFeaturesLoaded && enabled && isLogin,
      refetchOnWindowFocus: false,
    })

  useEffect(() => {
    const conversationMap = new Map<string, IPaginationConversation>()
    data?.pages?.forEach((page) => {
      page.forEach((conversation) => {
        conversationMap.set(conversation.id, conversation)
      })
    })
    setPaginationConversations((previous) => {
      return orderBy(
        previous
          .map((conversation) => {
            if (conversationMap.get(conversation.id)) {
              // 如果时间不一样，更新
              if (
                conversationMap.get(conversation.id)?.updated_at !==
                conversation.updated_at
              ) {
                const newConversation = cloneDeep(
                  conversationMap.get(conversation.id),
                )
                conversationMap.delete(conversation.id)
                // 排序不变
                newConversation!.updated_at = conversation.updated_at
                return newConversation!
              } else {
                // 时间一样，删除
                conversationMap.delete(conversation.id)
              }
            }
            return conversation
          })
          .concat(Array.from(conversationMap.values())),
        ['updated_at'],
        ['desc'],
      )
    })
  }, [data?.pages])
  // 因为上面是动态更新，不是覆盖，所以这里需要过滤
  useEffect(() => {
    setPaginationConversations((previous) => {
      return previous.filter(
        (conversation) => conversation.title === filter.type,
      )
    })
  }, [filter.type])
  const fetchPaginationConversations = async () => {
    return []
  }
  const updatePaginationConversations = async (conversationIds: string[]) => {
    const conversations = await ClientConversationManager.getConversationsByIds(
      conversationIds,
      true,
    )
    // 更新对话列表
    console.log(
      `ConversationDB[V3][对话列表] 外部更新对话列表: `,
      conversations,
    )
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
      return orderBy(
        previous
          .map((conversation) => {
            const newConversation = cloneDeep(updateMap.get(conversation.id))
            if (newConversation) {
              // 排序不变
              newConversation.updated_at = conversation.updated_at
              updateMap.delete(conversation.id)
              return newConversation
            }
            return conversation
          })
          .concat(Array.from(updateMap.values()))
          .filter((conversation) => {
            return !deletedMap.has(conversation.id)
          }),
        ['updated_at'],
        ['desc'],
      )
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
