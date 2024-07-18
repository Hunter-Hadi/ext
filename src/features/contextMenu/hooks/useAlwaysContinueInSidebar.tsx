import { useMemo } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { AlwaysContinueInSidebarSelector, AppLocalStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import { FloatingDropdownMenuState } from '../store'

export function useAlwaysContinueInSidebar(): [
  boolean,
  (newValue: boolean) => Promise<void>,
] {
  const alwaysContinueInSidebar = useRecoilValue(
    AlwaysContinueInSidebarSelector,
  )
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  const setFloatingDropdownMenu = useSetRecoilState(FloatingDropdownMenuState)

  const isImmersiveChat = useMemo(() => isMaxAIImmersiveChatPage(), [])

  return [
    // alwaysContinueInSidebar,
    !isImmersiveChat ? alwaysContinueInSidebar : false,
    async (newValue: boolean) => {
      await setChromeExtensionLocalStorage({
        sidebarSettings: {
          contextMenu: {
            alwaysContinueInSidebar: newValue,
          },
        },
      })
      const savedAppLocalStorage = await getChromeExtensionLocalStorage()
      setAppLocalStorage((prev) => {
        return {
          ...prev,
          sidebarSettings: savedAppLocalStorage.sidebarSettings,
        }
      })
    },
  ]
}
