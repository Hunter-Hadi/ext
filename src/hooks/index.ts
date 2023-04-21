import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import { useMemo } from 'react'
import { IChromeExtensionSettingsContextMenuKey } from '@/background/utils'

export const useChromeExtensionSettingsContextMenuList = (
  menuType: IChromeExtensionSettingsContextMenuKey,
) => {
  const appSettings = useRecoilValue(AppSettingsState)
  const defaultMenus = {
    contextMenus: defaultContextMenuJson,
    gmailToolBarContextMenu: defaultGmailToolbarContextMenuJson,
  }
  return useMemo(() => {
    return appSettings[menuType] || defaultMenus[menuType] || []
  }, [appSettings, menuType])
}
