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
 *     ],
 *   },
 *   gmailButton: {
 *     visibility: {
 *         whitelist: ['mail.google.com'],
 *         blacklist: []
 *     },
 *     ...
 *   }
 * }
 */
import cloneDeep from 'lodash-es/cloneDeep'
import debounce from 'lodash-es/debounce'
import isEqual from 'lodash-es/isEqual'
import { default as lodashSet } from 'lodash-es/set'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'

import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import defaultEditAssistantReplyContextMenuJson from '@/background/defaultPromptsData/defaultEditAssistantComposeReplyContextMenuJson'
import defaultInputAssistantDraftNewContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantComposeNewContextMenuJson'
import defaultInputAssistantEditContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantRefineDraftContextMenuJson'
import {
  getChromeExtensionDBStorage,
  setChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import {
  IChromeExtensionButtonSetting,
  IChromeExtensionButtonSettingKey,
  IVisibilitySetting,
} from '@/background/utils/chromeExtensionStorage/type'
import { IContextMenuItem } from '@/features/contextMenu/types'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import { AppDBStorageState } from '@/store'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

import useEffectOnce from '../../features/common/hooks/useEffectOnce'

export const useChromeExtensionButtonSettings = () => {
  const [appDBStorage, setAppDBStorage] = useRecoilState(AppDBStorageState)
  const [buttonSettings, setButtonSettings] = useState(
    () => appDBStorage.buttonSettings,
  )
  useEffect(() => {
    setButtonSettings((prevState) => {
      if (isEqual(prevState, appDBStorage.buttonSettings)) {
        return prevState
      }
      return appDBStorage.buttonSettings
    })
  }, [appDBStorage.buttonSettings])
  const { syncLocalToServer } = useSyncSettingsChecker()
  const debounceSyncLocalToServer = useMemo(
    () => debounce(syncLocalToServer, 1000),
    [syncLocalToServer],
  )
  const updateButtonSettings = async (
    buttonKey: IChromeExtensionButtonSettingKey,
    newSettings: IChromeExtensionButtonSetting,
    saveToServer = true,
  ) => {
    await setChromeExtensionDBStorage((settings) => {
      lodashSet(
        settings,
        `buttonSettings.${buttonKey}.visibility`,
        newSettings.visibility,
      )
      lodashSet(
        settings,
        `buttonSettings.${buttonKey}.contextMenuPosition`,
        newSettings.contextMenuPosition,
      )
      return settings
    })
    setAppDBStorage(await getLiteChromeExtensionDBStorage())
    if (saveToServer) {
      await debounceSyncLocalToServer()
    }
  }

  const toggleButtonSettings = async (
    buttonKey: IChromeExtensionButtonSettingKey,
    show: boolean,
  ): Promise<boolean> => {
    const buttonSetting = await getChromeExtensionButtonSettings(buttonKey)
    const newSettings = cloneDeep(buttonSetting)
    if (!newSettings) {
      return false
    }
    if (show) {
      newSettings.visibility.isWhitelistMode = false
    } else {
      newSettings.visibility.isWhitelistMode = true
      newSettings.visibility.whitelist = []
    }
    console.log('mini menu', newSettings.contextMenu)
    await updateButtonSettings(buttonKey, newSettings)
    return true
  }
  const updateButtonSettingsWithDomain = async (
    buttonKey: IChromeExtensionButtonSettingKey,
  ) => {
    const domain = getCurrentDomainHost()
    const buttonSetting = appDBStorage.buttonSettings?.[
      buttonKey
    ] as IChromeExtensionButtonSetting
    if (buttonSetting) {
      const newSettings = cloneDeep(buttonSetting)
      // 如果是白名单模式
      if (newSettings.visibility.isWhitelistMode) {
        // 如果白名单中已经存在了这个域名, 则删除
        if (newSettings.visibility.whitelist.includes(domain)) {
          newSettings.visibility.whitelist =
            newSettings.visibility.whitelist.filter((item) => item !== domain)
        } else {
          // 如果白名单中不存在这个域名, 则添加
          newSettings.visibility.whitelist.push(domain)
        }
      } else {
        // 如果是黑名单模式
        // 如果黑名单中已经存在了这个域名, 则删除
        if (newSettings.visibility.blacklist.includes(domain)) {
          newSettings.visibility.blacklist =
            newSettings.visibility.blacklist.filter((item) => item !== domain)
        } else {
          // 如果黑名单中不存在这个域名, 则添加
          newSettings.visibility.blacklist.push(domain)
        }
      }
      await updateButtonSettings(buttonKey, newSettings)
    }
    return false
  }
  return {
    loaded: !!appDBStorage.buttonSettings,
    buttonSettings,
    updateButtonSettings,
    toggleButtonSettings,
    updateButtonSettingsWithDomain,
  }
}

export const useChromeExtensionButtonSettingsWithVisibility = (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const [host, setHost] = useState<string>('')
  const { loaded, buttonSettings } = useChromeExtensionButtonSettings()
  useEffectOnce(() => {
    setHost(getCurrentDomainHost())
  })
  return useMemo(() => {
    if (loaded && host && buttonSettings?.[buttonKey]) {
      const originalButtonSettings = cloneDeep(buttonSettings[buttonKey])
      let buttonVisible = checkVisibilitySettingIsVisible(
        host,
        originalButtonSettings.visibility,
      )
      // 由InputAssistantButtonManager.ts处理
      if (
        buttonKey === 'inputAssistantComposeNewButton' ||
        buttonKey === 'inputAssistantComposeReplyButton' ||
        buttonKey === 'inputAssistantRefineDraftButton'
      ) {
        buttonVisible = true
      }
      const computedButtonSettings = {
        ...originalButtonSettings,
        contextMenu: originalButtonSettings.contextMenu.filter(
          (contextMenu) => {
            if (contextMenu.data.visibility) {
              return checkContextMenuVisibilitySettingIsVisible(
                host,
                contextMenu,
                originalButtonSettings.contextMenu,
              )
            }
            return true
          },
        ),
        host,
        buttonVisible,
      } as IChromeExtensionButtonSetting & {
        buttonVisible: boolean
        host: string
      }
      // console.log(
      //   'computedButtonSettings',
      //   `[key=${buttonKey}]`,
      //   `[host=${host}]`,
      //   `[originPromptLength=${originalButtonSettings.contextMenu.length}]`,
      //   `[promptLength=${computedButtonSettings.contextMenu.length}]`,
      //   computedButtonSettings.contextMenu,
      // )
      // console.log(
      //   'computedButtonSettings',
      //   `[key=${buttonKey}]`,
      //   `[host=${host}]`,
      //   `[buttonVisible=${computedButtonSettings.buttonVisible}]`,
      //   computedButtonSettings.visibility,
      // )
      return computedButtonSettings
    }
    return undefined
  }, [loaded, buttonSettings, host, buttonKey])
}

/**
 * 检查visibilitySetting在页面是否可见
 * @param host
 * @param visibility
 */
export const checkVisibilitySettingIsVisible = (
  host: string,
  visibility: IVisibilitySetting,
) => {
  if (visibility.isWhitelistMode) {
    return visibility.whitelist.includes(host)
  } else {
    return !visibility.blacklist.includes(host)
  }
}

/**
 * 将contextMenuList转换为visibilitySettingMap
 * @param contextMenuList
 */
export const contextMenu2VisibilitySettingMap = (
  contextMenuList: IContextMenuItem[],
): Map<string, IVisibilitySetting> => {
  const map: Map<string, IVisibilitySetting> = new Map()
  contextMenuList.forEach((item) => {
    if (item?.data?.visibility) {
      map.set(item.id, item.data.visibility)
    }
  })
  return map
}

/**
 * 检查contextMenu是否可见
 * 1. 如果contextMenu的visibility设置为不可见, 则直接返回false
 * 2. 如果contextMenu的visibility设置为可见, 则检查其父节点是否可见, 如果父节点不可见, 则返回false
 * @param host
 * @param contextMenu
 * @param contextMenuList
 */
export const checkContextMenuVisibilitySettingIsVisible = (
  host: string,
  contextMenu: IContextMenuItem,
  contextMenuList?: IContextMenuItem[],
) => {
  // 如果当前节点没有visibility设置, 则直接返回true
  if (!contextMenu?.data?.visibility) {
    return true
  }
  // 如果当前节点的visibility设置不可见, 则直接返回false
  if (!checkVisibilitySettingIsVisible(host, contextMenu.data.visibility)) {
    return false
  }
  const list = contextMenuList || []
  const sampleNodeList = []
  // 从当前节点开始向上查找
  let currentNode: IContextMenuItem | undefined = contextMenu
  while (currentNode) {
    sampleNodeList.push(currentNode)
    currentNode = list.find((item) => item.id === currentNode?.parent)
  }
  // 从上往下遍历
  for (let i = sampleNodeList.length - 1; i >= 0; i--) {
    const node = sampleNodeList[i]
    if (node?.data?.visibility) {
      const visibilitySetting = node.data.visibility
      // 如果当前节点的visibility设置不可见, 则直接返回false
      if (!checkVisibilitySettingIsVisible(host, visibilitySetting)) {
        return false
      }
    }
  }
  // 如果所有节点都可见, 则返回true
  return true
}

export const getChromeExtensionButtonSettings = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await getChromeExtensionDBStorage()
  return settings.buttonSettings?.[buttonKey]
}

