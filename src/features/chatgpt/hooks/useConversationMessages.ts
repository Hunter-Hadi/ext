import { useRecoilValue } from 'recoil'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { useMemo } from 'react'
import { IChatMessage } from '@/features/chatgpt/types'
import { AppSettingsState } from '@/store'

export const useChatConversationMessages = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const conversationMap = useRecoilValue(ClientConversationMapState)
  return useMemo<IChatMessage[]>(() => {
    if (appSettings.conversationId) {
      return conversationMap[appSettings.conversationId]?.messages || []
    }
    return []
  }, [appSettings.conversationId, conversationMap])
}
