import {
  getChromeExtensionSettings,
  IChromeExtensionSettingsKey,
} from '@/utils'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/store'
import { useEffect, useMemo, useState } from 'react'
import { groupByContextMenuItem } from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { useRangy } from '@/features/contextMenu/hooks/useRangy'

const useContextMenuList = (
  settingsKey: IChromeExtensionSettingsKey,
  defaultList: IContextMenuItem[],
) => {
  const { rangyState, parseRangySelectRangeData } = useRangy()
  const [list, setList] = useState<IContextMenuItemWithChildren[]>([])
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const settings = await getChromeExtensionSettings()
      if (isDestroy) return
      setList(groupByContextMenuItem(settings[settingsKey] || defaultList))
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [])
  const memoList = useMemo(() => {
    if (settingsKey === 'gmailToolBarContextMenu') {
      return cloneDeep(list).map((group, index) => {
        if (index === 0) {
          // gmail只有一个group
          // group第一个作为cta button
          group.children = group.children.slice(1)
        }
        return group
      })
    } else if (settingsKey === 'contextMenus') {
      const editOrReviewSelection = list.find(
        (group) => group.text === 'Edit or review selection',
      )
      const generateFromSelection = list.find(
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
    return list
  }, [
    rangyState.lastSelectionRanges,
    rangyState.currentActiveWriteableElement,
    list,
    settingsKey,
  ])
  return {
    list: memoList,
  }
}
export { useContextMenuList }
