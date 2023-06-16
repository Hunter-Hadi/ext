// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from '@/lib/rangy/rangy-core'
import { useCallback, useEffect, useRef } from 'react'

import initRangyPosition from '@/lib/rangy/rangy-position'
import initRangySaveRestore from '@/lib/rangy/rangy-saverestore'
import { useRangy } from './useRangy'
import debounce from 'lodash-es/debounce'
import {
  getDraftContextMenuTypeById,
  isFloatingContextMenuVisible,
} from '@/features/contextMenu/utils'
import {
  FloatingContextMenuDraftState,
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
  ContextMenuDraftType,
  ISelectionElement,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
import {
  createSelectionElement,
  createSelectionMarker,
  getEditableElement,
  getEditableElementSelectionTextOnSpecialHost,
  getSelectionBoundaryElement,
  removeAllRange,
  removeAllSelectionMarker,
  removeEditableElementPlaceholder,
  updateEditableElementPlaceholder,
} from '@/features/contextMenu/utils/selectionHelper'
import { ROOT_CONTAINER_ID, ROOT_CONTEXT_MENU_ID } from '@/constants'
import cloneDeep from 'lodash-es/cloneDeep'
import useCommands from '@/hooks/useCommands'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)

const AIInputLog = new Log('ContextMenu/Rangy/AIInput')
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useInitRangy = () => {
  const {
    show,
    initRangyCore,
    rangy,
    showRangy,
    hideRangy,
    saveTempSelection,
    currentSelection,
  } = useRangy()
  const { shortCutKey } = useCommands()
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [, setFloatingContextMenuDraft] = useRecoilState(
    FloatingContextMenuDraftState,
  )
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
  const floatingButtonIsShowRef = useRef(show)
  useEffect(() => {
    floatingButtonIsShowRef.current = show
  }, [show])
  const saveHighlightedRangeAndShowContextMenu = useCallback(
    (event: MouseEvent | KeyboardEvent) => {
      {
        if (floatingButtonIsShowRef.current) {
          // check is Escape
          if (event instanceof KeyboardEvent && event.key === 'Escape') {
            console.log('[ContextMenu Module]: Escape close floating button')
            hideRangy()
            removeAllSelectionMarker()
            removeAllRange()
            return
          }
        }
        let activeElement: HTMLElement | null = event.target as HTMLElement
        const isMouseEvent = event instanceof MouseEvent
        const rangySelection = rangy?.getSelection()
        // 有activeElement(iframe传递的是没有activeElement的), 且选区不在sidebar/contextMenu上
        if (
          activeElement &&
          activeElement.id !== ROOT_CONTAINER_ID &&
          activeElement.id !== ROOT_CONTEXT_MENU_ID
        ) {
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
            console.log(
              '[ContextMenu Module]: RANGY',
              selectionElementRef.current,
            )
          } else {
            // 2. rangy没有选区
            // 这里是mousedown记录的editable element, 如果有的话替换mouseup阶段的activeElement
            if (targetElementRef.current) {
              activeElement = targetElementRef.current
            }
            const nativeSelectionElement = getSelectionBoundaryElement()
            if (
              nativeSelectionElement &&
              activeElement.tagName !== 'INPUT' &&
              activeElement.tagName !== 'TEXTAREA'
            ) {
              const { editableElement } = getEditableElement(
                nativeSelectionElement,
              )
              activeElement =
                (editableElement as HTMLElement) ||
                (nativeSelectionElement as HTMLElement)
            }
            selectionElementRef.current = createSelectionElement(
              activeElement,
              {
                target: activeElement,
                eventType: isMouseEvent ? 'mouseup' : 'keyup',
              },
            )
            console.log(
              '[ContextMenu Module]: NATIVE',
              selectionElementRef.current,
            )
          }
        }
        if (
          selectionElementRef.current &&
          selectionElementRef.current?.selectionText
        ) {
          console.log(
            '[ContextMenu Module]: event',
            isMouseEvent ? 'MouseEvent' : 'KeyboardEvent',
            activeElement,
          )
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
            `[ContextMenu Module] [${selectionElementRef.current?.isEditableElement}]: selectionString`,
            '\n',
            selectionElementRef.current.selectionText,
            // '\n',
            // selectionElementRef.current.selectionHTML,
            // '\n',
            // selectionElementRef.current.selectionRect,
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
  // 页面editElement点击事件，因为window.getSelection()其实无法准确定位到textarea/input的位置,所以要在mousedown的时候保存一下
  useEffect(() => {
    const mouseUpListener = debounce(
      saveHighlightedRangeAndShowContextMenu,
      200,
    )
    const keyupListener = debounce(saveHighlightedRangeAndShowContextMenu, 200)
    const mouseDownListener = (event: MouseEvent) => {
      const mouseTarget = event.target as HTMLElement
      const { isEditableElement, editableElement } =
        getEditableElement(mouseTarget)
      if (isEditableElement && editableElement) {
        if (targetElementRef.current?.isSameNode(editableElement)) {
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
        targetElementRef.current = editableElement
        shortCutKey &&
          updateEditableElementPlaceholder(
            editableElement,
            `Press '${shortCutKey}' for AI`,
          )
        console.log(
          '[ContextMenu Module]: update editable element',
          editableElement,
        )
        console.log(
          '[ContextMenu Module]: bind editable element listener',
          editableElement,
        )
        editableElement.addEventListener('mouseup', mouseUpListener)
        editableElement.addEventListener('keyup', keyupListener)
      } else {
        console.log(
          '[ContextMenu Module]: remove editable element',
          event.target,
          event.currentTarget,
        )
        AIInputLog.info('remove editable element')
        targetElementRef.current = null
        shortCutKey &&
          removeEditableElementPlaceholder(`Press '${shortCutKey}' for AI`)
      }
    }
    document.addEventListener('mousedown', mouseDownListener)
    return () => {
      document.removeEventListener('mousedown', mouseDownListener)
    }
  }, [rangy, saveHighlightedRangeAndShowContextMenu, shortCutKey])
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
  }, [rangy, saveHighlightedRangeAndShowContextMenu, runEmbedShortCuts])
  const openFloatingMenu = useCallback(() => {
    AIInputLog.info('listen message')
    /**
     * floating menu 展开逻辑:
     * 1. 如果当前在editable element中，展开
     * 2. 如果当前有选中的文本，展开
     * 3. 如果都不符合，展开chat box
     */
    if (
      !isFloatingContextMenuVisible() &&
      selectionElementRef.current &&
      (selectionElementRef.current?.selectionText ||
        selectionElementRef.current?.isEditableElement)
    ) {
      let virtualSelectionElement: IVirtualIframeSelectionElement =
        selectionElementRef.current as any
      AIInputLog.info('open', virtualSelectionElement)
      // 1. 如果是可编辑元素，设置marker和获取实际的selection text
      if (
        selectionElementRef.current &&
        selectionElementRef.current?.isEditableElement &&
        selectionElementRef.current?.target
      ) {
        const selectionMarkerData = createSelectionMarker(
          selectionElementRef.current?.target,
        )
        AIInputLog.info(
          'Selection text: \n',
          selectionMarkerData.selectionString,
        )
        if (!selectionMarkerData.selectionString) {
          selectionMarkerData.selectionString =
            getEditableElementSelectionTextOnSpecialHost(
              selectionElementRef.current?.target,
            )
          AIInputLog.info(
            'Get special host selection text: \n',
            selectionMarkerData.selectionString,
          )
        }
        if (selectionMarkerData) {
          const cloneSelectionElement = cloneDeep(selectionElementRef.current)
          cloneSelectionElement.startMarkerId =
            selectionMarkerData.startMarkerId
          cloneSelectionElement.endMarkerId = selectionMarkerData.endMarkerId
          cloneSelectionElement.editableElementSelectionText =
            selectionMarkerData.selectionString
          cloneSelectionElement.editableElementSelectionHTML =
            selectionMarkerData.selectionString
          selectionElementRef.current = cloneSelectionElement
          virtualSelectionElement =
            cloneSelectionElement as IVirtualIframeSelectionElement
          console.log(
            '[ContextMenu Module]: selectionMarkerData',
            selectionMarkerData,
          )
        }
      }
      // 2. 展示floating menu
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
  }, [])
  useCreateClientMessageListener(async (event, data, sender) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenOpenChatMessageBox':
        {
          openFloatingMenu()
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
    /**
     * 点击后需要关闭floating context menu的context menu
     */
    const needCloseFloatingContextMenus: ContextMenuDraftType[] = [
      'REPLACE_SELECTION',
      'INSERT_BELOW',
      'DISCARD',
    ]
    const selectedDraftContextMenuType = getDraftContextMenuTypeById(
      floatingDropdownMenuSystemItems.selectContextMenuId || '',
    )
    if (!selectedDraftContextMenuType) {
      console.log(
        '[ContextMenu Module]: selectedDraftContextMenuType cannot find',
      )
      return
    }
    if (needCloseFloatingContextMenus.includes(selectedDraftContextMenuType)) {
      setFloatingDropdownMenu({
        open: false,
        rootRect: null,
      })
      setFloatingDropdownMenuSystemItems({
        selectContextMenuId: '',
        lastOutput: '',
      })
      hideRangy()
      selectionElementRef.current = null
    }
    switch (selectedDraftContextMenuType) {
      case 'INSERT_BELOW':
        {
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
        break
      case 'REPLACE_SELECTION':
        {
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
        break
      case 'TRY_AGAIN':
        {
          setFloatingContextMenuDraft((prevState) => {
            if (prevState.draftList.length === 0) {
              return prevState
            }
            const copyDraftList = cloneDeep(prevState.draftList)
            copyDraftList.pop()
            return {
              draft: copyDraftList.join('\n\n').replace(/\n{2,}/, '\n\n'),
              draftList: copyDraftList,
            }
          })
        }
        break
      default:
        break
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])
}

export default useInitRangy
