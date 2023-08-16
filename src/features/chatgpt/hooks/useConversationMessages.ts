import { useRecoilValue } from 'recoil'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { useMemo } from 'react'
import { IChatMessage } from '@/features/chatgpt/types'
import { SidebarConversationIdSelector } from '@/features/sidebar'

const useConversationMessages = () => {
  const sidebarConversationId = useRecoilValue(SidebarConversationIdSelector)
  const conversationMap = useRecoilValue(ClientConversationMapState)
  return useMemo<IChatMessage[]>(() => {
    if (sidebarConversationId) {
      return conversationMap[sidebarConversationId]?.messages || []
    }
    return []
  }, [sidebarConversationId, conversationMap])
}

export default useConversationMessages
