import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import Log from '@/utils/Log'

const log = new Log('i18n')

export const useLazyLoadI18nResources = () => {
  const { i18n } = useTranslation()
  useEffect(() => {
    if (!i18n.hasResourceBundle(i18n.language, 'name')) {
      // lazy load resources
      fetch(Browser.runtime.getURL(`i18n/locales/${i18n.language}/index.json`))
        .then((t) => t.json())
        .then((json) => {
          Object.keys(json).forEach((key) => {
            i18n.addResourceBundle(i18n.language, key, json[key], true, true)
          })
          log.info('load i18n resources success', i18n.language)
        })
        .catch((err) => {
          log.error('load i18n resources error', err)
        })
    }
  }, [i18n.language])
}

export const useInitI18n = () => {
  const { i18n } = useTranslation()
  const { userSettings } = useUserSettings()
  useLazyLoadI18nResources()
  useEffect(() => {
    i18n.changeLanguage(userSettings?.preferredLanguage || 'en', (err) => {
      if (err) {
        log.error('change language error', err)
      }
    })
  }, [userSettings?.preferredLanguage])
}
