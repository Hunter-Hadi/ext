/**
 * search with ai 缓存器
 *
 * 用 用户的搜索关键词 作为 key，缓存用户的 ai completedMessage
 *
 */
import Browser from 'webextension-polyfill'

import { ISearchWithAIProviderType } from '../constants'
import { ISearchPageKey } from '../utils'

interface ISearchWithAICacheType {
  // key = `${searchPage}-${aiProvider}-${query}-${webAccess}`
  key: string

  searchPage: ISearchPageKey
  aiProvider: ISearchWithAIProviderType
  query: string
  completedMessage: string
  webAccess: boolean
  sources: Array<any>

  time: number
}

const SEARCH_WITH_AI_CACHE_STORAGE_KEY = 'SEARCH_WITH_AI_CACHE_STORAGE_KEY'

// 有效期 1 天
const SEARCH_WITH_AI_CACHE_EXPIRE_TIME = 1000 * 60 * 60 * 24

// 保存数量限制 100 条
const SEARCH_WITH_AI_CACHE_MAX_LENGTH = 100

const setSearchWithAICache = async (newData: ISearchWithAICacheType) => {
  await setSearchWithAICacheBatch([newData])
}

const setSearchWithAICacheBatch = async (
  newData: ISearchWithAICacheType[],
  cover = false,
) => {
  const oldData = (await getSearchWithAICache()) ?? []

  await Browser.storage.local.set({
    [SEARCH_WITH_AI_CACHE_STORAGE_KEY]: cover
      ? newData
      : [...oldData, ...newData],
  })
}

const getSearchWithAICache = async () => {
  try {
    const localData =
      (await Browser.storage.local.get(SEARCH_WITH_AI_CACHE_STORAGE_KEY)) ?? []

    return (localData[SEARCH_WITH_AI_CACHE_STORAGE_KEY] ??
      []) as ISearchWithAICacheType[]
  } catch (error) {
    return []
  }
}

const cleanSearchWithAICache = async () => {
  // 清理 cache 的过程
  // 删除 过期一天的 cache， 并且只保留 100 条
  const data = await getSearchWithAICache()
  const now = Date.now()

  // if (data.length < SEARCH_WITH_AI_CACHE_MAX_LENGTH) {
  //   return
  // }

  const newData = data.filter((item) => {
    return now - item.time < SEARCH_WITH_AI_CACHE_EXPIRE_TIME
  })

  await setSearchWithAICacheBatch(
    // 由于需要 从数组尾部开始截取，所以需要 * -1
    newData.slice(SEARCH_WITH_AI_CACHE_MAX_LENGTH * -1),
    true,
  )
}

const removeSearchWithAICacheByKey = async (key: string) => {
  const data = await getSearchWithAICache()
  const newData = data.filter((item) => item.key !== key)
  await setSearchWithAICacheBatch(newData, true)
}

// 统一 key 的生成方式
const generateSearchWithAICacheKey = (
  searchPage: ISearchWithAICacheType['searchPage'],
  aiProvider: ISearchWithAICacheType['aiProvider'],
  query: ISearchWithAICacheType['query'],
  webAccess: ISearchWithAICacheType['webAccess'],
) => {
  return `${searchPage}-${aiProvider}-${String(query.trim())}-${String(
    webAccess,
  )}`
}

const useSearchWithAICache = () => {
  const getSearchWithAICacheData = async (
    searchPage: ISearchWithAICacheType['searchPage'],
    aiProvider: ISearchWithAICacheType['aiProvider'],
    query: ISearchWithAICacheType['query'],
    webAccess: ISearchWithAICacheType['webAccess'],
  ) => {
    const key = generateSearchWithAICacheKey(
      searchPage,
      aiProvider,
      query,
      webAccess,
    )
    const data = await getSearchWithAICache()

    const cacheData = data.find((item) => item.key === key)

    if (!cacheData) {
      return null
    }

    // 检查是否过期
    const now = Date.now()
    if (now - cacheData.time > SEARCH_WITH_AI_CACHE_EXPIRE_TIME) {
      await removeSearchWithAICacheByKey(key)
      return null
    }

    return cacheData
  }

  const setSearchWithAICacheData = async (
    newData: Omit<ISearchWithAICacheType, 'key' | 'time'>,
  ) => {
    const key = generateSearchWithAICacheKey(
      newData.searchPage,
      newData.aiProvider,
      newData.query,
      newData.webAccess,
    )

    await setSearchWithAICache({
      ...newData,
      key,
      time: Date.now(),
    })

    // 每次 set 的时候 执行一次 clean
    cleanSearchWithAICache()
  }

  return {
    getSearchWithAICacheData,
    setSearchWithAICacheData,
  }
}

export default useSearchWithAICache
