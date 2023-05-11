import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import { cloneRect, computedRectPosition } from '@/features/contextMenu/utils'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'

const useFloatingContextMenu = () => {
  const { saveCurrentSelection, show, hideRangy, tempSelection } = useRangy()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const showFloatingContextMenuWithVirtualSelection = (
    element: HTMLElement,
    text: string,
  ) => {
    const rect = cloneRect(element.getBoundingClientRect())
    const virtualSelection = {
      selectionText: text,
      selectionHtml: text,
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
    showFloatingContextMenu,
    hideFloatingContextMenu,
    haveSelection: show,
    floatingDropdownMenuOpen: floatingDropdownMenu.open,
    showFloatingContextMenuWithVirtualSelection,
  }
}

export { useFloatingContextMenu }
