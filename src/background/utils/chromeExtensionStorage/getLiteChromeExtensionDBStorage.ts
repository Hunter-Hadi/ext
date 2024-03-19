import { getSystemContextMenuWithButtonSettingKey } from '@/background/utils/buttonSettings'
import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import {
  IChromeExtensionButtonSettingKey,
  IChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/type'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const getLiteChromeExtensionDBStorage = async (
  fromUrl?: string,
): Promise<IChromeExtensionDBStorage> => {
  const host = getCurrentDomainHost(fromUrl)
  const settings = await getChromeExtensionDBStorage()
  if (host && settings.buttonSettings) {
    for (const key in settings.buttonSettings) {
      const saveKey = key as IChromeExtensionButtonSettingKey
      const { contextMenu } = settings.buttonSettings[saveKey]
      const systemPromptList = getSystemContextMenuWithButtonSettingKey(saveKey)
      settings.buttonSettings[saveKey].contextMenu = systemPromptList
        .concat(contextMenu)
        .map((item) => {
          // clear item.data.actions
          if (item.data.actions) {
            item.data.actions = [
              {
                type: 'FETCH_ACTIONS',
                parameters: {
                  template: item.id,
                },
              },
            ]
          }
          return item
        })
    }
  }
  return settings
}
export default getLiteChromeExtensionDBStorage
