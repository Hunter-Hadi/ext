/**
 * @description - https://react.i18next.com/latest/using-with-hooks
 */
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import enResources from '@/i18n/locales/en/index.json'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'
i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  // .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  // .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources: {
      en: enResources,
    },
    defaultNS: ['common', 'settings'],
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      bindI18nStore: 'added',
    },
  })

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

export default i18n
