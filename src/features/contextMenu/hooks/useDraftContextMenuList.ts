import { useRecoilValue } from 'recoil'
import { RangyState } from '@/features/contextMenu/store'
import { useMemo } from 'react'
import {
  CONTEXT_MENU_DRAFT_LIST,
  CONTEXT_MENU_DRAFT_TYPES,
} from '@/features/contextMenu/constants'

const useDraftContextMenuList = () => {
  const { currentSelection } = useRecoilValue(RangyState)
  return useMemo(() => {
    // 过滤掉Replace Selection
    if (!currentSelection?.selectionElement?.editableElementSelectionText) {
      return CONTEXT_MENU_DRAFT_LIST.filter((item) => {
        return item.id !== CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION
      })
    }
    return CONTEXT_MENU_DRAFT_LIST
  }, [currentSelection])
}
export { useDraftContextMenuList }
