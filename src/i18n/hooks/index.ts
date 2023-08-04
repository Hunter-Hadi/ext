import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'
import Log from '@/utils/Log'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'

const log = new Log('i18n')

export const useLazyLoadI18nResources = () => {
  const { userSettings } = useRecoilValue(AppSettingsState)
  const { i18n } = useTranslation()
  useEffect(() => {
    const newLanguage = userSettings?.preferredLanguage || i18n.language
    if (!i18n.hasResourceBundle(newLanguage, 'name')) {
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

export const useInitI18n = () => {
  const { i18n } = useTranslation()
  const { userSettings } = useRecoilValue(AppSettingsState)
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