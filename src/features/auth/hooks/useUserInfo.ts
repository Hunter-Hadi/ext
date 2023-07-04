import { useMemo, useState } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import Log from '@/utils/Log'
import { IUseChatGPTUserInfo } from '@/features/auth/types'

const port = new ContentScriptConnectionV2()
const log = new Log('Features/Auth/UseChatGPTPlusChat')

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<IUseChatGPTUserInfo | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
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
  return {
    quotaLeftText,
    userInfo,
    syncUserInfo,
    loading,
  }
}
export { useUserInfo }
