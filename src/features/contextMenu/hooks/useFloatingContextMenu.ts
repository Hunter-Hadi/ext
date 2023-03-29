import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import { cloneRect, computedRectPosition } from '@/features/contextMenu/utils'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'

const useFloatingContextMenu = () => {
  const {
    tempSelectRangeRect,
    currentActiveWriteableElement,
    saveSelection,
    show,
    hideRangy,
  } = useRangy()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const showFloatingContextMenu = () => {
    if (show && !floatingDropdownMenu.open) {
      const saved = saveSelection()
      const activeElementRect =
        currentActiveWriteableElement?.getBoundingClientRect()
      hideRangy()
      const savedRangeRect = saved?.selectRange?.getBoundingClientRect?.()
      if (savedRangeRect) {
        console.log(
          '[ContextMenu Module]: render [context menu]',
          computedRectPosition(savedRangeRect),
        )
        setFloatingDropdownMenu({
          open: true,
          rootRect: computedRectPosition(savedRangeRect),
        })
      } else if (activeElementRect) {
        console.log(
          '[ContextMenu Module]: render [button] (no range)',
          activeElementRect,
          currentActiveWriteableElement,
          tempSelectRangeRect,
        )
        if (
          activeElementRect.x +
            activeElementRect.y +
            activeElementRect.width +
            activeElementRect.height ===
          0
        ) {
          if (tempSelectRangeRect) {
            console.log(
              '[ContextMenu Module]: render [context menu]',
              tempSelectRangeRect,
            )
            setFloatingDropdownMenu({
              open: true,
              rootRect: tempSelectRangeRect,
            })
          }
        } else {
          console.log(
            '[ContextMenu Module]: render [context menu]',
            computedRectPosition(cloneRect(activeElementRect)),
          )
          setFloatingDropdownMenu({
            open: true,
            rootRect: computedRectPosition(cloneRect(activeElementRect)),
          })
        }
      }
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
  }
}

export { useFloatingContextMenu }
