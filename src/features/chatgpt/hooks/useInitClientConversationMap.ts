import { useRecoilState, useRecoilValue } from 'recoil'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { useCreateClientMessageListener } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IChatConversation } from '@/background/src/chatConversations'
import { useEffect } from 'react'
import { useFocus } from '@/hooks/useFocus'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { SidebarConversationIdSelector } from '@/features/sidebar'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'

export const clientGetConversation = async (conversationId: string) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getLiteConversation',
      data: {
        conversationId,
      },
    })
    return result.success ? (result.data as IChatConversation) : undefined
  } catch (e) {
    return undefined
  }
}

const useInitClientConversationMap = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const [, setClientConversationMap] = useRecoilState(
    ClientConversationMapState,
  )
  const currentSidebarConversationId = useRecoilValue(
    SidebarConversationIdSelector,
  )
  useCreateClientMessageListener(async (event, data, sender) => {
    switch (event) {
      case 'Client_listenUpdateConversationMessages':
        {
          const { conversation } = data
          if (conversation.id) {
            setClientConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
          }
          return {
            success: true,
          }
        }
        break
    }
    return undefined
  })
  useEffect(() => {
    if (currentSidebarConversationId) {
      clientGetConversation(currentSidebarConversationId).then(
        (conversation) => {
          if (conversation) {
            console.log('新版Conversation effect更新', conversation.messages)
            setClientConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
          }
        },
      )
    }
  }, [currentSidebarConversationId])
  useFocus(() => {
    clientGetLiteChromeExtensionSettings().then((cache) => {
      if (cache.conversationId) {
        clientGetConversation(cache.conversationId).then((conversation) => {
          if (conversation) {
            console.log(
              '新版Conversation refocus更新chat',
              conversation.messages,
            )
            setClientConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
          }
        })
      }
    })
    if (getPageSummaryConversationId()) {
      clientGetConversation(getPageSummaryConversationId()).then(
        (conversation) => {
          if (conversation) {
            console.log(
              '新版Conversation refocus更新summaryId',
              conversation.messages,
            )
            setClientConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
          }
        },
      )
    }
  })
}
export default useInitClientConversationMap
