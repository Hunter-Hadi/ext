import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'
import { SearchWithAISettingsAtom } from '../store'
import { getSearchWithAISettings } from '../utils/searchWithAISettings'

const useSearchWithAISettingsInit = () => {
  const setSettings = useSetRecoilState(SearchWithAISettingsAtom)
  const firstLoaded = useRef(true)
  useEffect(() => {
    const updateAppSettings = async () => {
      const settings = await getSearchWithAISettings()
      if (settings) {
        if (firstLoaded.current) {
          setSettings({
            ...settings,
            loaded: true,
          })
          firstLoaded.current = false
        } else {
          setSettings((pre) => ({
            ...pre,
            ...settings,
          }))
        }
      }
    }
    updateAppSettings()
    // 监听自定义事件
    window.addEventListener('focus', updateAppSettings)
    return () => {
      window.removeEventListener('focus', updateAppSettings)
    }
  }, [])

  return null
}

export default useSearchWithAISettingsInit
