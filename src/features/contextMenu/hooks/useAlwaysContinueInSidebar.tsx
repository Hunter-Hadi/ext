import { useMemo } from 'react'
import { useRecoilCallback, useRecoilValue } from 'recoil'

import { setChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import { AlwaysContinueInSidebarSelector, AppDBStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import { FloatingDropdownMenuState } from '../store'

export function useAlwaysContinueInSidebar(): [
  boolean,
  (newValue: boolean) => Promise<void>,
] {
  const alwaysContinueInSidebar = useRecoilValue(
    AlwaysContinueInSidebarSelector,
  )

  const isImmersiveChat = useMemo(() => isMaxAIImmersiveChatPage(), [])

  return [
    // alwaysContinueInSidebar,
    !isImmersiveChat ? alwaysContinueInSidebar : false,
    useRecoilCallback(({ set }) => async (newValue: boolean) => {
      await setChromeExtensionDBStorage((oldSettings) => {
        oldSettings.alwaysContinueInSidebar = newValue
        return oldSettings
      })

      set(AppDBStorageState, (prev) => ({
        ...prev,
        alwaysContinueInSidebar: newValue,
      }))

      // 在存在selection当时并不开启的时候跳回开启状态
      set(FloatingDropdownMenuState, (prev) => {
        if (prev.open === false && prev.rootRect !== null) {
          return {
            ...prev,
            open: true,
          }
        }

        return prev
      })
    }),
  ]
}
