import cloneDeep from 'lodash-es/cloneDeep'
import Browser from 'webextension-polyfill'

import {
  IChromeExtensionButtonSettingKey,
  IChromeExtensionDBStorage,
  IChromeExtensionDBStorageUpdateFunction,
} from '@/background/utils'
import { IChromeExtensionButtonSetting } from '@/background/utils/chromeExtensionStorage/type'
import {
  CHROME_EXTENSION_DB_STORAGE_SAVE_KEY,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/constants'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

export const defaultChromeExtensionDBStorage =
  (): IChromeExtensionDBStorage => {
    return {
      userSettings: {
        chatGPTStableModeDuration: 30,
        colorSchema: 'auto',
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
        pdf: {
          enabled: true,
        },
        quickAccess: {
          enabled: true,
        },
        inputAssistantButton: {
          gmail: true,
          outlook: true,
          linkedIn: true,
          twitter: true,
          facebook: true,
          youtube: true,
          instagram: true,
          reddit: true,
          googleMyBusiness: true,
          slack: true,
          discord: true,
          whatsApp: true,
          hubspot: true,
          telegram: true,
          messenger: true,
          googleChat: true,
          microsoftTeams: true,
        },
        summarizeButton: {
          gmail: true,
          pdf: true,
          outlook: true,
          youtube: true,
        },
        sidebar: {
          autoArchive: {
            Art: 10 * 60 * 1000,
            Chat: 10 * 60 * 1000,
            Search: 10 * 60 * 1000,
          },
        },
      },
      buttonSettings: {
        // Context menu
        textSelectPopupButton: {
          visibility: {
            isWhitelistMode: false,
            whitelist: [],
            blacklist: [],
          },
          contextMenu: [],
          contextMenuPosition: 'start',
        },

        // Instant reply
        inputAssistantComposeReplyButton: {
          visibility: {
            isWhitelistMode: false,
            whitelist: [],
            blacklist: [],
          },
          contextMenu: [],
          contextMenuPosition: 'start',
        },
        inputAssistantComposeNewButton: {
          visibility: {
            isWhitelistMode: false,
            whitelist: [],
            blacklist: [],
          },
          contextMenu: [],
          contextMenuPosition: 'start',
        },
        inputAssistantRefineDraftButton: {
          visibility: {
            isWhitelistMode: false,
            whitelist: [],
            blacklist: [],
          },
          contextMenu: [],
          contextMenuPosition: 'start',
        },

        // Summary
        sidebarSummaryButton: {
          visibility: {
            isWhitelistMode: false,
            whitelist: [],
            blacklist: [],
          },
          contextMenu: [],
          contextMenuPosition: 'start',
        },
      },
      alwaysContinueInSidebar: false,
    }
  }
export const getChromeExtensionDBStorage =
  async (): Promise<IChromeExtensionDBStorage> => {
    const defaultConfig = defaultChromeExtensionDBStorage()
    const localData = await Browser.storage.local.get(
      CHROME_EXTENSION_DB_STORAGE_SAVE_KEY,
    )
    try {
      if (localData[CHROME_EXTENSION_DB_STORAGE_SAVE_KEY]) {
        const localSettings = JSON.parse(
          localData[CHROME_EXTENSION_DB_STORAGE_SAVE_KEY],
        )
        const cloneDefaultConfig = cloneDeep(defaultConfig)
        const cloneLocalSettings = cloneDeep(localSettings)
        // 为了提高merge的性能，先把contextMenu字段拿出来 -- 开始
        const buttonMap = new Map()
        // 默认的buttonSettings
        const defaultButtonSettings = cloneDeep(
          cloneDefaultConfig.buttonSettings,
        )
        if (defaultButtonSettings) {
          Object.keys(defaultButtonSettings).forEach((buttonKey) => {
            if (
              defaultButtonSettings[
                buttonKey as IChromeExtensionButtonSettingKey
              ].contextMenu?.length > 0
            ) {
              buttonMap.set(
                buttonKey,
                cloneDeep(
                  defaultButtonSettings[
                    buttonKey as IChromeExtensionButtonSettingKey
                  ].contextMenu,
                ),
              )
              defaultButtonSettings[
                buttonKey as IChromeExtensionButtonSettingKey
              ].contextMenu = []
            }
          })
        }
        // 本地的buttonSettings
        const localButtonSettings = cloneDeep(cloneLocalSettings.buttonSettings)
        if (localButtonSettings) {
          if (localSettings.contextMenus?.length > 0) {
            localButtonSettings.textSelectPopupButton.contextMenu =
              localSettings.contextMenus
            localSettings.contextMenus = []
          }
          if (localSettings.gmailToolBarContextMenu?.length > 0) {
            localButtonSettings.gmailButton.contextMenu =
              localSettings.gmailToolBarContextMenu
            localSettings.gmailToolBarContextMenu = []
          }
          Object.keys(localButtonSettings).forEach((buttonKey) => {
            if (localButtonSettings[buttonKey].contextMenu?.length > 0) {
              buttonMap.set(
                buttonKey,
                cloneDeep(localButtonSettings[buttonKey].contextMenu),
              )
              localButtonSettings[buttonKey].contextMenu = []
            }
          })
        }
        const currentButtonContentMenuSettings: {
          [key in IChromeExtensionButtonSettingKey]: Partial<IChromeExtensionButtonSetting>
        } = {
          textSelectPopupButton: {},
          inputAssistantComposeReplyButton: {},
          inputAssistantComposeNewButton: {},
          inputAssistantRefineDraftButton: {},
          sidebarSummaryButton: {},
        }
        Object.keys(currentButtonContentMenuSettings).forEach((buttonKey) => {
          if (buttonMap.has(buttonKey)) {
            currentButtonContentMenuSettings[
              buttonKey as IChromeExtensionButtonSettingKey
            ].contextMenu = buttonMap.get(buttonKey)
          }
        })
        // 为了提高merge的性能，先把contextMenu字段拿出来 -- 结束
        // 因为每次版本更新都可能会有新字段，用本地的覆盖默认的就行
        const mergedSettings = mergeWithObject([
          cloneDefaultConfig,
          cloneLocalSettings,
          {
            buttonSettings: defaultButtonSettings,
          },
          {
            buttonSettings: localButtonSettings,
          },
          {
            buttonSettings: currentButtonContentMenuSettings,
          },
        ]) as IChromeExtensionDBStorage
        // 废弃字段处理
        // 1. 去掉selectionButtonVisible字段控制 - v2.0.2 - 20230710
        if (
          Object.prototype.hasOwnProperty.call(
            mergedSettings.userSettings as any,
            'selectionButtonVisible',
          )
        ) {
          // 说明用户打开了textSelectPopupButton
          if ((mergedSettings.userSettings as any).selectionButtonVisible) {
            // 需要把textSelectPopupButton的visibility的黑名单模式打开
            mergedSettings.buttonSettings!.textSelectPopupButton.visibility.isWhitelistMode =
              false
          } else {
            // 需要把textSelectPopupButton的visibility的白名单模式打开
            mergedSettings.buttonSettings!.textSelectPopupButton.visibility.isWhitelistMode =
              true
            mergedSettings.buttonSettings!.textSelectPopupButton.visibility.whitelist =
              []
          }
          delete (mergedSettings.userSettings as any).selectionButtonVisible
        }
        return mergedSettings
      } else {
        return defaultConfig
      }
    } catch (e) {
      // 说明没有这个字段，应该返回默认的配置
      return defaultConfig
    }
  }
export const setChromeExtensionDBStorage = async (
  settingsOrUpdateFunction:
    | IChromeExtensionDBStorage
    | IChromeExtensionDBStorageUpdateFunction,
): Promise<boolean> => {
  try {
    const oldSettings = await getChromeExtensionDBStorage()
    if (settingsOrUpdateFunction instanceof Function) {
      const newSettings = settingsOrUpdateFunction(oldSettings)
      await Browser.storage.local.set({
        [CHROME_EXTENSION_DB_STORAGE_SAVE_KEY]: JSON.stringify(newSettings),
      })
    } else {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_DB_STORAGE_SAVE_KEY]: JSON.stringify({
          ...oldSettings,
          ...settingsOrUpdateFunction,
        }),
      })
    }
    return true
  } catch (e) {
    return false
  }
}

export const getChromeExtensionDBStorageButtonContextMenu = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await getChromeExtensionDBStorage()
  const cacheMenus = settings.buttonSettings?.[buttonKey].contextMenu
  return cacheMenus || []
}
