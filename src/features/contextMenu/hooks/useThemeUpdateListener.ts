/**
 * 初始化在gmail的chatGPT客户端
 */
import { useEffect } from 'react'

// import { setChromeExtensionSettings } from '@/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'

const useThemeUpdateListener = () => {
  useEffect(() => {
    const port = new ContentScriptConnectionV2()
    const themeUpdate = () => {
      const isDarkModeEnabled =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      console.log('theme mode Update', isDarkModeEnabled ? 'dark' : 'light')
      port.postMessage({
        event: 'Client_updateIcon',
        data: {
          mode: isDarkModeEnabled ? 'dark' : 'light',
        },
      })
    }
    // theme mode change
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', themeUpdate)
    themeUpdate()
    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', themeUpdate)
      port?.destroy()
    }
  }, [])
}

export default useThemeUpdateListener
