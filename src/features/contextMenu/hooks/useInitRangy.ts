// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from 'rangy'
import { useEffect } from 'react'
import { contextMenu } from 'react-contexify'

import initRangyPosition from '../lib/rangy-position'
import { useRangy } from '../hooks'
import debounce from 'lodash-es/debounce'
import { RangyContextMenuId } from '../components/RangyContextMenu'
import { getContextMenuRenderPosition } from '@/features/contextMenu/utils'

initRangyPosition(rangyLib)

const useInitRangy = () => {
  const { initRangyCore, rangy, showRangy, saveTempSelection } = useRangy()
  useEffect(() => {
    let isDestroyed = false
    const initListener = () => {
      if (isDestroyed) return
      initRangyCore(rangyLib)
    }
    rangyLib.init()
    rangyLib.addInitListener(initListener)
    return () => {
      isDestroyed = true
    }
  }, [])
  useEffect(() => {
    const saveHighlightedRangeAndShowContextMenu = (
      event: MouseEvent | KeyboardEvent,
      usingTextPosition = false,
    ) => {
      const highlightedBounce = rangy?.getSelection()?.getBoundingDocumentRect()
      if (highlightedBounce) {
        const { x, y } = getContextMenuRenderPosition(highlightedBounce)
        console.log('show rangy', x, y)
        showRangy(x, y)
        // const marker = document.createElement('div')
        // marker.style.top = `${x}px`
        // marker.style.left = `${y}px`
        // marker.style.width = '10px'
        // marker.style.height = '10px'
        // marker.style.backgroundColor = 'red'
        // marker.style.position = 'fixed'
        // marker.style.zIndex = '99999999'
        // document.body.appendChild(marker)
        saveTempSelection(rangy.getSelection().saveRanges())
        contextMenu.show({
          id: RangyContextMenuId,
          event,
          position: usingTextPosition
            ? {
                x,
                y,
              }
            : undefined,
        })
      }
    }
    const mouseUpListener = debounce((event: MouseEvent) => {
      const selectionString = rangy?.getSelection()?.toString()?.trim()
      if (selectionString) {
        saveHighlightedRangeAndShowContextMenu(event, true)
      } else {
        contextMenu.hideAll()
      }
    }, 200)
    const keyupListener = debounce((event: KeyboardEvent) => {
      const selectionString = rangy?.getSelection()?.toString()?.trim()
      if (selectionString) {
        saveHighlightedRangeAndShowContextMenu(event, true)
      } else {
        contextMenu.hideAll()
      }
    }, 500)
    if (rangy?.initialized) {
      console.log('init mouse event')
      document.addEventListener('mouseup', mouseUpListener)
      document.addEventListener('keyup', keyupListener)
    }
    return () => {
      document.removeEventListener('mouseup', mouseUpListener)
      document.removeEventListener('keyup', keyupListener)
    }
  }, [rangy])
}
export { useInitRangy }
