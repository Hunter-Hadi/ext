// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from '@/lib/rangy/rangy-core'
import { useCallback, useEffect, useRef } from 'react'

import initRangyPosition from '@/lib/rangy/rangy-position'
import initRangySaveRestore from '@/lib/rangy/rangy-saverestore'
import { useRangy } from './useRangy'
import debounce from 'lodash-es/debounce'
import {
  checkIsCanInputElement,
  computedIframeSelection,
} from '@/features/contextMenu/utils'
import { IRangyRect } from '@/features/contextMenu'
import { ROOT_CONTAINER_ID } from '@/types'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)

const useInitRangy = () => {
  const { initRangyCore, rangy, showRangy, hideRangy, saveTempSelection } =
    useRangy()
  const currentActiveWriteableElementRef = useRef<HTMLElement | null>(null)
  // 初始化rangy npm 包
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
  // 保存:
  // 1. 选中文本
  // 2. 选中html
  // 3. 选中rect
  // 4. active element
  const saveHighlightedRangeAndShowContextMenu = useCallback(
    (event: MouseEvent | KeyboardEvent) => {
      {
        let selectionText = ''
        let selectionHtml = ''
        let selectionRect: IRangyRect | null = null
        const activeElement: HTMLElement | null = event.target as HTMLElement
        const isMouseEvent = event instanceof MouseEvent
        const rangySelection = rangy?.getSelection()
        const nativeSelection = window.getSelection()
        const isIframeTarget =
          currentActiveWriteableElementRef.current?.tagName === 'IFRAME'
        console.log(
          '[ContextMenu Module]: event',
          isMouseEvent ? 'MouseEvent' : 'KeyboardEvent',
          activeElement,
        )
        // 1. rangy有选区
        if (rangySelection && rangySelection?.toString()?.trim()) {
          selectionText =
            window.getSelection()?.toString() ||
            rangySelection?.toString().trim()
          selectionHtml = rangySelection?.toHtml()
          selectionRect = rangy?.getSelection()?.getBoundingClientRect()
          console.log(
            '[ContextMenu Module] [rangy]: selectionString',
            '\n',
            selectionText,
            '\n',
            selectionHtml,
            '\n',
            selectionRect,
          )
          if (selectionRect) {
            saveTempSelection({
              selectionText,
              selectionHtml,
              selectionRect,
              activeElement,
              selectionInputAble: checkIsCanInputElement(activeElement),
            })
            showRangy()
            return
          }
        } else if (nativeSelection && nativeSelection?.toString().trim()) {
          if (activeElement.id === ROOT_CONTAINER_ID) {
            hideRangy()
            return
          }
          // 2. rangy没有选区，但是原生有选区
          selectionText = nativeSelection?.toString().trim()
          selectionHtml = nativeSelection?.toString().trim()
          selectionRect = activeElement?.getBoundingClientRect()
          console.log(
            '[ContextMenu Module] [native]: selectionString',
            '\n',
            selectionText,
            '\n',
            selectionHtml,
            '\n',
            selectionRect,
          )
          if (selectionRect) {
            saveTempSelection({
              selectionText,
              selectionHtml,
              selectionRect,
              activeElement,
              selectionInputAble: checkIsCanInputElement(activeElement),
            })
            showRangy()
            return
          }
        } else if (isIframeTarget) {
          // 3. iframe
          const {
            iframeSelectionText,
            iframeSelectionRect,
            iframeSelectionElement,
            iframeSelectionHtml,
          } = computedIframeSelection(
            currentActiveWriteableElementRef.current as HTMLIFrameElement,
          )
          selectionText = iframeSelectionText
          selectionHtml = iframeSelectionHtml
          selectionRect = iframeSelectionRect
          console.log(
            '[ContextMenu Module] [iframe]: selectionString',
            '\n',
            selectionText,
            '\n',
            selectionHtml,
            '\n',
            selectionRect,
          )
          if (selectionRect && selectionText) {
            saveTempSelection({
              selectionText,
              selectionHtml,
              selectionRect,
              activeElement: iframeSelectionElement,
              selectionInputAble: checkIsCanInputElement(
                iframeSelectionElement,
              ),
            })
            showRangy()
            return
          }
        }
        console.log('[ContextMenu Module]: hideRangy')
        hideRangy()
        return
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
    const mouseDownListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isIframeTarget = target.tagName === 'IFRAME'
      if (checkIsCanInputElement(target) || isIframeTarget) {
        if (currentActiveWriteableElementRef.current?.isSameNode(target)) {
          return
        }
        if (currentActiveWriteableElementRef.current) {
          console.log(
            '[ContextMenu Module]: remove writeable element listener',
            currentActiveWriteableElementRef.current,
          )
          // TODO: iframe适配要独立成tab注入的content_script
          if (currentActiveWriteableElementRef.current?.tagName === 'IFRAME') {
            const iframeTarget =
              currentActiveWriteableElementRef.current as HTMLIFrameElement
            iframeTarget.contentDocument?.body.removeEventListener(
              'mouseup',
              mouseUpListener,
            )
          } else {
            currentActiveWriteableElementRef.current.removeEventListener(
              'mouseup',
              mouseUpListener,
            )
          }
          currentActiveWriteableElementRef.current.removeEventListener(
            'keyup',
            keyupListener,
          )
        }
        currentActiveWriteableElementRef.current = target
        console.log('[ContextMenu Module]: update writeable element', target)
        console.log(
          '[ContextMenu Module]: bind writeable element listener',
          target,
        )
        // TODO: iframe适配要独立成tab注入的content_script
        if (isIframeTarget) {
          const iframeTarget = target as HTMLIFrameElement
          iframeTarget.contentDocument?.body.addEventListener(
            'mouseup',
            mouseUpListener,
          )
          mouseUpListener(event)
        } else {
          target.addEventListener('mouseup', mouseUpListener)
        }
        target.addEventListener('keyup', keyupListener)
      } else {
        console.log(
          '[ContextMenu Module]: remove writeable element',
          event.target,
          event.currentTarget,
        )
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
