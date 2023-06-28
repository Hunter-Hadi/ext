import { useMemo, useRef } from 'react'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { useComputedChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'

const useContextMenuList = (
  buttonKey: IChromeExtensionButtonSettingKey,
  query?: string,
) => {
  const buttonSettings = useComputedChromeExtensionButtonSettings(buttonKey)
  const originContextMenuListRef = useRef<IContextMenuItem[]>([])
  const groupByContextMenuList = useMemo(() => {
    const originContextMenuList = buttonSettings?.contextMenu || []
    originContextMenuListRef.current = originContextMenuList
    return groupByContextMenuItem(cloneDeep(originContextMenuList))
  }, [buttonSettings])
  const contextMenuList = useMemo(() => {
    if (query?.trim()) {
      return fuzzySearchContextMenuList(originContextMenuListRef.current, query)
    }
    if (buttonKey === 'gmailButton') {
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
  }, [groupByContextMenuList, buttonKey, query])
  return {
    contextMenuList,
    originContextMenuList: buttonSettings?.contextMenu || [],
  }
}
export { useContextMenuList }
