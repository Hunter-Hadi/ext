import { useRecoilState } from 'recoil'

import { SearchWithAISettingsAtom } from '../store'
import {
  getSearchWithAISettings,
  ISearchWithAISettings,
  setSearchWithAISettings,
} from '../utils/searchWithAISettings'

export type ISearchWithAISettingsUpdateFunction = (
  settings: ISearchWithAISettings,
) => ISearchWithAISettings

const useSearchWithAISettings = () => {
  const [settings, setSettings] = useRecoilState(SearchWithAISettingsAtom)

  const updateSettings = async (
    settingsOrUpdateFunction:
      | Partial<ISearchWithAISettings>
      | ISearchWithAISettingsUpdateFunction,
  ) => {
    try {
      if (settingsOrUpdateFunction instanceof Function) {
        const oldSettings = await getSearchWithAISettings()
        const newSettings = settingsOrUpdateFunction(oldSettings)
        setSettings((pre) => ({
          ...pre,
          ...newSettings,
        }))
        await setSearchWithAISettings(newSettings)
      } else {
        setSettings((pre) => ({
          ...pre,
          ...settingsOrUpdateFunction,
        }))
        await setSearchWithAISettings(settingsOrUpdateFunction)
      }

      return true
    } catch (e) {
      return false
    }
  }

  return {
    searchWithAISettings: settings,
    setSearchWithAISettings: updateSettings,
  }
}

export default useSearchWithAISettings
