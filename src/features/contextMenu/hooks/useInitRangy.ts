// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from 'rangy'
import { useEffect } from 'react'
import { contextMenu } from 'react-contexify'

import initRangyPosition from '../lib/rangy-position'
import initRangySaveRestore from '../lib/rangy-saverestore'
import { useRangy } from '../hooks'
import debounce from 'lodash-es/debounce'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)
rangyLib.contextMenu = {
  init() {
    this.init.show = false
    console.log('init')
  },
  show() {
    this.init.show = true
  },
  close() {
    console.log('[ContextMenu Module]: hideAll')
    this.init.show = false
    try {
      rangyLib.getSelection().removeAllRanges()
    } catch (e) {
      console.log(e)
    }
    contextMenu.hideAll()
  },
  isOpen() {
    return this.init.show
  },
}

const useInitRangy = () => {
  const { initRangyCore, rangy, showRangy, hideRangy, saveTempSelection } =
    useRangy()
  useEffect(() => {
    let isDestroyed = false
    const initListener = () => {
      if (isDestroyed) return
      initRangyCore(rangyLib)
    }
    rangyLib.init()
    rangyLib.contextMenu.init()
    rangyLib.addInitListener(initListener)
    return () => {
      isDestroyed = true
    }
  }, [])
  useEffect(() => {
    const saveHighlightedRangeAndShowContextMenu = (
      event: MouseEvent | KeyboardEvent,
    ) => {
      const isMouseEvent = event instanceof MouseEvent
      console.log(isMouseEvent)
      const highlightedBounce = rangy?.getSelection()?.getBoundingDocumentRect()
      if (highlightedBounce) {
        saveTempSelection()
        showRangy(highlightedBounce)
      }
    }
    const mouseUpListener = debounce((event: MouseEvent) => {
      console.log('[ContextMenu Module]:', 'MouseEvent')
      if (rangy.contextMenu.isOpen()) {
        console.log('[ContextMenu Module]:', 'KeyboardEvent close context menu')
        rangy.contextMenu.close()
        return
      }
      const selectionString = rangy?.getSelection()?.toString()?.trim()
      if (selectionString) {
        saveHighlightedRangeAndShowContextMenu(event)
      } else {
        hideRangy()
      }
    }, 200)

    const keyupListener = debounce((event: KeyboardEvent) => {
      console.log('[ContextMenu Module]:', 'KeyboardEvent')
      if (rangy.contextMenu.isOpen()) {
        console.log('[ContextMenu Module]:', 'KeyboardEvent close context menu')
        rangy.contextMenu.close()
        return
      }
      const selectionString = rangy?.getSelection()?.toString()?.trim()
      if (selectionString) {
        saveHighlightedRangeAndShowContextMenu(event)
      } else {
        hideRangy()
      }
    }, 200)

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
