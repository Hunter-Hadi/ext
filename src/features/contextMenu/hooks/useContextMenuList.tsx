import { IChromeExtensionSettingsContextMenuKey } from '@/utils'
import { IContextMenuItem } from '@/features/contextMenu/store'
import { useMemo, useRef } from 'react'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { useChromeExtensionSettingsContextMenuList } from '@/hooks'

const useContextMenuList = (
  settingsKey: IChromeExtensionSettingsContextMenuKey,
  query?: string,
) => {
  const originContextMenuList =
    useChromeExtensionSettingsContextMenuList(settingsKey)
  const originContextMenuListRef = useRef<IContextMenuItem[]>([])
  const groupByContextMenuList = useMemo(() => {
    originContextMenuListRef.current = originContextMenuList
    return groupByContextMenuItem(cloneDeep(originContextMenuList))
  }, [originContextMenuList])
  const contextMenuList = useMemo(() => {
    console.log('useFloatingContextMenuList', query)
    if (query?.trim()) {
      return fuzzySearchContextMenuList(originContextMenuListRef.current, query)
    }
    if (settingsKey === 'gmailToolBarContextMenu') {
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
  }, [groupByContextMenuList, settingsKey, query])
  return {
    contextMenuList,
    originContextMenuList,
  }
}
export { useContextMenuList }
