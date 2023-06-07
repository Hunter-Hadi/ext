import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import { useMemo } from 'react'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'

export const useChromeExtensionSettingsContextMenuList = (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const appSettings = useRecoilValue(AppSettingsState)
  const defaultMenus = {
    textSelectPopupButton: defaultContextMenuJson,
    gmailButton: defaultGmailToolbarContextMenuJson,
  }
  return useMemo(() => {
    return (
      appSettings.buttonSettings?.[buttonKey].contextMenu ||
      defaultMenus[buttonKey] ||
      []
    )
  }, [appSettings, buttonKey])
}
