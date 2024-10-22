import cloneDeep from 'lodash-es/cloneDeep'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

import useFloatingContextMenuPin from '@/features/contextMenu/hooks/useFloatingContextMenuPin'
import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import {
  FloatingContextWindowChangesState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { IVirtualIframeSelectionElement } from '@/features/contextMenu/types'
import {
  cloneRect,
  computedRectPosition,
  floatingContextMenuSaveDraftToChatBox,
  isFloatingContextMenuVisible,
} from '@/features/contextMenu/utils'
import { createSelectionMarker } from '@/features/contextMenu/utils/selectionHelper'
import {
  hideChatBox,
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppState } from '@/store'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import Log from '@/utils/Log'

const log = new Log('ContextMenu/useFloatingContextMenu')

const useFloatingContextMenu = () => {
  const setAppState = useSetRecoilState(AppState)
  const { saveCurrentSelection, show, hideRangy, tempSelection } = useRangy()
  const { floatingDropdownMenuPin, setFloatingDropdownMenuPin } =
    useFloatingContextMenuPin()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const [contextWindowChanges, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )
  const memoIsFloatingMenuVisible = useMemo(() => {
    return floatingDropdownMenu.open
  }, [floatingDropdownMenu.open])

  const floatingDropdownMenuPinRef = useRef(floatingDropdownMenuPin)
  floatingDropdownMenuPinRef.current = floatingDropdownMenuPin

  const contextWindowModeRef = useRef(contextWindowChanges.contextWindowMode)
  useEffect(() => {
    contextWindowModeRef.current = contextWindowChanges.contextWindowMode
  }, [contextWindowChanges.contextWindowMode])
  /**
   * 展示floating menu 基于virtual selection
   * @param element
   * @since 2023-06-19
   * @version 1.1.0
   * @changelog
   * - 1.0.0: chat box和floating menu的展开逻辑共用插件的快捷键
   * - 1.1.0: floating menu只会在有选中文本的可编辑元素上或者按下command + i展开，其余情况展开chat box
   */
  const showFloatingContextMenuWithVirtualElement = useCallback(
    (
      element?: IVirtualIframeSelectionElement,
      overwriteSelectionElement?: Partial<IVirtualIframeSelectionElement>,
      openFloatingContextMenu?: boolean,
      forceShowModelSelector?: boolean,
    ) => {
      if (
        contextWindowModeRef.current !== 'READ' &&
        !floatingDropdownMenuPinRef.current
      ) {
        if (contextWindowModeRef.current !== 'LOADING') {
          // 如果是编辑模式，不展示floating menu
          setContextWindowChanges((prev) => {
            return {
              ...prev,
              discardChangesModalVisible: true,
            }
          })
        }
        return
      }
      let virtualSelectionElement: IVirtualIframeSelectionElement | undefined =
        element
      /**
       * floating menu 展开逻辑:
       * 1. 如果当前在editable element中，展开
       * 2. 如果当前有选中的文本，展开
       * 3. 如果openFloatingContextMenu为true，展开
       * 4. 如果都不符合，展开chat box
       */
      if (
        !isFloatingContextMenuVisible() &&
        virtualSelectionElement &&
        (virtualSelectionElement?.selectionText ||
          virtualSelectionElement?.isEditableElement ||
          openFloatingContextMenu)
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
          const saveSelectionData = cloneDeep(virtualSelectionElement)
          // 这里就是看看editable element是否有选中的文本
          saveSelectionData.editableElementSelectionText =
            selectionMarkerData.editableElementSelectionText
          saveSelectionData.editableElementSelectionHTML =
            selectionMarkerData.editableElementSelectionText
          saveSelectionData.selectionText = selectionMarkerData.selectionText
          if (selectionMarkerData) {
            saveSelectionData.startMarkerId = selectionMarkerData.startMarkerId
            saveSelectionData.endMarkerId = selectionMarkerData.endMarkerId
            saveSelectionData.selectionText = selectionMarkerData.selectionText
            saveSelectionData.editableElementSelectionText =
              selectionMarkerData.editableElementSelectionText
            // 更新selection rect
            virtualSelectionElement = saveSelectionData
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
        // 2. 如果当前有选中文本在不可编辑元素上或者可编辑元素上有真正的选中文本在或者按下command + i, 则展开
        let showModelSelector = true
        if (forceShowModelSelector) {
          showModelSelector = forceShowModelSelector
        } else if (
          element?.target &&
          getMaxAISidebarRootElement()?.contains(element?.target)
        ) {
          showModelSelector = false
        }
        if (
          (!virtualSelectionElement?.isEditableElement &&
            virtualSelectionElement.selectionText) ||
          virtualSelectionElement?.editableElementSelectionText ||
          openFloatingContextMenu
        ) {
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
            rootRect: computedRectPosition(
              virtualSelectionElement.selectionRect,
            ),
            showModelSelector,
          })
          return
        }
      }
      // 2023-07-10 @huangsong
      // - 点击button（或者按⌘J）的效果是从当前popup转移到sidebar里
      // - 也就是打开sidebar，并且关闭当前popup，把popup的内容转移到sidebar里
      // - 如果当前sidebar本来就是打开的，就保持打开状态就行
      const isFloatingContextMenuOpen = isFloatingContextMenuVisible()
      if (isFloatingContextMenuOpen) {
        floatingContextMenuSaveDraftToChatBox()
      }
      if (!floatingDropdownMenuPinRef.current) {
        hideRangy()
        setFloatingDropdownMenu({
          open: false,
          rootRect: null,
          showModelSelector: !!forceShowModelSelector,
        })
      }
      // immersive page下显示的就是sidebar，不处理
      if (isMaxAIImmersiveChatPage()) {
        return
      }
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
    },
    [],
  )

  const showFloatingContextMenuWithElement = (
    element: HTMLElement,
    text: string,
    openFloatingContextMenu?: boolean,
    forceShowModelSelector?: boolean,
  ) => {
    const rect = cloneRect(element.getBoundingClientRect())
    const virtualSelection = {
      selectionText: text,
      selectionHTML: text,
      selectionRect: computedRectPosition(rect),
      isEditableElement: false,
      target: element,
      editableElementSelectionText: '',
      editableElementSelectionHTML: '',
    }
    showFloatingContextMenuWithVirtualElement(
      virtualSelection as IVirtualIframeSelectionElement,
      {},
      openFloatingContextMenu,
      forceShowModelSelector,
    )
  }
  const showFloatingContextMenu = () => {
    if (show && !floatingDropdownMenu.open && tempSelection) {
      showFloatingContextMenuWithVirtualElement(
        tempSelection.selectionElement as IVirtualIframeSelectionElement,
        {},
        true,
      )
    }
  }
  const hideFloatingContextMenu = (force = false) => {
    if (!force && floatingDropdownMenuPin) return
    setFloatingDropdownMenu({
      open: false,
      rootRect: null,
      showModelSelector: false,
    })
  }
  return {
    floatingDropdownMenu,
    floatingDropdownMenuPin,
    setFloatingDropdownMenu,
    setFloatingDropdownMenuPin,
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
