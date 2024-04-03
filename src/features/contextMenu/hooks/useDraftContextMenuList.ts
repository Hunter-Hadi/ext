import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import {
  CONTEXT_MENU_DRAFT_LIST,
  CONTEXT_MENU_DRAFT_TYPES,
} from '@/features/contextMenu/constants'
import { RangyState } from '@/features/contextMenu/store'

const useDraftContextMenuList = () => {
  const { currentSelection } = useRecoilValue(RangyState)
  return useMemo(() => {
    if (currentSelection?.selectionElement?.isEditableElement) {
      // 如果有选中文字,过滤掉Insert
      if (currentSelection?.selectionElement?.editableElementSelectionText) {
        return CONTEXT_MENU_DRAFT_LIST.filter((item) => {
          return ![CONTEXT_MENU_DRAFT_TYPES.INSERT].includes(item.id)
        })
      } else {
        // 如果有选中文字,过滤掉Replace和Insert below
        return CONTEXT_MENU_DRAFT_LIST.filter((item) => {
          return ![
            CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
            CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
          ].includes(item.id)
        })
      }
    } else {
      // 如果不是可编辑元素,过滤掉 Insert below, Insert, Replace
      return CONTEXT_MENU_DRAFT_LIST.filter((item) => {
        return ![
          CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
          CONTEXT_MENU_DRAFT_TYPES.INSERT,
          CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
        ].includes(item.id)
      })
    }
  }, [currentSelection])
}
export { useDraftContextMenuList }
