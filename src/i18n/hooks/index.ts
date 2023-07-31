import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'

export const useLazyLoadI18nResources = () => {
  const { i18n } = useTranslation()
  useEffect(() => {
    console.log(
      i18n.hasResourceBundle(i18n.language, 'name'),
      i18n.language,
      'QQQQQQQQQQQQ',
    )
    if (!i18n.hasResourceBundle(i18n.language, 'name')) {
      // lazy load resources
      fetch(Browser.runtime.getURL(`i18n/locales/${i18n.language}/index.json`))
        .then((t) => t.json())
        .then((json) => {
          Object.keys(json).forEach((key) => {
            i18n.addResourceBundle(i18n.language, key, json[key], true, true)
          })
        })
        .catch((err) => {
          debugger
        })
    }
  }, [i18n.language])
}
