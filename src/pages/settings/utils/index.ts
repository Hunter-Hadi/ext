import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { getSystemContextMenuWithButtonSettingKey } from '@/background/utils/buttonSettings'
import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import {
  ContextMenuSearchTextStore,
  removeContextMenuSearchTextStore,
  setContextMenuSearchTextStore,
} from '@/features/sidebar/store/contextMenuSearchTextStore'
import i18n from '@/i18n'
import { loadI18nResources } from '@/i18n/hooks'

export const updateContextMenuSearchTextStore = async (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await getChromeExtensionDBStorage()
  const language = settings.userSettings?.preferredLanguage || 'en'
  const buttonSettings = settings.buttonSettings?.[buttonSettingKey]
  const contextMenuList = (buttonSettings?.contextMenu || []).concat(
    await getSystemContextMenuWithButtonSettingKey(buttonSettingKey),
  )
  if (language && contextMenuList.length > 0) {
    const originalLanguage = i18n.language
    await loadI18nResources(i18n, language)
    await i18n.changeLanguage(language)
    const searchTextPrefixMap: ContextMenuSearchTextStore = {
      en: {} as any,
      [language]: {} as any,
    }
    const saveSearchTextData: ContextMenuSearchTextStore = {
      en: {} as any,
      [language]: {} as any,
    }
    const findSearchText = (parent: string) => {
      const children = contextMenuList.filter((item) => item.parent === parent)
      if (children.length === 0) {
        return
      }
      children.forEach((item) => {
        // 拼接parent的前缀
        const enPrefix = searchTextPrefixMap['en'][parent] || ''
        const currentLanguagePrefix =
          searchTextPrefixMap[language][parent] || ''
        // 当前的text
        const enItemText = item.text
        let currentLanguageItemText = enItemText
        // 只拼接一层
        const enSearchText = `${enPrefix} ${item.text}`.trimStart()
        let currentLanguageSearchText = enSearchText
        if (
          language !== 'en' &&
          i18n.t(`prompt:${item.id}` as any) !== item.id
        ) {
          currentLanguageItemText = i18n.t(`prompt:${item.id}` as any)
          currentLanguageSearchText =
            `${currentLanguagePrefix} ${currentLanguageItemText} ${enSearchText}`.trimStart()
        }
        searchTextPrefixMap.en[item.id] = enItemText.toLowerCase()
        searchTextPrefixMap[language][item.id] =
          currentLanguageItemText.toLowerCase()
        saveSearchTextData.en[item.id] = enSearchText.toLowerCase()
        saveSearchTextData[language][item.id] =
          currentLanguageSearchText.toLowerCase()
        findSearchText(item.id)
      })
    }
    findSearchText('root')
    await removeContextMenuSearchTextStore('en')
    await removeContextMenuSearchTextStore(language)
    await setContextMenuSearchTextStore('en', saveSearchTextData.en)
    await setContextMenuSearchTextStore(language, saveSearchTextData[language])
    await i18n.changeLanguage(originalLanguage)
  }
}
