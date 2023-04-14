import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { useMemo, useState } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { setChromeExtensionSettings } from '@/background/utils'
import Log from '@/utils/Log'

const port = new ContentScriptConnectionV2()
const log = new Log('Features/ChatGPT/UseChatGPTPlusChat')

const useUseChatGPTUserInfo = () => {
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const quotaLeftText = useMemo(() => {
    if (appSettings.userInfo?.chatgpt_expires_at) {
      const expiresAt = new Date(appSettings.userInfo.chatgpt_expires_at)
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
  }, [appSettings])
  const syncUserInfo = async () => {
    try {
      setLoading(true)
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserInfo',
        data: {},
      })
      if (result.success && result.data?.email) {
        await setChromeExtensionSettings({
          userInfo: result.data,
        })
        setAppSettings((prevState) => {
          return {
            ...prevState,
            userInfo: result.data,
          }
        })
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
    userInfo: appSettings.userInfo,
    syncUserInfo,
    loading,
  }
}
export { useUseChatGPTUserInfo }
