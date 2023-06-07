import { atom } from 'recoil'
import { getEnv } from '@/utils/AppEnv'
import { IChromeExtensionSettings } from '@/background/types/Settings'

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

export const AppSettingsState = atom<IChromeExtensionSettings>({
  key: 'AppSettingsState',
  default: {},
})
