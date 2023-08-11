import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { IChromeExtensionSettings } from '@/background/types/Settings'
import getLiteChromeExtensionSettings from '@/background/utils/getLiteChromeExtensionSettings'

const clientGetLiteChromeExtensionSettings = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getLiteChromeExtensionSettings',
    })
    return result.data as IChromeExtensionSettings
  } catch (e) {
    console.error(e)
    return getLiteChromeExtensionSettings(window.location.host || location.host)
  }
}
export default clientGetLiteChromeExtensionSettings
