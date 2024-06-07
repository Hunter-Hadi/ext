// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import debounce from 'lodash-es/debounce'
import { useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { useCreateClientMessageListener } from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  MAXAI_CLIPBOARD_ID,
  MAXAI_CONTEXT_MENU_ID,
  MAXAI_SIDEBAR_ID,
} from '@/features/common/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import {
  ContextWindowDraftContextMenuState,
  FloatingDropdownMenuLastFocusRangeState,
  FloatingDropdownMenuState,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import { InstantReplyButtonIdToInputMap } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import {
  ContextMenuDraftType,
  ISelectionElement,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
import {
  getDraftContextMenuTypeById,
  isOutOfViewport,
} from '@/features/contextMenu/utils'
import runEmbedShortCuts from '@/features/contextMenu/utils/runEmbedShortCuts'
import {
  createSandboxIframeClickAndKeydownEvent,
  createSelectionElement,
  getEditableElement,
  getSelectionBoundaryElement,
  removeAllRange,
  removeAllSelectionMarker,
  useBindRichTextEditorLineTextPlaceholder,
} from '@/features/contextMenu/utils/selectionHelper'
import useCommands from '@/hooks/useCommands'
import { listenIframeMessage } from '@/iframeDocumentEnd'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from '@/lib/rangy/rangy-core'
import initRangyPosition from '@/lib/rangy/rangy-position'
import initRangySaveRestore from '@/lib/rangy/rangy-saverestore'
import { AppDBStorageState } from '@/store'
import {
  getCurrentDomainHost,
  isMaxAIImmersiveChatPage,
} from '@/utils/dataHelper/websiteHelper'
import Log from '@/utils/Log'

import { useRangy } from './useRangy'

initRangyPosition(rangyLib)
initRangySaveRestore(rangyLib)

const RangyLog = new Log('ContextMenu/Rangy')
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const copyText = (text: string) => {
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
  textarea.value = text
  textarea.oncopy = (event) => event.stopPropagation()
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy', false, '')
  textarea.oncopy = null
  textarea.remove()
}

// 自动聚焦并把光标移动到末尾
const triggerEvents = ['input', 'change']
function focusAndMoveCursorToEnd(inputBox: HTMLElement) {
  try {
    inputBox.focus()
    if (inputBox.contentEditable === 'true') {
      const range = document.createRange()
      const selection = window.getSelection()
      const lastNode = Array.from(inputBox.childNodes || []).at(-1)
      if (lastNode) {
        // 如果存在子节点，将光标移动到最后一个子节点的末尾
        const lastNodeRange = document.createRange()
        lastNodeRange.selectNodeContents(lastNode)
        const lastNodeContentsLength = lastNodeRange.toString().length
        range.setStart(lastNode, lastNodeContentsLength)
        range.setEnd(lastNode, lastNodeContentsLength)
        setTimeout(() => {
          // eslint-disable-next-line no-extra-semi
          ;(lastNode as HTMLElement).scrollIntoView({ block: 'end' })
        }, 100)
      } else {
        // 如果没有子节点，直接将光标移动到元素的起始位
        range.selectNodeContents(inputBox)
      }
      selection?.removeAllRanges()
      selection?.addRange(range)
    } else if (
      inputBox instanceof HTMLInputElement ||
      inputBox instanceof HTMLTextAreaElement
    ) {
      const valueLength = inputBox.value.length
      inputBox.setSelectionRange(valueLength, valueLength)
    }
    // input Box不在可视区域内再进行滚动到此元素
    const rect = inputBox.getBoundingClientRect()
    if (isOutOfViewport(rect)) {
      inputBox.scrollIntoView({ block: 'end' })
    }

    // 触发事件，让编辑框可能绑定的事件监听器生效
    triggerEvents.forEach((eventName) => {
      inputBox.dispatchEvent(
        new Event(eventName, {
          bubbles: true,
          cancelable: true,
        }),
      )
    })
  } catch (err) {
    console.error(err)
  }
}

// 插入内容到编辑框
const insertContentToInputBox = (
  inputBox: HTMLElement | null | undefined,
  content: string,
) => {
  if (inputBox) {
    inputBox.focus()
    const host = getCurrentDomainHost()
    if (inputBox.contentEditable === 'true') {
      // 有些网站回复别人会自动 quote mention
      let quoteMention = ''
      if (host === 'linkedin.com') {
        // message in LinkedIn
        if (inputBox.matches('.msg-form__contenteditable')) {
          inputBox.parentElement
            ?.querySelector('.msg-form__placeholder')
            ?.classList.remove('msg-form__placeholder')
          content = `<p>${content}</p>`
        } else {
          quoteMention = inputBox.querySelector('a.ql-mention')?.outerHTML || ''
        }
      }
      // Facebook 编辑器使用的是 Lexical, 无法使用 innerHTML 直接插入
      else if (host === 'facebook.com') {
        inputBox.focus()
        const range = document.createRange()
        range.selectNodeContents(inputBox)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)

        setTimeout(() => {
          const clipboardData = new DataTransfer()
          clipboardData.setData('text/plain', content)
          inputBox.dispatchEvent(
            new ClipboardEvent('paste', {
              clipboardData,
              bubbles: true,
              cancelable: true,
            }),
          )
        }, 100)

        return
      }

      inputBox.innerHTML = quoteMention + content.replaceAll(/\n/g, '<br />')
    } else {
      // eslint-disable-next-line no-extra-semi
      ;(inputBox as HTMLInputElement).value = content
    }
    setTimeout(() => {
      focusAndMoveCursorToEnd(inputBox)
    }, 100)
  }
}

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
  const appDBStorage = useRecoilValue(AppDBStorageState)
  const userSettings = appDBStorage.userSettings
  const { chatBoxShortCutKey } = useCommands()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const { clientConversationMessages } = useClientConversation()
  // 保存打开floatingMenu前最后的选区
  const setFloatingDropdownMenuLastFocusRange = useSetRecoilState(
    FloatingDropdownMenuLastFocusRangeState,
  )
  // 绑定点击或者按键的placeholder事件
  useBindRichTextEditorLineTextPlaceholder()
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(ContextWindowDraftContextMenuState)
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
        if (isMaxAIImmersiveChatPage()) {
          // immersive chat页面不处理
          return
        }
        if ((event as any).MAX_AI_IGNORE) {
          // 针对google doc或者其他页面的处理
          // 过滤对此元素事件的处理
          return
        }
        let activeElement: HTMLElement | null = event.target as HTMLElement
        const isMouseEvent = event instanceof MouseEvent
        const nativeSelectionElement = getSelectionBoundaryElement()
        const defaultSelectionText = (
          rangy?.getSelection()?.toString() ||
          document?.getSelection()?.toString() ||
          ''
        )
          .trim()
          .replace(/\u200B/g, '')
        if (activeElement) {
          if (
            activeElement &&
            (activeElement.id === MAXAI_SIDEBAR_ID ||
              activeElement.id === MAXAI_CONTEXT_MENU_ID ||
              activeElement.id === MAXAI_CLIPBOARD_ID)
          ) {
            return
          }
          // 这里是mousedown记录的editable element, 如果有的话替换mouseup阶段的activeElement
          if (targetElementRef.current) {
            activeElement = targetElementRef.current
          }
          // 因为mouse up的target元素优先级特别低, 所以先尝试用nativeSelectionElement
          if (
            nativeSelectionElement &&
            activeElement?.tagName !== 'INPUT' &&
            activeElement?.tagName !== 'TEXTAREA'
          ) {
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
          /**
           * google sheets页面下，点击单元格获取的selectionElement是#waffle-rich-text-editor
           * 编辑单元格时此元素才会移动到编辑的单元格内，并且点击的时候document.getSelection().toString()获取到的是\n
           * 后续有其他网页处理需要统一配置，目前先放在此处处理，判断是否在编辑状态
           */
          if (
            location.href.startsWith('https://docs.google.com/spreadsheets')
          ) {
            if (activeElement.id === 'waffle-rich-text-editor') {
              if (!activeElement.hasAttribute('aria-label')) {
                return
              }
            }
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
      'ACCEPT_AND_COPY',
    ]
    const selectedDraftContextMenuType = getDraftContextMenuTypeById(
      floatingDropdownMenuSystemItems.selectedDraftContextMenuId || '',
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
        showModelSelector: false,
      })
      setFloatingDropdownMenuSystemItems({
        selectedDraftContextMenuId: '',
        lastOutput: '',
      })
      hideRangy(true)
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
                id: target.id,
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
          if (clientConversationMessages.length > 0) {
            let isFindUserMessage = false
            for (let i = clientConversationMessages.length - 1; i >= 0; i--) {
              const message = clientConversationMessages[i]
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
        }
        break
      case 'ACCEPT_AND_COPY':
        {
          try {
            const instantReplyButtonId =
              currentSelectionRefElement.current?.target?.getAttribute(
                'maxai-input-assistant-button-id',
              )
            if (instantReplyButtonId) {
              copyText(lastOutputRef.current)
              const inputBox =
                InstantReplyButtonIdToInputMap.get(instantReplyButtonId)
              insertContentToInputBox(inputBox, lastOutputRef.current)
            }
          } catch (err) {
            console.error(err)
          }
        }
        break
      case 'COPY':
        {
          try {
            copyText(lastOutputRef.current)
          } catch (e) {
            console.error(e)
          }
        }
        break
      default:
        break
    }
  }, [floatingDropdownMenuSystemItems.selectedDraftContextMenuId])

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
          // 这里每次关闭后触发了一个keyup事件
          // 在google doc下导致上方的saveHighlightedRangeAndShowContextMenu里清除了selectionElementRef.current
          // 尽量不修改原有的逻辑，这里注释一下记录
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
