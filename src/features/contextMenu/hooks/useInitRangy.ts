// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from '@/lib/rangy/rangy-core'
import { useCallback, useEffect, useRef } from 'react'

import initRangyPosition from '@/lib/rangy/rangy-position'
import initRangySaveRestore from '@/lib/rangy/rangy-saverestore'
import { useRangy } from './useRangy'
import debounce from 'lodash-es/debounce'
import { checkIsCanInputElement } from '@/features/contextMenu/utils'
import {
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import useEffectOnce from '@/hooks/useEffectOnce'
import { listenIframeMessage } from '@/iframe'
import runEmbedShortCuts from '@/features/contextMenu/utils/runEmbedShortCuts'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { useCreateClientMessageListener } from '@/background/utils'
import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import Log from '@/utils/Log'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { hideChatBox, isShowChatBox, showChatBox } from '@/utils'
import { AppState } from '@/store'
import {
  ISelectionElement,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
import { createSelectionElement } from '@/features/contextMenu/utils/selectionHelper'
import { ROOT_CONTAINER_ID, ROOT_CONTEXT_MENU_ID } from '@/types'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)

const AIInputLog = new Log('ContextMenu/Rangy/AIInput')
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useInitRangy = () => {
  const {
    initRangyCore,
    rangy,
    showRangy,
    hideRangy,
    saveTempSelection,
    currentSelection,
  } = useRangy()
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(FloatingDropdownMenuSystemItemsState)
  const setAppState = useSetRecoilState(AppState)
  const targetElementRef = useRef<HTMLElement | null>(null)
  const selectionElementRef = useRef<
    ISelectionElement | IVirtualIframeSelectionElement | null
  >(null)
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
  // 呼出floating button:
  // 1. 获取选中文本
  // 2. 获取选中html
  // 3. 获取选中rect
  // 4. 获取active element
  // 5. 保存选中状态
  // 6. 显示floating button
  const saveHighlightedRangeAndShowContextMenu = useCallback(
    (event: MouseEvent | KeyboardEvent) => {
      {
        const activeElement: HTMLElement | null = event.target as HTMLElement
        const isMouseEvent = event instanceof MouseEvent
        const rangySelection = rangy?.getSelection()
        console.log(
          '[ContextMenu Module]: event',
          isMouseEvent ? 'MouseEvent' : 'KeyboardEvent',
          activeElement,
        )
        if (activeElement) {
          /**
           * @description 进来这个if有以下几种情况
           * 1. rangy有选区
           * 2. rangy没有选区，但是原生有选区
           * 3. rangy和原生都没有选区, 但是iframe有mousedown事件
           */
          // 1. rangy有选区
          if (rangySelection && rangySelection?.toString()?.trim()) {
            selectionElementRef.current = createSelectionElement(
              activeElement,
              {
                selectionText: rangySelection?.toString()?.trim(),
                selectionHTML: rangySelection?.toHtml(),
                selectionRect: rangy?.getSelection()?.getBoundingClientRect(),
                target: activeElement,
                eventType: isMouseEvent ? 'mouseup' : 'keyup',
              },
            )
          } else {
            // 2. rangy没有选区, 并且选取不在sidebar/contextMenu上
            if (
              activeElement.id !== ROOT_CONTAINER_ID &&
              activeElement.id !== ROOT_CONTEXT_MENU_ID
            ) {
              selectionElementRef.current = createSelectionElement(
                activeElement,
                {
                  target: activeElement,
                  eventType: isMouseEvent ? 'mouseup' : 'keyup',
                },
              )
            }
          }
        }
        if (
          selectionElementRef.current &&
          selectionElementRef.current?.selectionText
        ) {
          saveTempSelection({
            selectionText:
              selectionElementRef.current?.editableElementSelectionText ||
              selectionElementRef.current.selectionText,
            selectionHTML:
              selectionElementRef.current?.editableElementSelectionText ||
              selectionElementRef.current.selectionHTML,
            selectionRect: selectionElementRef.current.selectionRect,
            activeElement: selectionElementRef.current.target as HTMLElement,
            selectionInputAble: selectionElementRef.current?.isEditableElement,
            selectionElement: selectionElementRef.current,
          })
          console.log(
            '[ContextMenu Module]: selectionString',
            '\n',
            selectionElementRef.current.selectionText,
            '\n',
            selectionElementRef.current.selectionHTML,
            '\n',
            selectionElementRef.current.selectionRect,
          )
          showRangy()
        } else {
          console.log('[ContextMenu Module]: hideRangy')
          hideRangy()
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
    const mouseDownListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isIframeTarget = target?.tagName === 'IFRAME'
      if (checkIsCanInputElement(target) || isIframeTarget) {
        if (targetElementRef.current?.isSameNode(target)) {
          return
        }
        if (targetElementRef.current) {
          console.log(
            '[ContextMenu Module]: remove editable element listener',
            targetElementRef.current,
          )
          if (targetElementRef.current?.tagName === 'IFRAME') {
            const iframeTarget = targetElementRef.current as HTMLIFrameElement
            iframeTarget.contentDocument?.body.removeEventListener(
              'mouseup',
              mouseUpListener,
            )
          } else {
            targetElementRef.current.removeEventListener(
              'mouseup',
              mouseUpListener,
            )
          }
          targetElementRef.current.removeEventListener('keyup', keyupListener)
        }
        targetElementRef.current = target
        console.log('[ContextMenu Module]: update editable element', target)
        console.log(
          '[ContextMenu Module]: bind editable element listener',
          target,
        )
        if (isIframeTarget) {
          // const iframeTarget = target as HTMLIFrameElement
          // iframeTarget.contentDocument?.body.addEventListener(
          //   'mouseup',
          //   mouseUpListener,
          // )
          // mouseUpListener(event)
        } else {
          target.addEventListener('mouseup', mouseUpListener)
        }
        target.addEventListener('keyup', keyupListener)
      } else {
        console.log(
          '[ContextMenu Module]: remove editable element',
          event.target,
          event.currentTarget,
        )
        AIInputLog.info('remove editable element')
        targetElementRef.current = null
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
        // AIInputLog.info('iframe message', iframeSelectionData)
        // Virtual Elements
        //  如果既不是可编辑元素，也没有选中的文本，不处理
        if (!iframeSelectionData.selectionText) {
          // 因为触发了iframe的点击，页面本身的元素肯定失焦了，所以隐藏
          hideRangy()
          if (!iframeSelectionData.isEditableElement) {
            AIInputLog.info('remove editable element')
            selectionElementRef.current = null
            return
          }
        }
        // AIInputLog.info('set editable element', virtualTarget)
        selectionElementRef.current = iframeSelectionData
        // show floating button
        if (iframeSelectionData.selectionText) {
          if (iframeSelectionData.eventType === 'mouseup') {
            mouseUpListener({
              target: null,
            } as any)
          } else {
            keyupListener({
              target: null,
            } as any)
          }
        }
        if (
          iframeSelectionData.isEmbedPage &&
          iframeSelectionData.selectionText &&
          iframeSelectionData?.tagName === 'BUTTON'
        ) {
          // try to run shortcuts
          runEmbedShortCuts()
        }
        if (!iframeSelectionData.selectionText) {
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
          AIInputLog.info('listen message')
          /**
           * floating menu 展开逻辑:
           * 1. 如果当前在input中，展开
           * 2. 如果当前有选中的文本，展开
           * 3. 如果都不符合，展开chat box
           */
          if (
            selectionElementRef.current &&
            (selectionElementRef.current?.selectionText ||
              selectionElementRef.current?.isEditableElement)
          ) {
            // 如果当前在input中，展开
            const virtualSelectionElement: IVirtualIframeSelectionElement =
              selectionElementRef.current as any
            // 1. 打开ai input
            // 2. 阻止打开chatBox
            AIInputLog.info('open', virtualSelectionElement)
            showFloatingContextMenuWithVirtualSelection({
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
          } else {
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
          return {
            success: true,
            data: {},
            message: '',
          }
        }
        break
    }
    return undefined
  })
  /**
   * @description - 保存AI最后的输出, 用于用户选择插入/替换时通知插件, 让插件更新输入框
   */
  // 保存ai最后的输出
  const lastOutputRef = useRef('')
  useEffect(() => {
    lastOutputRef.current = floatingDropdownMenuSystemItems.lastOutput
  }, [floatingDropdownMenuSystemItems.lastOutput])
  // 在用户选择插入/替换时通知插件，让插件更新输入框
  const currentSelectionRefElement = useRef<ISelectionElement | undefined>(
    currentSelection?.selectionElement,
  )
  useEffect(() => {
    currentSelectionRefElement.current = currentSelection?.selectionElement
  }, [currentSelection])
  useEffect(() => {
    const target =
      currentSelectionRefElement.current || selectionElementRef.current
    if (
      floatingDropdownMenuSystemItems.selectContextMenuId &&
      ['Replace selection', 'Insert below', 'Discard'].includes(
        floatingDropdownMenuSystemItems.selectContextMenuId,
      )
    ) {
      setFloatingDropdownMenu({
        open: false,
        rootRect: null,
      })
      setFloatingDropdownMenuSystemItems({
        selectContextMenuId: '',
        lastOutput: '',
      })
      hideRangy()
    }
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
