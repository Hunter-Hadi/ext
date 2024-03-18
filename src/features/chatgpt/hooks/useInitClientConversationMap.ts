import cloneDeep from 'lodash-es/cloneDeep'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

import {
  IChatConversation,
  PaginationConversation,
} from '@/background/src/chatConversations'
import { useCreateClientMessageListener } from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { ISidebarConversationType } from '@/features/sidebar/types'

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
/**
 * 强制删除conversation
 * @description - 因为正常的删除是切换conversation，但是这里是直接在indexDB删除整个conversation
 * @param conversationId
 */
export const clientForceRemoveConversation = async (conversationId: string) => {
  try {
    const port = new ContentScriptConnectionV2({})
    const result = await port.postMessage({
      event: 'Client_removeChatGPTConversation',
      data: {
        conversationId,
        isForceRemove: true,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}
/**
 * 获取所有的conversation
 */
export const clientGetAllConversations = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getAllConversation',
    })
    return result.success ? (result.data as IChatConversation[]) : undefined
  } catch (e) {
    return []
  }
}
/**
 * 获取分页的conversation数据
 */
export const clientGetAllPaginationConversations = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getAllPaginationConversation',
    })
    return result.success ? (result.data as PaginationConversation[]) : []
  } catch (e) {
    return []
  }
}
export const removeAllConversations = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_removeAllConversation',
    })
    return result.success
  } catch (e) {
    return false
  }
}

export const removeConversationsByType = async (
  type: ISidebarConversationType,
) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_removeConversationByType',
      data: {
        type,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}

const useInitClientConversationMap = () => {
  const [, setClientConversationMap] = useRecoilState(
    ClientConversationMapState,
  )
  const { currentConversationId, updateChatStatus } = useClientConversation()
  useCreateClientMessageListener(async (event, data) => {
    switch (event) {
      case 'Client_listenUpdateConversationMessages': {
        const { conversation, conversationId } = data
        if (conversation?.id && conversationId === currentConversationId) {
          setClientConversationMap((prevState) => {
            return {
              ...prevState,
              [conversation.id]: conversation,
            }
          })
        } else if (!conversation && conversationId === currentConversationId) {
          // 如果是删除的话，就不会有conversation
          setClientConversationMap((prevState) => {
            const newState = cloneDeep(prevState)
            delete newState[conversationId]
            return newState
          })
        }
        return {
          success: true,
        }
      }
    }
    return undefined
  })
  useEffect(() => {
    if (currentConversationId) {
      const port = new ContentScriptConnectionV2({
        runtime: 'client',
      })
      /**
       * 检查Chat状态
       */
      const checkChatGPTStatus = async () => {
        debugger
        const result = await port.postMessage({
          event: 'Client_checkChatGPTStatus',
          data: {
            conversationId: currentConversationId,
          },
        })
        console.log(
          `新版Conversation [${currentConversationId}]status更新`,
          result.data,
        )
        if (result.success && result.data.status) {
          updateChatStatus(result.data.status)
        }
      }
      window.addEventListener('focus', checkChatGPTStatus)
      // 获取当前的conversation的数据
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
      return () => {
        port.destroy()
        window.removeEventListener('focus', checkChatGPTStatus)
      }
    }
    return () => {}
  }, [currentConversationId])
}
export default useInitClientConversationMap
