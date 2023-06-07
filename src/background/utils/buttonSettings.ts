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
  IChromeExtensionSettings,
} from '../types/Settings'
import useEffectOnce from '../../hooks/useEffectOnce'
import { getChromeExtensionSettings, setChromeExtensionSettings } from './index'
import { default as lodashSet } from 'lodash-es/set'
import debounce from 'lodash-es/debounce'
import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import cloneDeep from 'lodash-es/cloneDeep'
import { useFocus } from '@/hooks/useFocus'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'

export const useChromeExtensionButtonSettings = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const { syncLocalToServer } = useSyncSettingsChecker()
  const debounceSyncLocalToServer = useCallback(
    debounce(syncLocalToServer, 1000),
    [syncLocalToServer],
  )
  const [loaded, setLoaded] = useState(false)
  const [buttonSettings, setButtonSettings] =
    useState<IChromeExtensionSettings['buttonSettings']>(undefined)
  useEffectOnce(() => {
    getChromeExtensionSettings().then((settings) => {
      setButtonSettings(settings.buttonSettings)
      setLoaded(true)
    })
  })
  useFocus(() => {
    getChromeExtensionSettings().then((settings) => {
      setButtonSettings(settings.buttonSettings)
    })
  })
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
    setButtonSettings(settings.buttonSettings)
    if (saveToServer) {
      await debounceSyncLocalToServer()
    }
  }
  return {
    loaded,
    buttonSettings,
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
      let buttonVisible = false
      if (originalButtonSettings.visibility.isWhitelistMode) {
        buttonVisible =
          originalButtonSettings.visibility.whitelist.includes(host)
      } else {
        buttonVisible =
          !originalButtonSettings.visibility.blacklist.includes(host)
      }
      const computedButtonSettings = {
        ...originalButtonSettings,
        contextMenu: originalButtonSettings.contextMenu.filter((prompt) => {
          if (prompt.data.visibility) {
            if (prompt.data.visibility.isWhitelistMode) {
              return prompt.data.visibility.whitelist.includes(host)
            } else {
              return !prompt.data.visibility.blacklist.includes(host)
            }
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
        host,
        computedButtonSettings.buttonVisible,
        computedButtonSettings.visibility,
      )
      return computedButtonSettings
    }
    return undefined
  }, [
    loaded,
    buttonSettings,
    host,
    buttonKey,
    appSettings.buttonSettings,
    appSettings.userSettings,
  ])
}

export const getChromeExtensionButtonSettings = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await getChromeExtensionSettings()
  return settings.buttonSettings?.[buttonKey]
}
