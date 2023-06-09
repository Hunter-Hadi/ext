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
import {
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
  IRangyRect,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import { ROOT_CONTAINER_ID } from '@/types'
import useEffectOnce from '@/hooks/useEffectOnce'
import { IVirtualIframeElement, listenIframeMessage } from '@/iframe'
import runEmbedShortCuts from '@/features/contextMenu/utils/runEmbedShortCuts'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useCreateClientMessageListener } from '@/background/utils'
import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import Log from '@/utils/Log'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)

const AiInputLog = new Log('Rangy/AiInput')
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useInitRangy = () => {
  const { initRangyCore, rangy, showRangy, hideRangy, saveTempSelection } =
    useRangy()
  const setFloatingDropdownMenu = useSetRecoilState(FloatingDropdownMenuState)
  const floatingDropdownMenuSystemItems = useRecoilValue(
    FloatingDropdownMenuSystemItemsState,
  )
  const currentActiveWriteableElementRef = useRef<HTMLElement | null>(null)
  const currentIframeActiveWriteableElementRef = useRef<HTMLElement | null>(
    null,
  )
  // 在inputAble元素直接打开ai input
  const { showFloatingContextMenuWithVirtualSelection } =
    useFloatingContextMenu()
  // 初始化rangy npm 包
  useEffectOnce(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      import('@/lib/rangy/rangy-core'),
      import('@/lib/rangy/rangy-position'),
      import('@/lib/rangy/rangy-saverestore'),
    ]).then(
      ([
        { default: rangyLib },
        { default: initRangyPosition },
        { default: initRangySaveRestore },
      ]) => {
        const initListener = () => {
          initRangyCore(rangyLib)
        }
        initRangyPosition(rangyLib)
        initRangySaveRestore(rangyLib)
        rangyLib.init()
        rangyLib.addInitListener(initListener)
      },
    )
  })
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
            if (selectionText.trim()) {
              showRangy()
              return
            }
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
        // 如果是iframe的selectionRect，不移除
        if (
          (
            currentActiveWriteableElementRef.current as any as IVirtualIframeElement
          ).iframeSelectionRect
        ) {
          return
        }
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
    // 和注入iframe的content script通信
    let clearListener: any = () => {
      // nothing
    }
    if (rangy?.initialized) {
      console.log('init mouse event')
      document.addEventListener('mouseup', mouseUpListener)
      document.addEventListener('keyup', keyupListener)
      clearListener = listenIframeMessage((iframeSelectionData) => {
        console.log(iframeSelectionData)
        // Virtual Elements
        const virtualTarget = {
          virtual: true,
          ...iframeSelectionData,
          tagName: 'IFRAME',
        } as any
        currentActiveWriteableElementRef.current = virtualTarget
        currentIframeActiveWriteableElementRef.current = virtualTarget
        if (iframeSelectionData.eventType === 'mouseup') {
          mouseUpListener({
            target: currentActiveWriteableElementRef.current,
          } as any)
        } else {
          keyupListener({
            target: currentActiveWriteableElementRef.current,
          } as any)
        }
        if (
          iframeSelectionData.isEmbedPage &&
          iframeSelectionData.iframeSelectionString &&
          iframeSelectionData.tagName === 'BUTTON'
        ) {
          // try to run shortcuts
          runEmbedShortCuts()
        }
        if (!iframeSelectionData.iframeSelectionString) {
          setFloatingDropdownMenu((prev) => {
            return {
              ...prev,
              open: false,
            }
          })
        }
      })
    }
    return () => {
      document.removeEventListener('mouseup', mouseUpListener)
      document.removeEventListener('keyup', keyupListener)
      clearListener()
    }
  }, [rangy])
  useCreateClientMessageListener(async (event, data, sender) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenOpenChatMessageBox':
        {
          AiInputLog.info('listen message')
          if (currentActiveWriteableElementRef.current) {
            const target: IVirtualIframeElement =
              currentActiveWriteableElementRef.current as any
            if (target.isInputElement) {
              // 1. 打开ai input
              // 2. 阻止打开chatBox
              AiInputLog.info('open', target)
              showFloatingContextMenuWithVirtualSelection({
                selectionText: target.iframeInputElementString || '',
                selectionHtml: target.iframeInputElementString || '',
                selectionRect: target.iframeSelectionRect,
                activeElement: document.activeElement as HTMLElement,
                selectionInputAble: target.isInputElement,
              })
            }
            return {
              success: true,
              data: {},
              message: '',
            }
          }
        }
        break
    }
    return undefined
  })
  const lastOutputRef = useRef('')
  useEffect(() => {
    lastOutputRef.current = floatingDropdownMenuSystemItems.lastOutput
  }, [floatingDropdownMenuSystemItems.lastOutput])
  useEffect(() => {
    const target: IVirtualIframeElement =
      (currentIframeActiveWriteableElementRef.current as any) ||
      (currentActiveWriteableElementRef.current as any)
    if (
      floatingDropdownMenuSystemItems.selectContextMenuId === 'Insert below'
    ) {
      if (target) {
        port.postMessage({
          event: 'Client_updateIframeInput',
          data: {
            value: lastOutputRef.current,
            type: 'insert_blow',
            startMarkerId: target.startMarkerId,
            endMarkerId: target.endMarkerId,
            caretOffset: target.caretOffset,
          },
        })
      }
    }
    if (
      floatingDropdownMenuSystemItems.selectContextMenuId ===
      'Replace selection'
    ) {
      if (target) {
        port.postMessage({
          event: 'Client_updateIframeInput',
          data: {
            value: lastOutputRef.current,
            type: 'replace',
            startMarkerId: target.startMarkerId,
            endMarkerId: target.endMarkerId,
            caretOffset: target.caretOffset,
          },
        })
      }
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])
}

export default useInitRangy
