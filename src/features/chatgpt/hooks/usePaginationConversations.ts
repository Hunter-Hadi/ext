import dayjs from 'dayjs'
import { useCallback, useState } from 'react'
import { useRecoilState } from 'recoil'

import { PaginationConversation } from '@/background/src/chatConversations'
import { PaginationConversationsState } from '@/features/chatgpt/store'
import { clientGetAllPaginationConversations } from '@/features/chatgpt/utils/chatConversationUtils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const usePaginationConversations = () => {
  const [loading, setLoading] = useState(false)
  const [paginationConversations, setPaginationConversations] = useRecoilState(
    PaginationConversationsState,
  )

  const fetchPaginationConversations = async () => {
    return new Promise<PaginationConversation[]>((resolve) => {
      setLoading(true)
      clientGetAllPaginationConversations()
        .then((conversations) => {
          const beautyConversations = conversations
            // immersive chat 中不显示 Summary history
            .filter((conversation) => !(conversation.type === 'Summary'))
            .sort((prev, next) => {
              return (
                dayjs(next.updated_at).valueOf() -
                dayjs(prev.updated_at).valueOf()
              )
            })
            .map((conversation) => {
              // 美化一下
              let updated_at = conversation.updated_at
              if (dayjs().diff(dayjs(conversation.updated_at), 'days') > 0) {
                updated_at = dayjs(conversation.updated_at).format('MMM DD')
              } else {
                updated_at = dayjs(conversation.updated_at).format('HH:mm')
              }
              return {
                ...conversation,
                updated_at,
              }
            })

          resolve(beautyConversations)
        })
        .catch((e) => {
          console.log(e)
          resolve([])
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  const updatePaginationConversations = useCallback(
    (newConversations: PaginationConversation[]) => {
      if (isMaxAIImmersiveChatPage()) {
        // immersive chat里不去更改位置
        setPaginationConversations((prevConversations) => {
          const conversationsMap: Record<string, PaginationConversation> = {}
          const addConversations: PaginationConversation[] = []
          const mergeConversations: PaginationConversation[] = []
          newConversations.forEach((item) => {
            conversationsMap[item.id] = item
          })
          prevConversations.forEach((item) => {
            if (conversationsMap[item.id]) {
              mergeConversations.push(conversationsMap[item.id])
              delete conversationsMap[item.id]
            }
          })
          Object.keys(conversationsMap).forEach((id) => {
            const item = newConversations.find((item) => item.id === id)
            if (item) addConversations.push(item)
          })
          return [...addConversations, ...mergeConversations]
        })
      } else {
        setPaginationConversations(newConversations)
      }
    },
    [setPaginationConversations],
  )

  return {
    loading,
    paginationConversations,
    setPaginationConversations: updatePaginationConversations,
    fetchPaginationConversations,
  }
}

export default usePaginationConversations
