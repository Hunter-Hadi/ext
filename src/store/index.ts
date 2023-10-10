import { atom } from 'recoil'
import { getEnv } from '@/utils/AppEnv'
import Browser from 'webextension-polyfill'
import { IChromeExtensionDBStorage } from '@/background/utils'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/types'

export const AppState = atom<{
  env: 'gmail' | 'normal'
  open: boolean
  loading: boolean
}>({
  key: 'AppState',
  default: {
    env: getEnv(),
    open: false,
    loading: false,
  },
})

export const AppDBStorageState = atom<IChromeExtensionDBStorage>({
  key: 'AppDBStorageState',
  default: {},
})

export const AppLocalStorageState = atom<IChromeExtensionLocalStorage>({
  key: 'AppLocalStorageState',
  default: {},
})
export const AppLanguageState = atom<{
  preferredLanguage: string
}>({
  key: 'AppLanguageState',
  default: {
    preferredLanguage: Browser.i18n.getUILanguage(),
  },
})
