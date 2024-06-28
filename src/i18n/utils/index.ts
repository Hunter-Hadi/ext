import { i18n, ResourceKey } from 'i18next'

/**
 * 根据i18n 后的 text 去找到 en 下的 i18n text
 *
 * @param text 原本 element 的 innerText
 */
export const getTargetI18nTextByInnerText = (
  i18nInstance: i18n,
  innerText: string,
  targetLanguage: string = 'en',
) => {
  try {
    if (
      targetLanguage === 'en' &&
      (i18nInstance.language === 'en' ||
        i18nInstance.language === 'en_US' ||
        i18nInstance.language === 'en_GB')
    ) {
      // 如果是英语，直接返回
      return innerText
    }

    // 通过按钮文案去找到对应的i18n key
    const currentLanguageResource =
      i18nInstance.options?.resources?.[i18nInstance.language] ?? {}

    const namespaces = Object.keys(currentLanguageResource)
    let currentI18nKey = ''
    for (const namespace of namespaces) {
      const namespaceResource = currentLanguageResource[namespace] as Record<
        string,
        ResourceKey
      >
      for (const key in namespaceResource) {
        if (namespaceResource[key] === innerText) {
          currentI18nKey = namespace + ':' + key
          break
        }
      }
    }
    if (currentI18nKey) {
      // 找到英语版本的value
      const enButtonText = i18nInstance.t(currentI18nKey, { lng: 'en' })
      if (enButtonText) {
        return enButtonText
      } else {
        return innerText
      }
    } else {
      return innerText
    }
  } catch (e) {
    // do nothing
    console.log(`getEnI18nTextByInnerText error`, e)
    return innerText
  }
}
