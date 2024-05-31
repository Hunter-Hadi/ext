import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import {
  ContextMenuSearchTextStore,
  ContextMenuSearchTextStoreI18nStore,
  getContextMenuSearchTextStore,
} from '@/features/sidebar/store/contextMenuSearchTextStore'
import { updateContextMenuSearchTextStore } from '@/pages/settings/utils'
import { AppDBStorageState } from '@/store'

/**
 * 右键菜单的搜索文本
 */
const useContextMenuSearchTextStore = () => {
  const { userSettings } = useRecoilValue(AppDBStorageState)
  const [contextMenuSearchTextStore, setContextMenuSearchTextStore] =
    useState<ContextMenuSearchTextStore>({})
  const contextMenuSearchTextWithCurrentLanguage =
    useMemo<ContextMenuSearchTextStoreI18nStore>(() => {
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

  useEffect(() => {
    // 当用户 preferredLanguage 设置变更时，更新搜索文本
    updateContextMenuSearchTextStore('textSelectPopupButton').then(() => {
      getContextMenuSearchTextStore().then(setContextMenuSearchTextStore)
    })
  }, [userSettings?.preferredLanguage])
  return {
    contextMenuSearchTextWithCurrentLanguage,
    setContextMenuSearchTextStore,
  }
}
export default useContextMenuSearchTextStore