export const getContextMenuActions = async (contextMenuId: string) => {
  const settings = await getChromeExtensionDBStorage()
  if (settings.buttonSettings) {
    for (const buttonKey in settings.buttonSettings) {
      const buttonSettings =
        settings.buttonSettings[buttonKey as IChromeExtensionButtonSettingKey]
      let contextMenu = buttonSettings.contextMenu.find(
        (item) => item.id === contextMenuId,
      )
      if (!contextMenu) {
        contextMenu = getSystemContextMenuWithButtonSettingKey(buttonKey).find(
          (item) => item.id === contextMenuId,
        )
      }
      if (contextMenu) {
        contextMenu.data.actions?.forEach((action) => {
          // HACK: 这里的写法特别蠢，但是得记录正确的api和prompt，只能这么写
          if (
            action.type === 'INSERT_USER_INPUT' ||
            action.type === 'ASK_CHATGPT'
          ) {
            const originData = cloneDeep(contextMenu) as IContextMenuItem
            delete originData.data.actions
            if (!action.parameters.AskChatGPTActionQuestion) {
              action.parameters.AskChatGPTActionQuestion = {
                type: 'user',
                messageId: '',
                conversationId: '',
                text: '',
                meta: {
                  messageVisibleText: originData.text,
                  contextMenu: originData,
                },
              }
            }
            return true
          }
          return false
        })
        return contextMenu.data.actions || []
      }
    }
  }
  return []
}

export class SystemContextMenu {
  static buttonSettings: {
    [key in IChromeExtensionButtonSettingKey]: IContextMenuItem[]
  } = {
    textSelectPopupButton: defaultContextMenuJson,
    inputAssistantRefineDraftButton: defaultInputAssistantEditContextMenuJson,
    inputAssistantComposeReplyButton: defaultEditAssistantReplyContextMenuJson,
    inputAssistantComposeNewButton:
      defaultInputAssistantDraftNewContextMenuJson,
    sidebarSummaryButton: [],
  }
}

/**
 * 获取系统默认的contextMenu
 * @param buttonKey
 */
export const getSystemContextMenuWithButtonSettingKey = (buttonKey: string) => {
  return cloneDeep(
    SystemContextMenu.buttonSettings[
      buttonKey as IChromeExtensionButtonSettingKey
    ] || [],
  )
}
