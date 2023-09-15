import { useMemo, useRef } from 'react'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { useChromeExtensionButtonSettingsWithVisibility } from '@/background/utils/buttonSettings'
import useFavoriteContextMenuList from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { useContextMenuSearchTextStore } from '@/features/sidebar/store/contextMenuSearchTextStore'
import uniqBy from 'lodash-es/uniqBy'
import { sortBy } from 'lodash-es'

const useContextMenuList = (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
  query?: string,
  needFavoriteContextMenu = true,
) => {
  const buttonSettings =
    useChromeExtensionButtonSettingsWithVisibility(buttonSettingKey)
  const { favoriteContextMenuGroup } =
    useFavoriteContextMenuList(buttonSettingKey)
  const { contextMenuSearchTextWithCurrentLanguage } =
    useContextMenuSearchTextStore()
  const originContextMenuListRef = useRef<IContextMenuItem[]>([])
  const groupByContextMenuList = useMemo(() => {
    const originContextMenuList = uniqBy(
      cloneDeep(buttonSettings?.contextMenu || []),
      'id',
    )
    originContextMenuListRef.current = originContextMenuList
    let groupByContextMenuList = groupByContextMenuItem(originContextMenuList)
    groupByContextMenuList = sortBy(groupByContextMenuList, (group) => {
      if (group.data.editable) {
        return buttonSettings?.contextMenuPosition === 'end' ? 0 : 2
      }
      return 1
    })
    if (favoriteContextMenuGroup && needFavoriteContextMenu) {
      groupByContextMenuList.unshift(favoriteContextMenuGroup)
    }
    return groupByContextMenuList
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
