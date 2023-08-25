// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from '@/lib/rangy/rangy-core'
import { useCallback, useEffect, useRef } from 'react'

import initRangyPosition from '@/lib/rangy/rangy-position'
import initRangySaveRestore from '@/lib/rangy/rangy-saverestore'
import { useRangy } from './useRangy'
import debounce from 'lodash-es/debounce'
import { getDraftContextMenuTypeById } from '@/features/contextMenu/utils'
import {
  FloatingContextMenuDraftState,
  FloatingDropdownMenuLastFocusRangeState,
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import useEffectOnce from '@/hooks/useEffectOnce'
import { listenIframeMessage } from '@/iframe'
import runEmbedShortCuts from '@/features/contextMenu/utils/runEmbedShortCuts'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useCreateClientMessageListener } from '@/background/utils'
import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import Log from '@/utils/Log'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import {
  ContextMenuDraftType,
  ISelectionElement,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
import {
  createSandboxIframeClickAndKeydownEvent,
  createSelectionElement,
  getEditableElement,
  getSelectionBoundaryElement,
  removeAllRange,
  removeAllSelectionMarker,
  useBindRichTextEditorLineTextPlaceholder,
} from '@/features/contextMenu/utils/selectionHelper'
import {
  ROOT_CLIPBOARD_ID,
  ROOT_CONTAINER_ID,
  ROOT_CONTEXT_MENU_ID,
} from '@/constants'
import useCommands from '@/hooks/useCommands'
import { AppSettingsState } from '@/store'
import { SidebarChatConversationMessagesSelector } from '@/features/sidebar'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)

