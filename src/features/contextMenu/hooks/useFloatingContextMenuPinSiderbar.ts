import { useRecoilState } from 'recoil'

import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { AppLocalStorageState } from '@/store'

const useFloatingContextMenuPinSidebar = () => {
  const [appLocalStorage, setAppLocalStorage] =
    useRecoilState(AppLocalStorageState)

  const floatingDropdownMenuPin =
    appLocalStorage.sidebarSettings?.contextMenu?.isPinned

  const setFloatingDropdownMenuPin = async (pin: boolean) => {
    await setChromeExtensionLocalStorage({
      sidebarSettings: {
        contextMenu: { alwaysPinSidebar: pin },
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
            alwaysPinSidebar: pin,
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
export default useFloatingContextMenuPinSidebar
