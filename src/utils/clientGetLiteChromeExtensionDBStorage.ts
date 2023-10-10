import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import { IChromeExtensionDBStorage } from '@/background/utils'

const clientGetLiteChromeExtensionDBStorage = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getLiteChromeExtensionSettings',
    })
    return result.data as IChromeExtensionDBStorage
  } catch (e) {
    console.error(e)
    return getLiteChromeExtensionDBStorage(
      window.location.host || location.host,
    )
  }
}
export default clientGetLiteChromeExtensionDBStorage
