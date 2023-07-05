import { useMemo, useState } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import Log from '@/utils/Log'
import { IUseChatGPTUserInfo } from '@/features/auth/types'
import { useSetRecoilState } from 'recoil'
import { ChatGPTMessageState } from '@/features/gmail'
import { v4 as uuidV4 } from 'uuid'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import cloneDeep from 'lodash-es/cloneDeep'

const port = new ContentScriptConnectionV2()
const log = new Log('Features/Auth/UseChatGPTPlusChat')

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<IUseChatGPTUserInfo | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
  const updateMessage = useSetRecoilState(ChatGPTMessageState)
  const quotaLeftText = useMemo(() => {
    if (userInfo?.chatgpt_expires_at) {
      const expiresAt = new Date(userInfo.chatgpt_expires_at)
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()
      const days = Math.ceil(diff / (1000 * 3600 * 24))
      const weeks = Math.floor(days / 7)
      const remainDays = Math.ceil(days % 7)
      let remainDaysText = ''
      if (remainDays > 0) {
        remainDaysText =
          '& ' + remainDays + ' day' + (remainDays > 1 ? 's' : '')
      }
      if (weeks < 1) {
        if (days <= 0) {
          if (diff < 0) {
            return '0'
          }
          return '1 day'
        }
        if (days < 2) {
          return `${days} day`
        }
        return `${days} days`
      }
      if (weeks < 2) {
        return `${weeks} week ${remainDaysText}`
      }
      return `${weeks} weeks ${remainDaysText}`
    }
    return 0
  }, [userInfo])
  const syncUserInfo = async () => {
    try {
      setLoading(true)
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserInfo',
        data: {},
      })
      if (result.success && result.data?.email) {
        setUserInfo(result.data)
        return true
      }
      return false
    } catch (e) {
      log.error(e)
      return false
    } finally {
      setLoading(false)
    }
  }
  const syncUserSubscriptionInfo = async () => {
    try {
      setLoading(true)
      let currentUserInfo = cloneDeep(userInfo)
      if (!currentUserInfo) {
        const result = await port.postMessage({
          event: 'Client_getUseChatGPTUserInfo',
          data: {},
        })
        if (result.success && result.data?.email) {
          currentUserInfo = result.data
        }
      }
      if (!currentUserInfo) {
        return false
      }
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserSubscriptionInfo',
        data: {},
      })
      if (result.success && result.data?.name) {
        const newRole = result.data
        if (newRole) {
          setUserInfo((prevState) => {
            let newUserInfo = cloneDeep(prevState)
            if (!newUserInfo) {
              newUserInfo = cloneDeep(currentUserInfo)
            }
            if (!newUserInfo) {
              return undefined
            }
            if (
              newUserInfo.role?.name &&
              newUserInfo.role.name !== newRole.name &&
              newRole.name !== 'free'
            ) {
              // 角色发生变化
              updateMessage((prevState) => {
                return prevState.concat({
                  messageId: uuidV4(),
                  type: 'system',
                  parentMessageId: undefined,
                  text: `You have successfully upgraded to MaxAI Pro. Enjoy unlimited usage!`,
                  extra: {
                    status: 'success',
                  },
                } as ISystemChatMessage)
              })
            }
            return {
              ...newUserInfo,
              role: newRole,
            }
          })
        }
      }
      return false
    } catch (e) {
      log.error(e)
      return false
    } finally {
      setLoading(false)
    }
  }
  return {
    quotaLeftText,
    userInfo,
    syncUserInfo,
    syncUserSubscriptionInfo,
    loading,
  }
}
export { useUserInfo }
