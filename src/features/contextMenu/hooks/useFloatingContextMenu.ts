import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import { cloneRect, computedRectPosition } from '@/features/contextMenu/utils'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import { useMemo } from 'react'
import { ISelection } from '@/features/contextMenu/types'

const useFloatingContextMenu = () => {
  const { saveCurrentSelection, show, hideRangy, tempSelection } = useRangy()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )

  const memoIsFloatingMenuVisible = useMemo(() => {
    return floatingDropdownMenu.open
  }, [floatingDropdownMenu.open])

  const showFloatingContextMenuWithVirtualSelection = (
    virtualSelection: ISelection,
  ) => {
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
    showFloatingContextMenuWithVirtualSelection,
  }
}

export { useFloatingContextMenu }
