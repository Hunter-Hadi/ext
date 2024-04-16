import { sortBy } from 'lodash-es'
import cloneDeep from 'lodash-es/cloneDeep'
import uniqBy from 'lodash-es/uniqBy'
import { useMemo, useRef } from 'react'

import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { useChromeExtensionButtonSettingsWithVisibility } from '@/background/utils/buttonSettings'
import useFavoriteContextMenuList from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { IContextMenuItem } from '@/features/contextMenu/types'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import useContextMenuSearchTextStore from '@/features/sidebar/hooks/useContextMenuSearchTextStore'

const useContextMenuList = (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
  query?: string,
  needFavoriteContextMenu = true,
) => {
  const buttonSettings = useChromeExtensionButtonSettingsWithVisibility(
    buttonSettingKey,
  )
  const { favoriteContextMenuGroup } = useFavoriteContextMenuList(
    buttonSettingKey,
  )
  const {
    contextMenuSearchTextWithCurrentLanguage,
  } = useContextMenuSearchTextStore()
  const originContextMenuListRef = useRef<IContextMenuItem[]>([])
  const groupByContextMenuList = useMemo(() => {
    const originContextMenuList = uniqBy(
      cloneDeep(buttonSettings?.contextMenu || []),
      'id',
    )
    originContextMenuListRef.current = originContextMenuList
    let menuList = groupByContextMenuItem(originContextMenuList)
    menuList = sortBy(menuList, (group) => {
      if (group.data.editable) {
        return buttonSettings?.contextMenuPosition === 'end' ? 0 : 2
      }
      return 1
    })
    if (favoriteContextMenuGroup && needFavoriteContextMenu) {
      menuList.unshift(favoriteContextMenuGroup)
    }
    return menuList
  }, [buttonSettings, favoriteContextMenuGroup])
  const contextMenuList = useMemo(() => {
    if (query?.trim()) {
      return fuzzySearchContextMenuList(
        originContextMenuListRef.current,
        query,
        contextMenuSearchTextWithCurrentLanguage,
      )
    }
    return groupByContextMenuList
  }, [groupByContextMenuList, buttonSettingKey, query, needFavoriteContextMenu])
  return {
    contextMenuList,
    originContextMenuList: buttonSettings?.contextMenu || [],
  }
}
export { useContextMenuList }
