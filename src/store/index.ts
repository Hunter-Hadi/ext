import { atom, selector } from 'recoil'
import Browser from 'webextension-polyfill'

import { IChromeExtensionDBStorage } from '@/background/utils'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/type'
import { getEnv } from '@/utils/AppEnv'

export const AppState = atom<{
  env: 'gmail' | 'normal'
  open: boolean
  loading: boolean
  // 因为App是动态加载的，所以有个flag来标记状态
  loadedAppSidebar: boolean
}>({
  key: 'AppState',
  default: {
    env: getEnv(),
    open: false,
    loading: false,
    loadedAppSidebar: false,
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

export const AlwaysContinueInSidebarSelector = selector<boolean>({
  key: 'AlwaysContinueInSidebarSelector',
  get: ({ get }) => {
    return get(AppDBStorageState).alwaysContinueInSidebar || false
  },
})
