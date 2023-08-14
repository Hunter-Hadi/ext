import { useRecoilState, useRecoilValue } from 'recoil'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { useCreateClientMessageListener } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ChatConversation } from '@/background/src/chatConversations'
import { useEffect } from 'react'
import { useFocus } from '@/hooks/useFocus'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'

export const clientGetConversation = async (conversationId: string) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getLiteConversation',
      data: {
        conversationId,
      },
    })
    return result.success ? (result.data as ChatConversation) : undefined
  } catch (e) {
    return undefined
  }
}

const useInitClientConversationMap = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const [, setClientConversationMap] = useRecoilState(
    ClientConversationMapState,
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
    if (appSettings.conversationId) {
      clientGetConversation(appSettings.conversationId).then((conversation) => {
        if (conversation) {
          console.log('新版消息记录 effect更新', conversation.messages)
          setClientConversationMap((prevState) => {
            return {
              ...prevState,
              [conversation.id]: conversation,
            }
          })
        }
      })
    }
  }, [appSettings.conversationId])
  useFocus(() => {
    clientGetLiteChromeExtensionSettings().then((cache) => {
      if (cache.conversationId) {
        clientGetConversation(cache.conversationId).then((conversation) => {
          if (conversation) {
            console.log('新版消息记录 refocus更新', conversation.messages)
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
  })
}
export default useInitClientConversationMap
