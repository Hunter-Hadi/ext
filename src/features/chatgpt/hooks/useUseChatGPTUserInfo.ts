import { useMemo, useState } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import Log from '@/utils/Log'
import { IUseChatGPTUserInfo } from '@/background/src/usechatgpt'

const port = new ContentScriptConnectionV2()
const log = new Log('Features/ChatGPT/UseChatGPTPlusChat')

const useUseChatGPTUserInfo = () => {
  const [userInfo, setUserInfo] = useState<IUseChatGPTUserInfo | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
  const quotaLeftText = useMemo(() => {
    if (userInfo?.chatgpt_expires_at) {
      const expiresAt = new Date(userInfo.chatgpt_expires_at)
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()
      const days = Math.floor(diff / (1000 * 3600 * 24))
      const weeks = Math.floor(days / 7)
      if (weeks < 1) {
        if (days === 0) {
          return 0
        }
        if (days < 2) {
          return `${days}day`
        }
        return `${days}days`
      }
      if (weeks < 2) {
        return `${weeks}week`
      }
      return `${weeks}weeks`
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
export { useUseChatGPTUserInfo }
