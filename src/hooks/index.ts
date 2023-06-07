import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/background/defaultPromptsData/defaultGmailToolbarContextMenuJson'
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
