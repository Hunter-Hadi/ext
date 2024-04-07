import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'

import {
  CONTEXT_MENU_DRAFT_LIST,
  CONTEXT_MENU_DRAFT_TYPES,
} from '@/features/contextMenu/constants'
import { RangyState } from '@/features/contextMenu/store'
import { getInputMediator } from '@/store/InputMediator'

const useDraftContextMenuList = () => {
  const [searchText, setSearchText] = useState<string>('')
  const { currentSelection } = useRecoilValue(RangyState)
  useEffect(() => {
    const handleInputUpdate = (newInputValue: string) => {
      setSearchText(newInputValue)
    }
    getInputMediator('floatingMenuInputMediator').subscribe(handleInputUpdate)
    return () => {
      getInputMediator('floatingMenuInputMediator').unsubscribe(
        handleInputUpdate,
      )
    }
  }, [])
  return useMemo(() => {
    const filteredList = CONTEXT_MENU_DRAFT_LIST.filter((item) => {
      return item.text.toLowerCase().includes(searchText.toLowerCase())
    })
    if (currentSelection?.selectionElement?.isEditableElement) {
      // 如果有选中文字,过滤掉Insert
      if (currentSelection?.selectionElement?.editableElementSelectionText) {
        return filteredList.filter((item) => {
          return ![CONTEXT_MENU_DRAFT_TYPES.INSERT].includes(item.id)
        })
      } else {
        // 如果有选中文字,过滤掉Replace和Insert below
        return filteredList.filter((item) => {
          return ![
            CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
            CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
          ].includes(item.id)
        })
      }
    } else {
      // 如果不是可编辑元素,过滤掉 Insert below, Insert, Replace
      return filteredList.filter((item) => {
        return ![
          CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
          CONTEXT_MENU_DRAFT_TYPES.INSERT,
          CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
        ].includes(item.id)
      })
    }
  }, [currentSelection, searchText])
}
export { useDraftContextMenuList }
