import {
  IChromeExtensionButtonSettingKey,
  IChromeExtensionSettings,
} from '@/background/types/Settings'
import { getChromeExtensionSettings } from '@/background/utils/index'
import { checkVisibilitySettingIsVisible } from '@/background/utils/buttonSettings'

const getLiteChromeExtensionSettings = async (
  fromUrl?: string,
): Promise<IChromeExtensionSettings> => {
  let host =
    new URL(fromUrl || 'https://a').host
      ?.replace(/^www\./, '')
      ?.replace(/:\d+$/, '') || ''
  // lark doc的子域名是动态的，所以需要特殊处理
  if (host.includes('larksuite.com')) {
    host = 'larksuite.com'
  }
  const settings = await getChromeExtensionSettings()
  if (host && settings.buttonSettings) {
    for (const key in settings.buttonSettings) {
      const saveKey = key as IChromeExtensionButtonSettingKey
      const { visibility, contextMenu } = settings.buttonSettings[saveKey]
      if (checkVisibilitySettingIsVisible(host, visibility)) {
        settings.buttonSettings[saveKey].contextMenu = contextMenu
          .filter((item) =>
            item.data.visibility
              ? checkVisibilitySettingIsVisible(host, item.data.visibility)
              : true,
          )
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
      } else {
        settings.buttonSettings[saveKey].contextMenu = []
      }
    }
  }
  console.log('lite settings', settings)
  return settings
}
export default getLiteChromeExtensionSettings
