// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from '@/lib/rangy/rangy-core'
import { useCallback, useEffect, useRef } from 'react'
import { contextMenu } from 'react-contexify'

import initRangyPosition from '@/lib/rangy/rangy-position'
import initRangySaveRestore from '@/lib/rangy/rangy-saverestore'
import { useRangy } from './useRangy'
import debounce from 'lodash-es/debounce'
import { checkIsCanInputElement } from '@/features/contextMenu/utils'
import throttle from 'lodash-es/throttle'

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
  saveActiveElement(activeElement: HTMLElement) {
    this.init.activeElement = {
      activeElement: activeElement,
      text: window.getSelection()?.toString(),
      html: activeElement.innerHTML,
      getText() {
        return this.activeElement?.value || this.activeElement?.innerText || ''
      },
      getHtml() {
        return this.activeElement?.innerHTML || ''
      },
    }
  },
  resetActiveElement() {
    this.init.activeElement = undefined
  },
  getActiveElement() {
    return this.init.activeElement
  },
}

const useInitRangy = () => {
  const {
    initRangyCore,
    rangy,
    showRangy,
    hideRangy,
    saveTempSelection,
    setActiveWriteableElement,
  } = useRangy()
  const currentActiveWriteableElementRef = useRef<HTMLElement | null>(null)
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
  const saveHighlightedRangeAndShowContextMenu = useCallback(
    (event: MouseEvent | KeyboardEvent) => {
      {
        const selectionString = rangy?.getSelection()?.toString()?.trim()
        const isMouseEvent = event instanceof MouseEvent
        console.log(
          '[ContextMenu Module]:',
          isMouseEvent ? 'MouseEvent' : 'KeyboardEvent',
        )
        if (selectionString) {
          const highlightedBounce = rangy
            ?.getSelection()
            ?.getBoundingDocumentRect()
          if (highlightedBounce) {
            saveTempSelection(event)
            showRangy(highlightedBounce)
          }
          if (rangy.contextMenu.isOpen() && !isMouseEvent) {
            console.log(
              '[ContextMenu Module]:',
              'KeyboardEvent close context menu',
            )
            // rangy.contextMenu.close()
            return
          }
        } else {
          const nativeSelection = window.getSelection()
          if (
            nativeSelection?.toString().trim() &&
            currentActiveWriteableElementRef.current
          ) {
            const activeElementRect =
              currentActiveWriteableElementRef.current?.getBoundingClientRect()
            // 开始备选逻辑
            console.log(
              '[ContextMenu Module]: 备选逻辑',
              nativeSelection?.toString().trim(),
              activeElementRect,
            )
            if (activeElementRect) {
              rangy.contextMenu.saveActiveElement(
                currentActiveWriteableElementRef.current,
              )
              showRangy(activeElementRect)
            }
          } else {
            console.log('[ContextMenu Module]: hideRangy')
            hideRangy()
            return
          }
        }
      }
    },
    [rangy, saveTempSelection, showRangy, hideRangy],
  )
  // focus事件
  useEffect(() => {
    const mouseUpListener = debounce(
      saveHighlightedRangeAndShowContextMenu,
      200,
    )
    const keyupListener = debounce(saveHighlightedRangeAndShowContextMenu, 200)
    const keydownListener = throttle((event: KeyboardEvent) => {
      console.log(
        '[ContextMenu Module]: update writeable element by keydown',
        event.target,
      )
      setActiveWriteableElement(event.target as HTMLElement)
    }, 500)
    const mouseDownListener = (event: MouseEvent | KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event instanceof KeyboardEvent) {
        console.log('keyboard geili')
      }
      if (checkIsCanInputElement(target)) {
        if (currentActiveWriteableElementRef.current?.isSameNode(target)) {
          return
        }

        if (currentActiveWriteableElementRef.current) {
          console.log(
            '[ContextMenu Module]: remove writeable element listener',
            currentActiveWriteableElementRef.current,
          )
          currentActiveWriteableElementRef.current.removeEventListener(
            'mouseup',
            mouseUpListener,
          )
          currentActiveWriteableElementRef.current.removeEventListener(
            'keyup',
            keyupListener,
          )
          currentActiveWriteableElementRef.current.removeEventListener(
            'keydown',
            keydownListener,
          )
        }
        currentActiveWriteableElementRef.current = event.target as HTMLElement
        setActiveWriteableElement(currentActiveWriteableElementRef.current)
        console.log('[ContextMenu Module]: update writeable element', target)
        console.log(
          '[ContextMenu Module]: bind writeable element listener',
          currentActiveWriteableElementRef.current,
        )
        currentActiveWriteableElementRef.current.addEventListener(
          'mouseup',
          mouseUpListener,
        )
        currentActiveWriteableElementRef.current.addEventListener(
          'keyup',
          keyupListener,
        )
        currentActiveWriteableElementRef.current.addEventListener(
          'keydown',
          keydownListener,
        )
      } else {
        console.log('[ContextMenu Module]: update writeable element', null)
        currentActiveWriteableElementRef.current = null
      }
    }
    document.addEventListener('mousedown', mouseDownListener)
    return () => {
      document.removeEventListener('mousedown', mouseDownListener)
    }
  }, [rangy])
  // selection事件
  useEffect(() => {
    const mouseUpListener = debounce(
      saveHighlightedRangeAndShowContextMenu,
      200,
    )
    const keyupListener = debounce(saveHighlightedRangeAndShowContextMenu, 200)
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
