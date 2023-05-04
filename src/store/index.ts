import { atom } from 'recoil'
import { IChromeExtensionSettings } from '@/background/utils'
import { isEzMailApp } from '@/types'

export const AppState = atom<{
  env: 'gmail' | 'normal'
  open: boolean
  loading: boolean
}>({
  key: 'AppState',
  default: {
    env: isEzMailApp ? 'gmail' : 'normal',
    open: false,
    loading: false,
  },
})

export const AppSettingsState = atom<IChromeExtensionSettings>({
  key: 'AppSettingsState',
  default: {},
})
