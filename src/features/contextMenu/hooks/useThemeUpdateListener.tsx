/**
 * 初始化在gmail的chatGPT客户端
 */
import { useEffect } from 'react'
// import { setChromeExtensionSettings } from '@/utils'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { ContentScriptConnection } from '@/features/chatgpt/utils'

const useThemeUpdateListener = () => {
  useEffect(() => {
    const port = new ContentScriptConnection()
    const themeUpdate = () => {
      const isDarkModeEnabled =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      console.log('theme mode Update', isDarkModeEnabled ? 'dark' : 'light')
      // setChromeExtensionSettings({
      //   colorSchema: isDarkModeEnabled ? 'dark' : 'light',
      // })
      port.postMessage({
        id: CHROME_EXTENSION_POST_MESSAGE_ID,
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
