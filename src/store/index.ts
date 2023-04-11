import { atom, selector } from 'recoil'
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

export const AppSettingsCommandKeysSelector = selector<{
  shortcutsKey: string
}>({
  key: 'AppSettingsCommandKeysSelector',
  get: ({ get }) => {
    const appSettings = get(AppSettingsState)
    const findCommand = appSettings?.commands?.find(
      (command) => command.name === '_execute_action',
    )
    return {
      shortcutsKey: findCommand?.shortcut || '',
    }
  },
})
