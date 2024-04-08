import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'

/**
 * 初始化conversation更新
 * @description - 当前的conversation的数据（status/history）
 * @since 2024-03-18
 */
const useInitConversationUpdate = () => {
  const [, setClientConversationMap] = useRecoilState(
    ClientConversationMapState,
  )
  const {
    currentConversationIdRef,
    currentConversationId,
    updateConversationStatus,
  } = useClientConversation()
  useEffect(() => {
    if (currentConversationId) {
      const port = new ContentScriptConnectionV2({
        runtime: 'client',
      })
      /**
       * 检查Chat状态
       */
      const checkChatGPTStatus = async () => {
        clientGetConversation(currentConversationId).then(
          async (conversation) => {
            if (conversation) {
              console.log(
                `新版Conversation [${currentConversationId}]effect更新`,
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
        const result = await port.postMessage({
          event: 'Client_checkChatGPTStatus',
          data: {
            conversationId: currentConversationId,
          },
        })
        console.log(
          `新版Conversation [${currentConversationId}]status更新`,
          result.data,
          currentConversationIdRef.current,
          currentConversationId,
        )
        if (result.success && result.data.status) {
          updateConversationStatus(result.data.status)
        }
      }
      window.addEventListener('focus', checkChatGPTStatus)
      checkChatGPTStatus()
      // 获取当前的conversation的数据
      return () => {
        port.destroy()
        window.removeEventListener('focus', checkChatGPTStatus)
      }
    }
    return () => {}
  }, [currentConversationId])
}

export default useInitConversationUpdate
