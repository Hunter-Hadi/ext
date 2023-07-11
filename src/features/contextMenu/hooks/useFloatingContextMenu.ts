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
    (
      element?: IVirtualIframeSelectionElement,
      overwriteSelectionElement?: Partial<IVirtualIframeSelectionElement>,
    ) => {
      let virtualSelectionElement: IVirtualIframeSelectionElement | undefined =
        element
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
          // 这里是基于editable element创建选区
          const selectionMarkerData = createSelectionMarker(
            virtualSelectionElement.target,
          )
          const cloneSelectionElement = cloneDeep(virtualSelectionElement)
          // 这里就是看看editable element是否有选中的文本
          cloneSelectionElement.editableElementSelectionText =
            selectionMarkerData.editableElementSelectionText
          cloneSelectionElement.editableElementSelectionHTML =
            selectionMarkerData.editableElementSelectionText
          cloneSelectionElement.selectionText =
            selectionMarkerData.selectionText
          // 如果没有选中的文本，就试图获取整个editable element的上下文，并且区分host
          if (
            !cloneSelectionElement.editableElementSelectionText &&
            !cloneSelectionElement.selectionText
          ) {
            selectionMarkerData.selectionText =
              getEditableElementSelectionTextOnSpecialHost(
                virtualSelectionElement.target,
              )
            log.info(
              'Get special host selection text: \n',
              selectionMarkerData.selectionText,
            )
          }
          if (selectionMarkerData) {
            cloneSelectionElement.startMarkerId =
              selectionMarkerData.startMarkerId
            cloneSelectionElement.endMarkerId = selectionMarkerData.endMarkerId
            cloneSelectionElement.selectionText =
              selectionMarkerData.selectionText
            // 更新selection rect
            virtualSelectionElement = cloneSelectionElement
          }
        }
        console.log(
          `[ContextMenu Module]: \n[editableElementSelectionText]:${virtualSelectionElement.editableElementSelectionText}\n[selectionText]:${virtualSelectionElement.selectionText}`,
        )
        if (overwriteSelectionElement) {
          virtualSelectionElement = {
            ...virtualSelectionElement,
            ...overwriteSelectionElement,
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
        // 2023-07-10 @huangsong
        // - 点击button（或者按⌘J）的效果是从当前popup转移到sidebar里
        // - 也就是打开sidebar，并且关闭当前popup
        // - 如果当前sidebar本来就是打开的，就保持打开状态就行
        const isFloatingContextMenuOpen = isFloatingContextMenuVisible()
        hideRangy()
        setFloatingDropdownMenu({
          open: false,
          rootRect: null,
        })
        if (isFloatingContextMenuOpen) {
          showChatBox()
          setAppState((prevState) => {
            return {
              ...prevState,
              open: true,
            }
          })
          return
        }
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
      showFloatingContextMenuWithVirtualElement(
        tempSelection.selectionElement as IVirtualIframeSelectionElement,
      )
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
