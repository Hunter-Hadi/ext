import orderBy from 'lodash-es/orderBy'
import Browser from 'webextension-polyfill'

import {
  getPreviousVersion,
  IChromeExtensionDBStorage,
} from '@/background/utils'
import {
  defaultChromeExtensionDBStorage,
  getChromeExtensionDBStorage,
  setChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'

export interface ChromeExtensionDBStorageSnapshot {
  isDefault: boolean
  settings: IChromeExtensionDBStorage
  timestamp: number
  version: string
}
const LOCAL_STORAGE_KEY = 'CHROME_EXTENSION_SETTINGS_SNAPSHOT_LIST'
/**
 * 保存当前设置为快照
 */
export const setChromeExtensionDBStorageSnapshot = async () => {
  // 保存本地快照
  const previousVersion = getPreviousVersion(
    Browser.runtime.getManifest().version,
  )
  const snapshotList = await getChromeExtensionDBStorageSnapshotList()
  let sortedSnapshotList = orderBy(snapshotList, 'timestamp', 'desc').filter(
    (snapshot) => !snapshot.isDefault && snapshot.version !== previousVersion,
  )
  const settings = await getChromeExtensionDBStorage()
  const snapshot = {
    isDefault: false,
    settings,
    timestamp: Date.now(),
    version: previousVersion,
  }
  // add to head
  sortedSnapshotList = [snapshot, ...sortedSnapshotList]
  // max 3 items
  sortedSnapshotList = sortedSnapshotList.slice(0, 3)
  await Browser.storage.local.set({
    [LOCAL_STORAGE_KEY]: JSON.stringify(sortedSnapshotList),
  })
}
/**
 * 获取快照列表
 */
export const getChromeExtensionDBStorageSnapshotList = async (): Promise<
  ChromeExtensionDBStorageSnapshot[]
> => {
  const defaultSettings = defaultChromeExtensionDBStorage()
  const defaultSnapshot = {
    isDefault: true,
    settings: defaultSettings,
    timestamp: Date.now(),
    version: Browser.runtime.getManifest().version,
  }
  try {
    const cache = await Browser.storage.local.get(LOCAL_STORAGE_KEY)
    if (cache[LOCAL_STORAGE_KEY]) {
      const snapshotList: ChromeExtensionDBStorageSnapshot[] = JSON.parse(
        cache[LOCAL_STORAGE_KEY],
      )
      return snapshotList.concat(defaultSnapshot)
    }
    return [defaultSnapshot]
  } catch (e) {
    console.error(e)
    return [defaultSnapshot]
  }
}

/**
 * 删除快照
 * @description 删除所有快照
 * @returns
 */
export const removeAllChromeExtensionSettingsSnapshot = async () => {
  await Browser.storage.local.remove(LOCAL_STORAGE_KEY)
}

/**
 * 删除快照
 * @param version 版本号
 * @description 删除指定版本的快照
 */
export const removeChromeExtensionSettingsSnapshot = async (
  version: string,
) => {
  const snapshotList = await getChromeExtensionDBStorageSnapshotList()
  const newSnapshotList = snapshotList.filter(
    (snapshot) => snapshot.version !== version,
  )
  await Browser.storage.local.set({
    [LOCAL_STORAGE_KEY]: JSON.stringify(newSnapshotList),
  })
}

/**
 * 还原快照
 * @param snapshot 快照
 * @description 还原指定版本的快照
 * @version 1.0.0 - 只还原buttonSettings
 */
export const restoreChromeExtensionSettingsSnapshot = async (
  snapshot: ChromeExtensionDBStorageSnapshot,
) => {
  if (snapshot?.settings && snapshot.settings.buttonSettings) {
    await setChromeExtensionDBStorage((settings) => {
      // 只还原buttonSettings
      settings.buttonSettings = snapshot.settings.buttonSettings
      return settings
    })
    return true
  }
  return false
}
