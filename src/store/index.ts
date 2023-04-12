import { atom } from 'recoil'
import { IChromeExtensionSettings } from '@/background/utils'
const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

export const AppState = atom<{
  env: 'gmail' | 'normal'
  open: boolean
}>({
  key: 'AppState',
  default: {
    env: isEzMailApp ? 'gmail' : 'normal',
    open: false,
  },
})

export const AppSettingsState = atom<IChromeExtensionSettings>({
  key: 'AppSettingsState',
  default: {},
})
