/**
 * 各种不同的按钮设置
 * 数据结构:
 * {
 *   textSelectPopup:{
 *     visibility: {
 *       whitelist: ['*'],
 *       blacklist: []
 *       // 优先级: whitelist > blacklist
 *     },
 *     prompts: [
 *       {
 *         ..., // prompts的数据结构
 *         whitelist: ['*'],
 *         blacklist: [],
 *       }
 *     ]
 *   },
 *   gmailButton: {
 *     visibility: {
 *         whitelist: ['mail.google.com'],
 *         blacklist: []
 *     }
 *   }
 * }
 */
import { useCallback, useMemo, useState } from 'react'
import {
  IChromeExtensionButtonSetting,
  IChromeExtensionButtonSettingKey,
  IVisibilitySetting,
} from '../types/Settings'
import useEffectOnce from '../../hooks/useEffectOnce'
import { getChromeExtensionSettings, setChromeExtensionSettings } from './index'
import { default as lodashSet } from 'lodash-es/set'
import debounce from 'lodash-es/debounce'
import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import cloneDeep from 'lodash-es/cloneDeep'
import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'

export const useChromeExtensionButtonSettings = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const { syncLocalToServer } = useSyncSettingsChecker()
  const debounceSyncLocalToServer = useCallback(
    debounce(syncLocalToServer, 1000),
    [syncLocalToServer],
  )
  const updateButtonSettings = async (
    buttonKey: IChromeExtensionButtonSettingKey,
    newSettings: IChromeExtensionButtonSetting,
    saveToServer = true,
  ) => {
    await setChromeExtensionSettings((settings) => {
      lodashSet(settings, `buttonSettings.${buttonKey}`, newSettings)
      return settings
    })
    const settings = await getChromeExtensionSettings()
    setAppSettings(settings)
    if (saveToServer) {
      await debounceSyncLocalToServer()
    }
  }
  return {
    loaded: !!appSettings.buttonSettings,
    buttonSettings: appSettings.buttonSettings,
    updateButtonSettings,
  }
}

export const useComputedChromeExtensionButtonSettings = (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const [appSettings] = useRecoilState(AppSettingsState)
  const [host, setHost] = useState<string>('')
  const { loaded, buttonSettings } = useChromeExtensionButtonSettings()
  useEffectOnce(() => {
    setHost(window.location.host.replace(/^www\./, '').replace(/:\d+$/, ''))
  })
  return useMemo(() => {
    if (loaded && host && buttonSettings?.[buttonKey]) {
      const originalButtonSettings = cloneDeep(buttonSettings[buttonKey])
      const buttonVisible = checkButtonSettingsIsVisible(
        host,
        originalButtonSettings.visibility,
      )
      const computedButtonSettings = {
        ...originalButtonSettings,
        contextMenu: originalButtonSettings.contextMenu.filter((prompt) => {
          if (prompt.data.visibility) {
            return checkButtonSettingsIsVisible(host, prompt.data.visibility)
          }
          return true
        }),
        host,
        buttonVisible,
      } as IChromeExtensionButtonSetting & {
        buttonVisible: boolean
        host: string
      }
      // TODO 临时处理, 后续需要移除这个字段
      if (buttonKey === 'textSelectPopupButton') {
        if (!appSettings.userSettings?.selectionButtonVisible) {
          computedButtonSettings.buttonVisible = false
        }
      }
      console.log(
        'computedButtonSettings',
        `[host=${host}]`,
        `[originPromptLength=${originalButtonSettings.contextMenu.length}]`,
        `[promptLength=${computedButtonSettings.contextMenu.length}]`,
        computedButtonSettings.contextMenu,
      )
      console.log(
        'computedButtonSettings',
        `[host=${host}]`,
        `[buttonVisible=${computedButtonSettings.buttonVisible}]`,
        computedButtonSettings.visibility,
      )
      return computedButtonSettings
    }
    return undefined
  }, [loaded, buttonSettings, host, buttonKey, appSettings.userSettings])
}

export const checkButtonSettingsIsVisible = (
  host: string,
  visibility: IVisibilitySetting,
) => {
  if (visibility.isWhitelistMode) {
    return visibility.whitelist.includes(host)
  } else {
    return !visibility.blacklist.includes(host)
  }
}

export const getChromeExtensionButtonSettings = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await getChromeExtensionSettings()
  return settings.buttonSettings?.[buttonKey]
}
