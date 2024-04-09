import dayjs from 'dayjs'
import { useState } from 'react'
import { useRecoilState } from 'recoil'

import { PaginationConversation } from '@/background/src/chatConversations'
import { clientGetAllPaginationConversations } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { PaginationConversationsState } from '@/features/chatgpt/store'

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

  return {
    loading,
    paginationConversations,
    setPaginationConversations,
    fetchPaginationConversations,
  }
}

export default usePaginationConversations
