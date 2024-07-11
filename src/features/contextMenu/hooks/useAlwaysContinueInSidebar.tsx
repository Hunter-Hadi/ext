import { useRecoilState } from 'recoil'

import { setChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import { AlwaysContinueInSidebarSelector } from '@/store'

export function useAlwaysContinueInSidebar(): [
  boolean,
  (newValue: boolean) => Promise<void>,
] {
  const [alwaysContinueInSidebar, setAlwaysContinueInSidebar] = useRecoilState(
    AlwaysContinueInSidebarSelector,
  )
  return [
    alwaysContinueInSidebar,
    async (newValue: boolean) => {
      setChromeExtensionDBStorage((oldSettings) => {
        oldSettings.alwaysContinueInSidebar = newValue
        return oldSettings
      })

      setAlwaysContinueInSidebar(newValue)
    },
  ]
}
