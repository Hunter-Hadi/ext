import { IContextMenuItem } from '@/features/contextMenu/types'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import Log from '@/utils/Log'
import LFUCache from '@/utils/cache/LFUCache'
import Browser from 'webextension-polyfill'
import { getCurrentDomainHost } from '@/utils'
import { clientGetChromeExtensionButtonSettings } from '@/features/contextMenu/utils/clientButtonSettings'

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

/**
 * 获取全部网站的收藏菜单
 */
export const getFavoriteContextMenuFromLocalStorage = async (): Promise<{
  [key in string]: [IContextMenuItem, number[]][]
}> => {
  try {
    const localStorageData = await Browser.storage.local.get(
      FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY,
    )
    return (
      JSON.parse(
        localStorageData[FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY] || '{}',
      ) || {}
    )
  } catch (e) {
    return {}
  }
}

/**
 * 设置全部网站的收藏菜单
 * @param cache
 */
export const setFavoriteContextMenuToLocalStorage = async (cache: {
  [key in string]: [IContextMenuItem, number[]][]
}) => {
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

/**
 * 重置全部网站的收藏菜单
 */
export const resetFavoriteContextMenuToLocalStorage = async (
  resetCapacity: boolean,
) => {
  try {
    await Browser.storage.local.remove(FAVORITE_CONTEXT_MENU_LOCAL_STORAGE_KEY)
    if (resetCapacity) {
      await Browser.storage.local.remove(
        FAVORITE_CONTEXT_MENU_CAPACITY_LOCAL_STORAGE_KEY,
      )
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

/**
 * 获取指定网站的收藏菜单
 * @param host
 */
export const getFavoriteContextMenuFromLocalStorageByHost = async (
  host: string,
): Promise<[IContextMenuItem, number[]][]> => {
  try {
    const cache = await getFavoriteContextMenuFromLocalStorage()
    return cache[host] || []
  } catch (e) {
    return []
  }
}
/**
 * 设置指定网站的收藏菜单
 * @param host
 * @param cache
 */

export const setFavoriteContextMenuFromLocalStorageByHost = async (
  host: string,
  cache: [IContextMenuItem, number[]][],
): Promise<boolean> => {
  try {
    const allCache = await getFavoriteContextMenuFromLocalStorage()
    allCache[host] = cache
    await setFavoriteContextMenuToLocalStorage(allCache)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 重置指定网站的收藏菜单
 * @param host
 */

export const resetFavoriteContextMenuToLocalStorageByHost = async (
  host: string,
) => {
  try {
    await setFavoriteContextMenuFromLocalStorageByHost(host, [])
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

type FavoriteMediatorListener = (favorites: IContextMenuItem[]) => void

class FavoriteMediator {
  buttonSettingKey: IChromeExtensionButtonSettingKey
  private lfuCache: LFUCache<string, IContextMenuItem>
  private host: string = getCurrentDomainHost()
  private listeners: FavoriteMediatorListener[] = []
  private capacity: number = DEFAULT_CAPACITY
  constructor(buttonSettingKey: IChromeExtensionButtonSettingKey) {
    this.buttonSettingKey = buttonSettingKey
    this.lfuCache = new LFUCache<string, IContextMenuItem>(DEFAULT_CAPACITY)
    favoriteMediatorLog.info(
      'FavoriteMediator init',
      this.buttonSettingKey,
      this.host,
    )
  }
  async restoreCacheFromLocalStorage() {
    const buttonSettings = await clientGetChromeExtensionButtonSettings(
      this.buttonSettingKey,
    )
    const favoritesCache = await getFavoriteContextMenuFromLocalStorageByHost(
      this.host,
    )
    this.capacity = await getFavoriteContextMenuCapacity()
    this.lfuCache = new LFUCache(this.capacity)
    if (favoritesCache.length) {
      // 确保缓存的菜单项在当前按钮设置中存在
      favoritesCache.forEach(([contextMenuItem, timeFrequency]) => {
        const currentContextMenuItem = (buttonSettings?.contextMenu || []).find(
          (item) => item.id === contextMenuItem.id,
        )
        if (currentContextMenuItem) {
          this.lfuCache
            .getCache()
            .set(contextMenuItem.id, [currentContextMenuItem, timeFrequency])
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
      .slice(0, this.capacity)
    favoriteMediatorLog.info(
      'FavoriteMediator getFavorites',
      cacheItems,
      favorites,
    )
    return favorites
  }
  public async favoriteContextMenu(contextMenuItem: IContextMenuItem) {
    if (this.lfuCache.getCache().get(contextMenuItem.id)) {
      await this.useFavorite(contextMenuItem)
    } else {
      await this.setFavorite(contextMenuItem)
    }
  }
  public subscribe(listener: FavoriteMediatorListener) {
    this.ubSubscribe(listener)
    this.listeners.push(listener)
  }

  public async clearCache() {
    await resetFavoriteContextMenuToLocalStorageByHost(this.host)
    await this.restoreCacheFromLocalStorage()
  }

  public async clearAllHostCache() {
    await resetFavoriteContextMenuToLocalStorage(false)
    await this.restoreCacheFromLocalStorage()
  }

  private async useFavorite(contextMenuItem: IContextMenuItem) {
    favoriteMediatorLog.info('FavoriteMediator useFavorite', contextMenuItem)
    this.lfuCache.get(contextMenuItem.id)
    this.notify()
    await this.saveCacheToLocalStorage()
  }
  private async setFavorite(contextMenuItem: IContextMenuItem) {
    favoriteMediatorLog.info('FavoriteMediator setFavorite', contextMenuItem)
    this.lfuCache.set(contextMenuItem.id, contextMenuItem)
    this.notify()
    await this.saveCacheToLocalStorage()
  }

  private async saveCacheToLocalStorage() {
    const cacheItems: [IContextMenuItem, number[]][] = []
    this.lfuCache.getCache().forEach((cacheItem) => {
      cacheItems.push(cacheItem)
    })
    favoriteMediatorLog.info(
      'FavoriteMediator saveCacheToLocalStorage',
      this.buttonSettingKey,
      this.host,
      cacheItems,
    )
    await setFavoriteContextMenuFromLocalStorageByHost(this.host, cacheItems)
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
    inputAssistantComposeNewButton: new FavoriteMediator(
      'inputAssistantComposeNewButton',
    ),
    inputAssistantComposeReplyButton: new FavoriteMediator(
      'inputAssistantComposeReplyButton',
    ),
    inputAssistantRefineDraftButton: new FavoriteMediator(
      'inputAssistantRefineDraftButton',
    ),
  }
  public static getMediator(
    mediatorName: IChromeExtensionButtonSettingKey,
  ): FavoriteMediator {
    return FavoriteMediatorFactory.mediators[mediatorName]
  }
}

export default FavoriteMediatorFactory
