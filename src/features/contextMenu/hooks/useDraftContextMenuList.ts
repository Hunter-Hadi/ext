import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'

import {
  CONTEXT_MENU_DRAFT_LIST,
  CONTEXT_MENU_DRAFT_TYPES,
} from '@/features/contextMenu/constants'
import { RangyState } from '@/features/contextMenu/store'
import { getInputMediator } from '@/store/InputMediator'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

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
    let filteredId = []
    // 如果点击的是 Instant reply button, 过滤掉 Insert below, Insert, Replace
    if (
      currentSelection?.selectionElement?.target?.getAttribute(
        'maxai-input-assistant-button-id',
      )
    ) {
      filteredId = [
        CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
        CONTEXT_MENU_DRAFT_TYPES.INSERT,
        CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
      ]
      // 目前只有 gmail 支持 Accept_and_copy
      if (getCurrentDomainHost() !== 'mail.google.com') {
        filteredId.push(CONTEXT_MENU_DRAFT_TYPES.ACCEPT_AND_COPY)
      }
    } else if (currentSelection?.selectionElement?.isEditableElement) {
      // 如果有选中文字,过滤掉Insert, Accept_and_copy
      if (currentSelection?.selectionElement?.editableElementSelectionText) {
        filteredId = [
          CONTEXT_MENU_DRAFT_TYPES.INSERT,
          CONTEXT_MENU_DRAFT_TYPES.ACCEPT_AND_COPY,
        ]
      } else {
        // 如果有选中文字,过滤掉Replace和Insert below, Accept_and_copy
        filteredId = [
          CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
          CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
          CONTEXT_MENU_DRAFT_TYPES.ACCEPT_AND_COPY,
        ]
      }
    } else {
      // 如果不是可编辑元素,过滤掉 Insert below, Insert, Replace, Accept_and_copy
      filteredId = [
        CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
        CONTEXT_MENU_DRAFT_TYPES.INSERT,
        CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
        CONTEXT_MENU_DRAFT_TYPES.ACCEPT_AND_COPY,
      ]
    }

    return filteredList.filter((item) => {
      return !filteredId.includes(item.id)
    })
  }, [currentSelection, searchText])
}
export { useDraftContextMenuList }
