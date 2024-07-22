import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

const GET_MAX_AI_EXTENSION_ID = 'MAX_AI_EXTENSION_ID_SAVE_KEY'
/**
 * 获取当前AI插件的ID
 */
export const getMaxAIChromeExtensionInstalledDeviceId = async () => {
  const cache = await Browser.storage.local.get(GET_MAX_AI_EXTENSION_ID)
  if (cache && cache[GET_MAX_AI_EXTENSION_ID]) {
    return cache[GET_MAX_AI_EXTENSION_ID]
  } else {
    const uuid = uuidV4()
    await Browser.storage.local.set({ [GET_MAX_AI_EXTENSION_ID]: uuid })
    return uuid
  }
}

export class MaxAIInstalledDeviceIdManager {
  private static extensionId: string | null = null

  static setExtensionId(extensionId: string) {
    this.extensionId = extensionId
  }
  static get MaxAIExtensionId() {
    return this.extensionId
  }
}
