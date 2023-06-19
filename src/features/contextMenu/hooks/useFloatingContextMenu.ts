import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import {
  cloneRect,
  computedRectPosition,
  isFloatingContextMenuVisible,
} from '@/features/contextMenu/utils'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import { useCallback, useMemo } from 'react'
import { IVirtualIframeSelectionElement } from '@/features/contextMenu/types'
import {
  createSelectionMarker,
  getEditableElementSelectionTextOnSpecialHost,
} from '@/features/contextMenu/utils/selectionHelper'
import cloneDeep from 'lodash-es/cloneDeep'
import { hideChatBox, isShowChatBox, showChatBox } from '@/utils'
import Log from '@/utils/Log'
import { AppState } from '@/store'

const log = new Log('ContextMenu/useFloatingContextMenu')

const useFloatingContextMenu = () => {
  const setAppState = useSetRecoilState(AppState)
  const { saveCurrentSelection, show, hideRangy, tempSelection } = useRangy()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )

  const memoIsFloatingMenuVisible = useMemo(() => {
    return floatingDropdownMenu.open
  }, [floatingDropdownMenu.open])

  /**
   * 展示floating menu 基于virtual selection
   * @param element
   */
  const showFloatingContextMenuWithVirtualElement = useCallback(
    (element: IVirtualIframeSelectionElement) => {
      let virtualSelectionElement: IVirtualIframeSelectionElement = element
      /**
       * floating menu 展开逻辑:
       * 1. 如果当前在editable element中，展开
       * 2. 如果当前有选中的文本，展开
       * 3. 如果都不符合，展开chat box
       */
      if (
        !isFloatingContextMenuVisible() &&
        virtualSelectionElement &&
        (virtualSelectionElement?.selectionText ||
          virtualSelectionElement?.isEditableElement)
      ) {
        log.info('open', virtualSelectionElement)
        // 1. 如果是可编辑元素，设置marker和获取实际的selection text
        if (
          virtualSelectionElement.isEditableElement &&
          virtualSelectionElement.target
        ) {
          const selectionMarkerData = createSelectionMarker(
            virtualSelectionElement.target,
          )
          log.info('Selection text: \n', selectionMarkerData.selectionString)
          if (!selectionMarkerData.selectionString) {
            selectionMarkerData.selectionString =
              getEditableElementSelectionTextOnSpecialHost(
                virtualSelectionElement.target,
              )
            log.info(
              'Get special host selection text: \n',
              selectionMarkerData.selectionString,
            )
          }
          if (selectionMarkerData) {
            const cloneSelectionElement = cloneDeep(virtualSelectionElement)
            cloneSelectionElement.startMarkerId =
              selectionMarkerData.startMarkerId
            cloneSelectionElement.endMarkerId = selectionMarkerData.endMarkerId
            cloneSelectionElement.editableElementSelectionText =
              selectionMarkerData.selectionString
            cloneSelectionElement.editableElementSelectionHTML =
              selectionMarkerData.selectionString
            // 更新selection rect
            virtualSelectionElement = cloneSelectionElement
            console.log(
              '[ContextMenu Module]: selectionMarkerData',
              selectionMarkerData,
            )
          }
        }
        // 2. 展示floating menu
        saveCurrentSelection({
          selectionText:
            virtualSelectionElement.editableElementSelectionText ||
            virtualSelectionElement.selectionText ||
            '',
          selectionHTML:
            virtualSelectionElement.editableElementSelectionText ||
            virtualSelectionElement.selectionText ||
            '',
          selectionRect: virtualSelectionElement.selectionRect,
          activeElement: virtualSelectionElement.target as HTMLElement,
          selectionInputAble: virtualSelectionElement.isEditableElement,
          selectionElement: virtualSelectionElement,
        })
        // 3. 隐藏rangy
        hideRangy()
        setFloatingDropdownMenu({
          open: true,
          rootRect: computedRectPosition(virtualSelectionElement.selectionRect),
        })
      } else {
        // 如果都不符合，展开chat box
        if (isShowChatBox()) {
          hideChatBox()
          setAppState((prevState) => {
            return {
              ...prevState,
              open: false,
            }
          })
        } else {
          showChatBox()
          setAppState((prevState) => {
            return {
              ...prevState,
              open: true,
            }
          })
        }
      }
    },
    [],
  )

  const showFloatingContextMenuWithElement = (
    element: HTMLElement,
    text: string,
  ) => {
    const rect = cloneRect(element.getBoundingClientRect())
    const virtualSelection = {
      selectionText: text,
      selectionHTML: text,
      selectionRect: rect,
      selectionInputAble: false,
      activeElement: document.activeElement as HTMLElement,
    }
    saveCurrentSelection(virtualSelection)
    hideRangy()
    console.log(
      '[ContextMenu Module]: render [context menu]',
      computedRectPosition(virtualSelection.selectionRect),
    )
    setFloatingDropdownMenu({
      open: true,
      rootRect: computedRectPosition(virtualSelection.selectionRect),
    })
  }
  const showFloatingContextMenu = () => {
    if (show && !floatingDropdownMenu.open && tempSelection) {
      saveCurrentSelection(tempSelection)
      hideRangy()
      const savedRangeRect = tempSelection.selectionRect
      console.log(
        '[ContextMenu Module]: render [context menu]',
        computedRectPosition(savedRangeRect),
      )
      setFloatingDropdownMenu({
        open: true,
        rootRect: computedRectPosition(savedRangeRect),
      })
      return true
    } else {
      return false
    }
  }
  const hideFloatingContextMenu = () => {
    setFloatingDropdownMenu({
      open: false,
      rootRect: null,
    })
  }
  return {
    isFloatingMenuVisible: memoIsFloatingMenuVisible,
    showFloatingContextMenu,
    hideFloatingContextMenu,
    haveSelection: show,
    floatingDropdownMenuOpen: floatingDropdownMenu.open,
    showFloatingContextMenuWithElement,
    showFloatingContextMenuWithVirtualElement,
  }
}

export { useFloatingContextMenu }
