import {
  getChromeExtensionSettings,
  IChromeExtensionSettingsKey,
} from '@/utils'
import { IContextMenuItem } from '@/features/contextMenu/store'
import { useEffect, useMemo, useState } from 'react'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { useRangy } from '@/features/contextMenu/hooks/useRangy'

const useContextMenuList = (
  settingsKey: IChromeExtensionSettingsKey,
  defaultList: IContextMenuItem[],
  query?: string,
) => {
  const { rangyState, parseRangySelectRangeData } = useRangy()
  const [originContextMenuList, setOriginContextMenuList] = useState<
    IContextMenuItem[]
  >([])
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const settings = await getChromeExtensionSettings()
      if (isDestroy) return
      setOriginContextMenuList(settings[settingsKey] || defaultList)
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [])
  const contextMenuList = useMemo(() => {
    console.log('useFloatingContextMenuList', query)
    if (query?.trim()) {
      return fuzzySearchContextMenuList(
        groupByContextMenuItem(cloneDeep(originContextMenuList)),
        query,
      )
    }
    if (settingsKey === 'gmailToolBarContextMenu') {
      return groupByContextMenuItem(cloneDeep(originContextMenuList)).map(
        (group, index) => {
          if (index === 0) {
            // gmail只有一个group
            // group第一个作为cta button
            group.children = group.children.slice(1)
          }
          return group
        },
      )
    } else if (settingsKey === 'contextMenus') {
      const groupList = groupByContextMenuItem(cloneDeep(originContextMenuList))
      const editOrReviewSelection = groupList.find(
        (group) => group.text === 'Edit or review selection',
      )
      const generateFromSelection = groupList.find(
        (group) => group.text === 'Generate from selection',
      )
      const currentRange = rangyState.lastSelectionRanges
      if (editOrReviewSelection && generateFromSelection) {
        if (currentRange) {
          const selectionData = parseRangySelectRangeData(
            currentRange?.selectRange,
            'ContextMenuList',
          )
          if (selectionData.isCanInputElement) {
            return [editOrReviewSelection, generateFromSelection]
          } else {
            return [generateFromSelection, editOrReviewSelection]
          }
        } else if (rangyState.currentActiveWriteableElement) {
          return [editOrReviewSelection, generateFromSelection]
        }
      }
    }
    return groupByContextMenuItem(cloneDeep(originContextMenuList))
  }, [
    rangyState.lastSelectionRanges,
    rangyState.currentActiveWriteableElement,
    originContextMenuList,
    settingsKey,
    query,
  ])
  return {
    contextMenuList,
    originContextMenuList,
  }
}
export { useContextMenuList }
