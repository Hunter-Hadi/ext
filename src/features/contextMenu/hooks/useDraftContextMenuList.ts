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
    // 过滤掉Replace Selection
    if (!currentSelection?.selectionElement?.editableElementSelectionText) {
      return CONTEXT_MENU_DRAFT_LIST.filter((item) => {
        return ![
          CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
          CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
        ].includes(item.id)
      })
    } else {
      return CONTEXT_MENU_DRAFT_LIST.filter((item) => {
        return ![CONTEXT_MENU_DRAFT_TYPES.INSERT].includes(item.id)
      })
    }
    return CONTEXT_MENU_DRAFT_LIST
  }, [currentSelection])
}
export { useDraftContextMenuList }
