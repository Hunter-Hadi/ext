import { getSystemContextMenuWithButtonSettingKey } from '@/background/utils/buttonSettings'
import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import {
  IChromeExtensionButtonSettingKey,
  IChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/type'

const getLiteChromeExtensionDBStorage = async (
  fromUrl?: string,
): Promise<IChromeExtensionDBStorage> => {
  let host =
    new URL(fromUrl || 'https://a').host
      ?.replace(/^www\./, '')
      ?.replace(/:\d+$/, '') || ''
  // lark doc的子域名是动态的，所以需要特殊处理
  if (host.includes('larksuite.com')) {
    host = 'larksuite.com'
  }
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
  console.log('lite settings', settings)
  return settings
}
export default getLiteChromeExtensionDBStorage
