import { atom } from 'recoil'
import { IChromeExtensionSettings } from '@/background/utils'
import { getEnv } from '@/utils/AppEnv'

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
