import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import Browser from 'webextension-polyfill'

import { AppDBStorageState } from '@/store'
import Log from '@/utils/Log'

const log = new Log('i18n')

export const useLazyLoadI18nResources = () => {
  const { userSettings } = useRecoilValue(AppDBStorageState)
  const { i18n } = useTranslation()
  useEffect(() => {
    const newLanguage = userSettings?.preferredLanguage || i18n.language
    if (!i18n?.hasResourceBundle?.(newLanguage, 'name')) {
      // lazy load resources
      fetch(Browser.runtime.getURL(`i18n/locales/${newLanguage}/index.json`))
        .then((t) => t.json())
        .then((json) => {
          Object.keys(json).forEach((key) => {
            i18n.addResourceBundle(newLanguage, key, json[key], true, true)
          })
          log.info('load i18n resources success', newLanguage)
        })
        .catch((err) => {
          log.error('load i18n resources error', err)
        })
    }
  }, [i18n, userSettings?.preferredLanguage])
}

export const loadI18nResources = (i18n: any, language: string) => {
  return new Promise((resolve) => {
    if (i18n?.language && !i18n?.hasResourceBundle?.(language, 'name')) {
      // lazy load resources
      fetch(Browser.runtime.getURL(`i18n/locales/${language}/index.json`))
        .then((t) => t.json())
        .then((json) => {
          Object.keys(json).forEach((key) => {
            i18n.addResourceBundle(language, key, json[key], true, true)
          })
          log.info('load i18n resources success', language)
          resolve(true)
        })
        .catch((err) => {
          log.error('load i18n resources error', err)
          resolve(false)
        })
    } else {
      resolve(true)
    }
  })
}

export const useInitI18n = () => {
  const { i18n } = useTranslation()
  const { userSettings } = useRecoilValue(AppDBStorageState)
  useLazyLoadI18nResources()
  useEffect(() => {
    if (userSettings?.preferredLanguage) {
      i18n.changeLanguage(userSettings?.preferredLanguage, (err) => {
        if (err) {
          log.error('change language error', err)
        }
      })
    }
  }, [userSettings?.preferredLanguage])
  useEffect(() => {
    if (userSettings?.preferredLanguage) {
      i18n.changeLanguage(userSettings?.preferredLanguage, (err) => {
        if (err) {
          log.error('change language error', err)
        }
      })
    }
  }, [userSettings])
}
