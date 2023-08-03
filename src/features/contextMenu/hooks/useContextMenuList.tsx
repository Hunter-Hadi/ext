import { useMemo, useRef } from 'react'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { useComputedChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import useFavoriteContextMenuList from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { useContextMenuSearchTextStore } from '@/features/sidebar/store/contextMenuSearchTextStore'

const useContextMenuList = (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
  query?: string,
) => {
  const buttonSettings =
    useComputedChromeExtensionButtonSettings(buttonSettingKey)
  const { favoriteContextMenuGroup } =
    useFavoriteContextMenuList(buttonSettingKey)
  const { contextMenuSearchTextWithCurrentLanguage } =
    useContextMenuSearchTextStore()
  const originContextMenuListRef = useRef<IContextMenuItem[]>([])
  const groupByContextMenuList = useMemo(() => {
    const originContextMenuList = buttonSettings?.contextMenu || []
    originContextMenuListRef.current = originContextMenuList
    const groupByContextMenuList = groupByContextMenuItem(
      cloneDeep(originContextMenuList),
    )
    if (favoriteContextMenuGroup) {
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
    if (buttonSettingKey === 'gmailButton') {
      return groupByContextMenuList.map((group, index) => {
        if (index === 0) {
          // gmail只有一个group
          // group第一个作为cta button
          group.children = group.children.slice(1)
        }
        return group
      })
    }
    return groupByContextMenuList
  }, [groupByContextMenuList, buttonSettingKey, query])
  return {
    contextMenuList,
    originContextMenuList: buttonSettings?.contextMenu || [],
  }
}
export { useContextMenuList }
