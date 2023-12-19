import { useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'
import Browser from 'webextension-polyfill'

import { CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY } from '@/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { AppDBStorageState } from '@/store'

export interface ContextMenuSearchTextStoreI18nStore {
  [key: string]: string
}

/**
 * @example: { en: {'d0176963-2376-4dd8-acfc-95af778195b9': 'Poem...'}, zh_CN: {'d0176963-2376-4dd8-acfc-95af778195b9': '诗歌...Poem...'}
 */
export interface ContextMenuSearchTextStore {
  [key: string]: ContextMenuSearchTextStoreI18nStore
}

export const getContextMenuSearchTextStore = async (): Promise<ContextMenuSearchTextStore> => {
  try {
    const cache = await Browser.storage.local.get(
      CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY,
    )
    if (cache[CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY]) {
      return JSON.parse(
        cache[CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY] || '{}',
      ) as ContextMenuSearchTextStore
    }
    return {}
  } catch (e) {
    return {}
  }
}

export const setContextMenuSearchTextStore = async (
  lang: string,
  contextMenuSearchTextI18nStore: ContextMenuSearchTextStoreI18nStore,
) => {
  try {
    const cache = await getContextMenuSearchTextStore()
    cache[lang] = contextMenuSearchTextI18nStore
    await Browser.storage.local.set({
      [CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY]: JSON.stringify(cache),
    })
  } catch (e) {
    console.log(e)
  }
}

export const removeContextMenuSearchTextStore = async (lang: string) => {
  try {
    const cache = await getContextMenuSearchTextStore()
    delete cache[lang]
    await Browser.storage.local.set({
      [CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY]: JSON.stringify(cache),
    })
  } catch (e) {
    console.log(e)
  }
}

export const clearContextMenuSearchTextStore = async () => {
  try {
    await Browser.storage.local.remove(
      CONTEXT_MENU_SEARCH_TEXT_LOCAL_STORAGE_KEY,
    )
  } catch (e) {
    console.log(e)
  }
}

export const useContextMenuSearchTextStore = () => {
  const { userSettings } = useRecoilValue(AppDBStorageState)
  const [
    contextMenuSearchTextStore,
    setContextMenuSearchTextStore,
  ] = useState<ContextMenuSearchTextStore>({})
  const contextMenuSearchTextWithCurrentLanguage = useMemo<ContextMenuSearchTextStoreI18nStore>(() => {
    if (userSettings?.preferredLanguage) {
      return contextMenuSearchTextStore[userSettings.preferredLanguage] || {}
    }
    return {}
  }, [userSettings?.preferredLanguage, contextMenuSearchTextStore])
  useFocus(() => {
    getContextMenuSearchTextStore().then(setContextMenuSearchTextStore)
  })
  useEffectOnce(() => {
    getContextMenuSearchTextStore().then(setContextMenuSearchTextStore)
  })
  return {
    contextMenuSearchTextWithCurrentLanguage,
    setContextMenuSearchTextStore,
  }
}
