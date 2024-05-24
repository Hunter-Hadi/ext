import { useRecoilState } from 'recoil'

import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { AppLocalStorageState } from '@/store'

const useFloatingContextMenuPin = () => {
  const [appLocalStorage, setAppLocalStorage] =
    useRecoilState(AppLocalStorageState)

  const floatingDropdownMenuPin =
    appLocalStorage.sidebarSettings?.contextMenu?.isPinned

  const setFloatingDropdownMenuPin = async (pin: boolean) => {
    await setChromeExtensionLocalStorage({
      sidebarSettings: {
        contextMenu: { isPinned: pin },
      },
    })
    // const savedAppLocalStorage = await getChromeExtensionLocalStorage()
    setAppLocalStorage((prev) => {
      return {
        ...prev,
        sidebarSettings: {
          ...prev.sidebarSettings,
          contextMenu: {
            ...prev.sidebarSettings?.contextMenu,
            isPinned: pin,
          },
        },
      }
    })
  }

  return {
    floatingDropdownMenuPin,
    setFloatingDropdownMenuPin,
  }
}
export default useFloatingContextMenuPin