const RangyLog = new Log('ContextMenu/Rangy')
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
  const appSettings = useRecoilValue(AppSettingsState)
  console.log(
    'lite appSettings',
    appSettings.buttonSettings?.textSelectPopupButton,
  )
  const userSettings = appSettings.userSettings
  const { chatBoxShortCutKey } = useCommands()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const sidebarChatMessages = useRecoilValue(
    SidebarChatConversationMessagesSelector,
  )
  const [, setFloatingContextMenuDraft] = useRecoilState(
    FloatingContextMenuDraftState,
  )
  // 保存打开floatingMenu前最后的选区
  const setFloatingDropdownMenuLastFocusRange = useSetRecoilState(
    FloatingDropdownMenuLastFocusRangeState,
  )
  // 绑定点击或者按键的placeholder事件
  useBindRichTextEditorLineTextPlaceholder()
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(FloatingDropdownMenuSystemItemsState)
  const targetElementRef = useRef<HTMLElement | null>(null)
  const selectionElementRef = useRef<
    ISelectionElement | IVirtualIframeSelectionElement | null
  >(null)
  // 在inputAble元素直接打开ai input
  const { showFloatingContextMenuWithVirtualElement } = useFloatingContextMenu()
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
            RangyLog.info('Escape close floating button')
            hideRangy()
            removeAllSelectionMarker()
            removeAllRange()
            return
          }
        }
        let activeElement: HTMLElement | null = event.target as HTMLElement
        const isMouseEvent = event instanceof MouseEvent
        const nativeSelectionElement = getSelectionBoundaryElement()
        const defaultSelectionText = (
          rangy.getSelection().toString() ||
          document?.getSelection()?.toString() ||
          ''
        )
          .trim()
          .replace(/\u200B/g, '')
        if (activeElement) {
          if (
            activeElement &&
            (activeElement.id === ROOT_CONTAINER_ID ||
              activeElement.id === ROOT_CONTEXT_MENU_ID ||
              activeElement.id === ROOT_CLIPBOARD_ID)
          ) {
            return
          }
          // 这里是mousedown记录的editable element, 如果有的话替换mouseup阶段的activeElement
          if (targetElementRef.current) {
            activeElement = targetElementRef.current
          }
          // 因为mouse up的target元素优先级特别低, 所以先尝试用nativeSelectionElement
          if (nativeSelectionElement) {
            const nativeSelectionElementData = getEditableElement(
              nativeSelectionElement,
            )
            if (nativeSelectionElementData.isEditableElement) {
              activeElement = nativeSelectionElementData.editableElement
            }
          }
          if (!activeElement) {
            return
          }
          const { editableElement } = getEditableElement(activeElement)
          if (editableElement) {
            activeElement = editableElement
          }
          if (!editableElement && !defaultSelectionText) {
            hideRangy()
            selectionElementRef.current = null
            return
          }
          selectionElementRef.current = createSelectionElement(activeElement, {
            target: activeElement,
            eventType: isMouseEvent ? 'mouseup' : 'keyup',
          })
          RangyLog.info(
            `native selection [${isMouseEvent ? 'mouse' : 'keyboard'}]: \t`,
            selectionElementRef.current,
            activeElement,
          )
        }
        let saveSelection = false
        let openFloatingButton = false
        if (selectionElementRef.current) {
          // 如果是[可编辑的元素]需要有[可编辑元素选中的文本]才保存状态
          if (selectionElementRef.current?.isEditableElement) {
            saveSelection = true
            // 因为这个阶段editableElementSelectionText有值只能是iframe传的，所以这里有两个判断
            if (
              selectionElementRef.current?.editableElementSelectionText ||
              rangy.getSelection()?.toString() ||
              document.getSelection()?.toString()
            ) {
              openFloatingButton = true
            }
          } else if (selectionElementRef.current?.selectionText) {
            // 如果不是[可编辑的元素]需要有[选中的文本]才保存状态
            saveSelection = true
            openFloatingButton = true
          }
          if (saveSelection) {
            saveTempSelection({
              selectionText:
                selectionElementRef.current?.editableElementSelectionText ||
                selectionElementRef.current.selectionText,
              selectionHTML:
                selectionElementRef.current?.editableElementSelectionText ||
                selectionElementRef.current.selectionHTML,
              selectionRect: selectionElementRef.current.selectionRect,
              activeElement: selectionElementRef.current.target as HTMLElement,
              selectionInputAble:
                selectionElementRef.current?.isEditableElement,
              selectionElement: selectionElementRef.current,
            })
            RangyLog.info(
              'save selection temp data',
              selectionElementRef.current?.isEditableElement,
              '\n',
              selectionElementRef.current?.editableElementSelectionText,
              '\n',
              selectionElementRef.current?.selectionText,
            )
          }
          if (openFloatingButton) {
            RangyLog.info('show floating button')
            showRangy()
          } else {
            RangyLog.info('hide floating button')
            hideRangy()
          }
        }
      }
    },
    [rangy, saveTempSelection, showRangy, hideRangy],
  )
  const saveHighlightedRangeAndShowContextMenuRef = useRef(
    saveHighlightedRangeAndShowContextMenu,
  )
  useEffect(() => {
    saveHighlightedRangeAndShowContextMenuRef.current =
      saveHighlightedRangeAndShowContextMenu
  }, [saveHighlightedRangeAndShowContextMenu])

  const stopIframeSandBoxListenerRef = useRef<() => void>(() => {
    // do nothing
  })
  // 页面editElement点击事件，因为window.getSelection()其实无法准确定位到textarea/input的位置,所以要在mousedown的时候保存一下
  useEffect(() => {
    const mouseUpListener = debounce(
      saveHighlightedRangeAndShowContextMenuRef.current,
      200,
    )
    const keyupListener = debounce(
      saveHighlightedRangeAndShowContextMenuRef.current,
      200,
    )
    const mouseDownListener = (event: MouseEvent) => {
      stopIframeSandBoxListenerRef.current()
      stopIframeSandBoxListenerRef.current =
        createSandboxIframeClickAndKeydownEvent(
          (virtualIframeSelectionElement) => {
            //  如果既不是可编辑元素，也没有选中的文本，不处理
            if (!virtualIframeSelectionElement.selectionText) {
              // 因为触发了iframe的点击，页面本身的元素肯定失焦了，所以隐藏
              hideRangy()
              if (!virtualIframeSelectionElement.isEditableElement) {
                selectionElementRef.current = null
                return
              }
            }
            // AIInputLog.info('set editable element', virtualTarget)
            selectionElementRef.current = virtualIframeSelectionElement
            // show floating button
            if (virtualIframeSelectionElement.selectionText) {
              if (virtualIframeSelectionElement.eventType === 'mouseup') {
                mouseUpListener({
                  target: null,
                } as any)
              } else {
                keyupListener({
                  target: null,
                } as any)
              }
            }
          },
        )
      const mouseTarget = event.target as HTMLElement
      const { isEditableElement, editableElement } =
        getEditableElement(mouseTarget)
      if (isEditableElement && editableElement) {
        if (targetElementRef.current?.isSameNode(editableElement)) {
          return
        }
        if (targetElementRef.current) {
          targetElementRef.current.removeEventListener(
            'mouseup',
            mouseUpListener,
          )
          targetElementRef.current.removeEventListener('keyup', keyupListener)
        }
        RangyLog.info('save targetElement ref', editableElement)
        targetElementRef.current = editableElement
        editableElement.addEventListener('mouseup', mouseUpListener)
        editableElement.addEventListener('keyup', keyupListener)
      } else {
        RangyLog.info('clear targetElement ref')
        targetElementRef.current = null
      }
    }
    document.addEventListener('mousedown', mouseDownListener)
    return () => {
      document.removeEventListener('mousedown', mouseDownListener)
      if (targetElementRef.current) {
        targetElementRef.current.removeEventListener('mouseup', mouseUpListener)
        targetElementRef.current.removeEventListener('keyup', keyupListener)
      }
    }
  }, [rangy, chatBoxShortCutKey, userSettings?.shortcutHintEnable])

  // selection事件
  useEffect(() => {
    const mouseUpListener = debounce(
      saveHighlightedRangeAndShowContextMenuRef.current,
      200,
    )
    const keyupListener = debounce(
      saveHighlightedRangeAndShowContextMenuRef.current,
      200,
    )
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
          const selectionCount = window.getSelection()?.rangeCount
          if (selectionCount && selectionCount > 0) {
            const lastFocusRange = window
              .getSelection()
              ?.getRangeAt(0)
              ?.cloneRange()
            setFloatingDropdownMenuLastFocusRange({
              range: lastFocusRange || null,
              selectionText: window?.getSelection()?.toString() || '',
            })
          }
          const { command } = data
          const isPressCommandI = command === 'show-floating-menu'
          // 如果没有selectionElementRef，有可能用户打开了一个自动focus的modal进行输入并且直接按下了快捷键
          // 例如: linkedin的消息输入框
          if (!selectionElementRef.current) {
            const element = getSelectionBoundaryElement()
            const { editableElement, isEditableElement } =
              getEditableElement(element)
            if (isEditableElement && editableElement) {
              selectionElementRef.current = createSelectionElement(
                editableElement,
                {
                  target: editableElement,
                  eventType: 'keyup',
                },
              )
            }
          }
          RangyLog.info(
            'Client_listenOpenChatMessageBox',
            selectionElementRef.current?.isEditableElement,
            selectionElementRef.current?.selectionText,
          )
          showFloatingContextMenuWithVirtualElement(
            selectionElementRef.current as IVirtualIframeSelectionElement,
            {},
            isPressCommandI,
          )
          if (selectionElementRef.current) {
            // 因为已经打开了，所以释放掉这个ref
            selectionElementRef.current = null
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
    /**
     * 点击后需要关闭floating context menu的context menu
     */
    const needCloseFloatingContextMenus: ContextMenuDraftType[] = [
      'REPLACE_SELECTION',
      'INSERT_BELOW',
      'INSERT',
      'INSERT_ABOVE',
      'DISCARD',
      'COPY',
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
      setFloatingDropdownMenuLastFocusRange({
        range: null,
        selectionText: '',
      })
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
      case 'INSERT':
      case 'INSERT_ABOVE':
      case 'REPLACE_SELECTION':
        {
          if (target) {
            port.postMessage({
              event: 'Client_updateIframeInput',
              data: {
                value: lastOutputRef.current,
                type: selectedDraftContextMenuType,
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
          let lastAIMessageId = ''
          if (sidebarChatMessages.length > 0) {
            let isFindUserMessage = false
            for (let i = sidebarChatMessages.length - 1; i >= 0; i--) {
              const message = sidebarChatMessages[i]
              if (message.type === 'user') {
                isFindUserMessage = true
              }
              if (isFindUserMessage && message.type === 'ai') {
                // 因为reGenerate, 要找到最后用户的前面的第一个ai消息
                lastAIMessageId = message.messageId
                break
              }
            }
          }
          console.log('AIInput TRY_AGAIN', lastAIMessageId)
          setFloatingContextMenuDraft({
            lastAIMessageId,
          })
        }
        break
      case 'COPY':
        {
          try {
            const textarea = document.createElement('textarea')
            textarea.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 1px;
              height: 1px;
              padding: 0;
              border: none;
              outline: none;
              boxShadow: none;
              background: transparent;
              z-index: -1;
            `
            textarea.value = lastOutputRef.current
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy', false, '')
            textarea.remove()
          } catch (e) {
            console.error(e)
          }
        }
        break
      default:
        break
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])
  useEffect(() => {
    if (!floatingDropdownMenu.open) {
      setFloatingDropdownMenuLastFocusRange((prevState) => {
        if (prevState.range) {
          window.getSelection()?.removeAllRanges()
          window.getSelection()?.addRange(prevState.range)
          const el = getSelectionBoundaryElement()
          if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            const inputEl = el as HTMLInputElement
            const startIndex = inputEl.value.indexOf(
              prevState.selectionText || '',
            )
            const endIndex = startIndex + (prevState.selectionText || '').length
            inputEl.focus()
            inputEl.setSelectionRange(startIndex, endIndex)
          }
          setTimeout(() => {
            // mock space keyup
            const keyupEvent = new KeyboardEvent('keyup', {
              key: ' ',
              code: 'Space',
              location: 0,
              bubbles: true,
              cancelable: true,
              shiftKey: false,
            })
            ;(el || document.body).focus()
            ;(el || document.body).dispatchEvent(keyupEvent)
          }, 0)
        }
        return {
          ...prevState,
          range: null,
        }
      })
    }
  }, [floatingDropdownMenu.open])
}

export default useInitRangy
