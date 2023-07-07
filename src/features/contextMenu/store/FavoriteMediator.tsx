import { IContextMenuItem } from '@/features/contextMenu/types'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { getChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import Log from '@/utils/Log'
import LFUCache from '@/utils/cache/LFUCache'
import Browser from 'webextension-polyfill'

const favoriteMediatorLog = new Log('Store/FavoriteMediator')

const FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY =
  'FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY'

const FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY =
  'FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY'

// 默认容量
const DEFAULT_CAPACITY = 3

/**
 * 获取容量
 */
export const getFavoriteContextMenuCapacity = async () => {
  try {
    const localStorageData = await Browser.storage.local.get(
      FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY,
    )
    return (
      localStorageData[FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY] ||
      DEFAULT_CAPACITY
    )
  } catch (e) {
    return DEFAULT_CAPACITY
  }
}
/**
 * 设置容量
 * @param capacity
 */
export const setFavoriteContextMenuCapacity = async (capacity: number) => {
  try {
    await Browser.storage.local.set({
      [FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY]: capacity,
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const getFavoriteContextMenuFromLocalStorage = async (): Promise<
  [IContextMenuItem, number[]][]
> => {
  try {
    const localStorageData = await Browser.storage.local.get(
      FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY,
    )
    return JSON.parse(
      localStorageData[FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY] || '[]',
    )
  } catch (e) {
    return []
  }
}
export const setFavoriteContextMenuToLocalStorage = async (
  cache: [IContextMenuItem, number[]][],
) => {
  try {
    await Browser.storage.local.set({
      [FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY]: JSON.stringify(cache),
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const resetFavoriteContextMenuToLocalStorage = async () => {
  try {
    await Browser.storage.local.remove(FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY)
    await Browser.storage.local.remove(
      FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY,
    )
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

type FavoriteMediatorListener = (favorites: IContextMenuItem[]) => void

class FavoriteMediator {
  buttonSettingKey: IChromeExtensionButtonSettingKey
  lfuCache: LFUCache<string, IContextMenuItem>
  listeners: FavoriteMediatorListener[] = []
  constructor(buttonSettingKey: IChromeExtensionButtonSettingKey) {
    this.buttonSettingKey = buttonSettingKey
    this.lfuCache = new LFUCache<string, IContextMenuItem>(DEFAULT_CAPACITY)
    favoriteMediatorLog.info('FavoriteMediator init', this.buttonSettingKey)
  }
  async restoreCacheFromLocalStorage() {
    const buttonSettings = await getChromeExtensionButtonSettings(
      this.buttonSettingKey,
    )
    const favoritesCache = await getFavoriteContextMenuFromLocalStorage()
    const capacity = await getFavoriteContextMenuCapacity()
    this.lfuCache.updateCapacity(capacity)
    if (favoritesCache.length) {
      // 确保缓存的菜单项在当前按钮设置中存在
      favoritesCache.forEach(([contextMenuItem, timeFrequency]) => {
        if (
          buttonSettings?.contextMenu.some(
            (item) => item.id === contextMenuItem.id,
          )
        ) {
          this.lfuCache
            .getCache()
            .set(contextMenuItem.id, [contextMenuItem, timeFrequency])
        }
      })
      // refresh cache
      this.lfuCache.refreshFrequency()
      favoriteMediatorLog.info(
        'FavoriteMediator restoreCacheFromLocalStorage',
        this.buttonSettingKey,
        this.getFavorites(),
      )
    }
    this.notify()
  }
  public getFavorites(): IContextMenuItem[] {
    const cacheItems: [IContextMenuItem, number[]][] = []
    let favorites: IContextMenuItem[] = []
    this.lfuCache.getCache().forEach((cacheItem) => {
      cacheItems.push(cacheItem)
    })
    favorites = cacheItems
      .sort((prev, next) => {
        // 按照使用频率排序, 如果频率一致，对比时间
        const nextTimeFrequency = next[1]
        const prevTimeFrequency = prev[1]
        if (
          nextTimeFrequency.length === prevTimeFrequency.length &&
          nextTimeFrequency.length > 0
        ) {
          // compare last one
          return (
            nextTimeFrequency[nextTimeFrequency.length - 1] -
            prevTimeFrequency[prevTimeFrequency.length - 1]
          )
        }
        return nextTimeFrequency.length - prevTimeFrequency.length
      })
      .map(([contextMenuItem]) => contextMenuItem)
    favoriteMediatorLog.info(
      'FavoriteMediator getFavorites',
      cacheItems,
      favorites,
    )
    return favorites
  }
  public async useFavorite(contextMenuItem: IContextMenuItem) {
    favoriteMediatorLog.info('FavoriteMediator useFavorite', contextMenuItem)
    this.lfuCache.get(contextMenuItem.id)
    this.notify()
    await this.saveCacheToLocalStorage()
  }
  public async setFavorite(contextMenuItem: IContextMenuItem) {
    favoriteMediatorLog.info('FavoriteMediator setFavorite', contextMenuItem)
    this.lfuCache.set(contextMenuItem.id, contextMenuItem)
    this.notify()
    await this.saveCacheToLocalStorage()
  }
  public subscribe(listener: FavoriteMediatorListener) {
    this.ubSubscribe(listener)
    this.listeners.push(listener)
  }
  private async saveCacheToLocalStorage() {
    const cacheItems: [IContextMenuItem, number[]][] = []
    this.lfuCache.getCache().forEach((cacheItem) => {
      cacheItems.push(cacheItem)
    })
    favoriteMediatorLog.info(
      'FavoriteMediator saveCacheToLocalStorage',
      this.buttonSettingKey,
    )
    await setFavoriteContextMenuToLocalStorage(cacheItems)
  }
  private notify() {
    const favorites = this.getFavorites()
    this.listeners.forEach((listener) => {
      listener(favorites)
    })
  }
  private ubSubscribe(listener: FavoriteMediatorListener) {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }
}

class FavoriteMediatorFactory {
  private static mediators: Record<
    IChromeExtensionButtonSettingKey,
    FavoriteMediator
  > = {
    textSelectPopupButton: new FavoriteMediator('textSelectPopupButton'),
    gmailButton: new FavoriteMediator('gmailButton'),
  }
  public static getMediator(
    mediatorName: IChromeExtensionButtonSettingKey,
  ): FavoriteMediator {
    return FavoriteMediatorFactory.mediators[mediatorName]
  }
}

export default FavoriteMediatorFactory
