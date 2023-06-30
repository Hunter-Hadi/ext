import { v4 as uuidV4 } from 'uuid'
import isNumber from 'lodash-es/isNumber'
import {
  ContextMenuDraftType,
  IRangyRect,
  ISelectionElement,
} from '@/features/contextMenu/types'
import { cloneRect } from '@/features/contextMenu/utils/index'
import { getCurrentDomainHost } from '@/utils'
import sum from 'lodash-es/sum'
import TurnDownService from 'turndown'
import {
  ROOT_CHAT_BOX_INPUT_ID,
  ROOT_CLIPBOARD_ID,
  ROOT_FLOATING_INPUT_ID,
} from '@/constants'
/**
 * 以下网站不支持植入标记，直接返回选区内容并把选区存入cache
 */
const CREATE_SELECTION_MARKER_WHITE_LIST_HOST = [
  'mail.google.com',
  'outlook.live.com',
] as const

class CacheSelectionRange {
  private static rangeMap = new Map<string, Range>()
  public static setRange(uuid: string, range: Range | null) {
    if (range) {
      CacheSelectionRange.rangeMap.set(uuid, range)
    }
  }
  public static getRange(uuid: string) {
    return CacheSelectionRange.rangeMap.get(uuid)
  }
  public static removeAllRange() {
    CacheSelectionRange.rangeMap.clear()
  }
}

export const setCacheSelectionRange = (uuid: string, range: Range | null) => {
  CacheSelectionRange.setRange(uuid, range)
}

export const getCacheSelectionRange = (uuid: string) => {
  return CacheSelectionRange.getRange(uuid) || null
}
export const removeAllCacheSelectionRange = () => {
  CacheSelectionRange.removeAllRange()
}

export const getClipboardPermission = async (): Promise<boolean> => {
  const permission = await navigator.permissions.query({
    name: 'clipboard-write' as any,
  })
  return permission.state === 'granted'
}

/**
 * @description 获取光标位置
 * @param element
 */
export const getCaretCharacterOffsetWithin = (element: HTMLElement) => {
  let caretOffset = 0
  const doc = element.ownerDocument || (element as any).document
  const win = doc.defaultView || (doc as any).parentWindow
  let sel
  if (typeof win.getSelection != 'undefined') {
    sel = win.getSelection()
    if (sel.rangeCount > 0) {
      const range = win.getSelection().getRangeAt(0)
      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(element)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      caretOffset = preCaretRange.toString().length
    }
  }
  return caretOffset
}
export const getInputSelection = (element: HTMLInputElement) => {
  let start = 0,
    end = 0,
    normalizedValue,
    range,
    textInputRange,
    len,
    endRange
  const doc = element.ownerDocument || (element as any).document
  if (
    typeof element.selectionStart == 'number' &&
    typeof element.selectionEnd == 'number'
  ) {
    start = element.selectionStart
    end = element.selectionEnd
  } else {
    range = (doc as any).selection.createRange()

    if (range && range.parentElement() == element) {
      len = element.value.length
      normalizedValue = element.value.replace(/\r\n/g, '\n')

      // Create a working TextRange that lives only in the input
      textInputRange = (element as any).createTextRange()
      textInputRange.moveToBookmark(range.getBookmark())

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = (element as any).createTextRange()
      endRange.collapse(false)

      if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
        start = end = len
      } else {
        start = -textInputRange.moveStart('character', -len)
        start += normalizedValue.slice(0, start).split('\n').length - 1

        if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
          end = len
        } else {
          end = -textInputRange.moveEnd('character', -len)
          end += normalizedValue.slice(0, end).split('\n').length - 1
        }
      }
    }
  }
  return {
    start: start,
    end: end,
  }
}

/**
 * 计算选区的字符串
 */
export const computedSelectionString = () => {
  if (document) {
    if (document.getSelection) {
      // Most browsers
      return String(document.getSelection())?.replace(/\u200B/g, '')
    } else if ((document as any).selection) {
      // Internet Explorer 8 and below
      return (document as any).selection
        .createRange()
        .text?.replace(/\u200B/g, '')
    } else if (window.getSelection) {
      // Safari 3
      return String(window.getSelection())?.replace(/\u200B/g, '')
    }
  }
  /* Fall-through. This could happen if this function is called
       on a frame that doesn't exist or that isn't ready yet. */
  return ''
}

/**
 * 创建选区标记
 * @param element
 */
export const createSelectionMarker = (
  element: HTMLElement,
): {
  startMarkerId: string
  endMarkerId: string
  selectionText: string
  editableElementSelectionText: string
} => {
  try {
    if (element) {
      const doc = element.ownerDocument || (element as any).document
      const win = doc.defaultView || (doc as any).parentWindow
      let sel
      const startMarkerId = `usechatgpt-start-marker-${uuidV4()}`
      const endMarkerId = `usechatgpt-end-marker-${uuidV4()}`
      // MARK - 会导致一些问题
      // const markerTextChar = '\ufeff'
      const markerTextChar = ''
      if (typeof doc.getSelection != 'undefined') {
        sel = doc.getSelection() || win.getSelection()
        if (sel.rangeCount > 0) {
          // remove old marker
          removeAllSelectionMarker()
          const range = win.getSelection().getRangeAt(0).cloneRange()
          console.log('[ContextMenu][Rangy] range: \t', range)
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const inputElement = element as HTMLInputElement
            // input or textarea
            // get start offset
            // get end offset
            const { start, end } = getInputSelection(inputElement)
            element.setAttribute(
              'data-usechatgpt-start-offset',
              start.toString(),
            )
            element.setAttribute('data-usechatgpt-end-offset', end.toString())
            element.setAttribute('data-usechatgpt-marker', 'usechatgpt-marker')
            element.setAttribute(
              'data-usechatgpt-marker-start-id',
              startMarkerId,
            )
            element.setAttribute('data-usechatgpt-marker-end-id', endMarkerId)
            const selectionText = inputElement.value
              .substring(start, end)
              .trim()
              .replace(/\u200B/g, '')
            /**
             * 上下文内容优先级
             * 1. 选区内容
             * 2. 输入框的从[0 - 光标位置]的内容
             * 3. 输入框的内容
             */
            const contextText = (
              selectionText ||
              inputElement.value.substring(0, start).trim() ||
              inputElement.value.trim() ||
              ''
            ).replace(/\u200B/g, '')
            return {
              startMarkerId,
              endMarkerId,
              selectionText: contextText,
              editableElementSelectionText: selectionText,
            }
          } else {
            /**
             * 上下文内容优先级
             * 1. 选区内容
             * 2. 选区的innerText从[0 - 光标位置]的内容
             * 3. 选区的innerText内容
             */
            const selectionText = (sel.toString() || range.toString())
              .trim()
              .replace(/\u200B/g, '')
            // 计算元素从头到光标的位置
            const partOfStartToCaret = range.cloneRange()
            partOfStartToCaret.selectNodeContents(element)
            partOfStartToCaret.setEnd(range.endContainer, range.endOffset)
            const partOfStartToCaretText = partOfStartToCaret
              .toString()
              .trim()
              .replace(/\u200B/g, '')
            const contextText = (
              selectionText ||
              partOfStartToCaretText ||
              element.innerText.trim() ||
              ''
            ).replace(/\u200B/g, '')
            const host = getCurrentDomainHost()
            /**
             * 如果不在白名单中，就不创建span标记，缓存用户选区就行
             */
            if (
              !CREATE_SELECTION_MARKER_WHITE_LIST_HOST.includes(host as any)
            ) {
              console.log(
                'createSelectionMarker block host',
                host,
                partOfStartToCaretText,
              )
              setCacheSelectionRange(startMarkerId, range.cloneRange())
              setCacheSelectionRange(endMarkerId, range.cloneRange())
              return {
                startMarkerId,
                endMarkerId,
                selectionText: contextText,
                editableElementSelectionText: selectionText,
              }
            }
            // 下面是创建选区的逻辑
            let boundaryRange = range.cloneRange()
            boundaryRange.collapse(true)
            const startMarker = doc.createElement('span')
            startMarker.id = startMarkerId
            startMarker.style.lineHeight = '0'
            startMarker.style.display = 'none'
            startMarker.textContent = markerTextChar
            startMarker.setAttribute(
              'data-usechatgpt-marker',
              'usechatgpt-marker',
            )
            startMarker.setAttribute('contenteditable', 'false')
            startMarker.setAttribute(
              'data-usechatgpt-marker-start-id',
              startMarkerId,
            )
            boundaryRange.insertNode(startMarker)
            boundaryRange = range.cloneRange()
            boundaryRange.collapse(false)
            const endMarker = doc.createElement('span')
            endMarker.id = endMarkerId
            endMarker.style.lineHeight = '0'
            endMarker.style.display = 'none'
            endMarker.textContent = markerTextChar
            endMarker.setAttribute(
              'data-usechatgpt-marker',
              'usechatgpt-marker',
            )
            endMarker.setAttribute('contenteditable', 'false')
            endMarker.setAttribute('data-usechatgpt-marker-end-id', endMarkerId)
            boundaryRange.insertNode(endMarker)
            return {
              startMarkerId,
              endMarkerId,
              selectionText: contextText,
              editableElementSelectionText: selectionText,
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  return {
    startMarkerId: '',
    endMarkerId: '',
    selectionText: '',
    editableElementSelectionText: '',
  }
}

/**
 * 特殊的host获取选中文本，在无法获取到selectionString的情况下使用
 * @param element
 * @returns {selectionString}
 */
export const getEditableElementSelectionTextOnSpecialHost = (
  element: HTMLElement,
): string => {
  const host = getCurrentDomainHost()
  try {
    if (element) {
      const doc = element.ownerDocument || (element as any).document
      const win = doc.defaultView || (doc as any).parentWindow
      let sel
      if (typeof win.getSelection != 'undefined') {
        sel = win.getSelection()
        if (sel.rangeCount > 0) {
          const range = win.getSelection().getRangeAt(0)
          let pageContentRoot: HTMLElement | null = null
          switch (host) {
            case 'notion.so':
              {
                pageContentRoot =
                  doc.querySelector('.notion-page-content') ||
                  doc.querySelector('[data-content-editable-root="true"]')
              }
              break
            case 'larksuite.com':
              {
                pageContentRoot =
                  doc.querySelector('.page-block-children') ||
                  doc.querySelector('.page-block') ||
                  doc.querySelector('.root-block')
              }
              break
            default:
              {
                let maxLoop = 3
                let parentElement = element.parentElement
                while (maxLoop > 0 && parentElement) {
                  const result = getEditableElement(parentElement)
                  if (result.isEditableElement && result.editableElement) {
                    if (result.editableElement?.innerText) {
                      pageContentRoot = result.editableElement
                      break
                    } else if (result.editableElement?.parentElement) {
                      parentElement = result.editableElement.parentElement
                      maxLoop--
                    }
                  } else {
                    break
                  }
                }
              }
              break
          }
          if (pageContentRoot) {
            const boundaryRange = range.cloneRange()
            boundaryRange.selectNode(pageContentRoot)
            boundaryRange.setEnd(range.endContainer, range.endOffset)
            const selectionString = boundaryRange?.toString()?.trim()
            console.log(
              'getEditableElementSelectionTextOnSpecialHost : \t',
              selectionString,
            )
            return selectionString || ''
          } else {
            // TODO - 如果返回报错内容，可能被用户的prompt影响，所以返回空字符串
            console.log(
              'getEditableElementSelectionTextOnSpecialHost no handle: \t',
              host,
            )
            // return "Sorry, we're unable to correctly retrieve the context on this website. Please try again by selecting the text."
            return ''
          }
        }
      }
    }
  } catch (e) {
    console.error('getEditableElementSelectionTextOnSpecialHost error: \t', e)
  }
  return ''
}

/**
 * @description input设置高亮并且滚动
 * @param editableElement
 * @param start
 * @param end
 */
export const inputSetSelectionAndScrollTo = (
  editableElement: HTMLTextAreaElement | HTMLInputElement,
  start: number,
  end: number,
) => {
  const doc = editableElement.ownerDocument || document
  editableElement.focus()
  // Define selection
  editableElement.setSelectionRange(start, end)
  if (editableElement.tagName === 'TEXTAREA') {
    const textArea = editableElement as HTMLTextAreaElement
    const style = getComputedStyle(textArea)
    // get font info
    const char = textArea.value.match(/\w/)?.[0] || 'M'
    const fontSize = style.fontSize
    const fontFamily = style.fontFamily
    // 创建一个临时的 span 元素，并设置其样式为与字体相同的样式
    const tempSpan = doc.createElement('span')
    tempSpan.style.fontSize = fontSize
    tempSpan.style.fontFamily = fontFamily
    tempSpan.style.position = 'absolute'
    tempSpan.style.top = '-9999px'
    tempSpan.style.left = '-9999px'
    tempSpan.innerText = char
    doc.body.appendChild(tempSpan)
    const charWidth = tempSpan.offsetWidth
    tempSpan.remove()
    // 获取每行有多少个字符
    const charsPerRow =
      Math.floor(textArea.getBoundingClientRect().width / charWidth) || 30
    // 获取直到选中的内容
    const untilEndText = textArea.value.substring(0, end)
    const untilEndRowCount = sum(
      untilEndText.split(/\n/).map((partOfText) => {
        // 这一段文本占用的行数
        const textUsingRowLength = Math.ceil(partOfText.length / charsPerRow)
        return Math.max(textUsingRowLength, 1)
      }),
    )
    const lineHeight = textArea.clientHeight / textArea.rows
    // Scroll!!
    textArea.scrollTop = lineHeight * untilEndRowCount
  } else if (editableElement.tagName === 'INPUT') {
    const input = editableElement as HTMLInputElement
    input.scrollLeft = input.scrollWidth
  }
}

/**
 * 替换marker内容
 * @description - 替换分三种情况
 * 1. input/textarea
 *  1.1 基于startMarker和endMarker的offset，替换或添加到底部在input/textarea的value
 *  1.2 选中替换/插入的内容
 *  1.3 滚动到光标位置并且设置高亮
 * 2. cacheRange
 *  2.1 focus和还原range
 *  2.2 选中替换/插入的内容
 * 3. marker元素
 *  3.1 基于startMarker和endMarker的offset，替换或添加到底部在元素的innerHTML
 *  3.2 选中替换/插入的内容
 *  3.3 设置高亮
 * 4. 触发keyup事件
 * @param startMarkerId
 * @param endMarkerId
 * @param value
 * @param type
 */
export const replaceMarkerContent = async (
  startMarkerId: string,
  endMarkerId: string,
  value: string,
  type: ContextMenuDraftType,
) => {
  console.log('replaceMarkerContent', value)
  let originalEditableElement: HTMLElement | null = null
  const startMarker = document.querySelector(
    `[data-usechatgpt-marker-start-id="${startMarkerId}"`,
  ) as HTMLElement
  const endMarker = document.querySelector(
    `[data-usechatgpt-marker-end-id="${endMarkerId}"`,
  )
  let cacheRange: Range | null = null
  if (!startMarker && !endMarker) {
    cacheRange =
      getCacheSelectionRange(startMarkerId) ||
      getCacheSelectionRange(endMarkerId)
    // 说明marker丢失了
    if (!cacheRange) {
      return
    }
  }
  if (
    startMarker &&
    (startMarker.tagName === 'INPUT' || startMarker.tagName === 'TEXTAREA')
  ) {
    const inputElement = startMarker as HTMLInputElement
    originalEditableElement = inputElement
    const doc = inputElement?.ownerDocument || document
    const start = Number(
      inputElement.getAttribute('data-usechatgpt-start-offset'),
    )
    const end = Number(inputElement.getAttribute('data-usechatgpt-end-offset'))
    if (isNumber(start) && isNumber(end)) {
      // 因为textarea/input不需要这么多换行符和空格
      if (inputElement.tagName === 'TEXTAREA') {
        value = value.replace(/\n+/, '\n')
      } else {
        value = value.replace(/\n+/, ' ')
        value = value.replace(/\s+/, ' ')
      }
      let newValue = ''
      let beforeText = ''
      let afterText = ''
      if (type === 'REPLACE_SELECTION') {
        beforeText = inputElement.value.substring(0, start)
        afterText = inputElement.value.substring(end, inputElement.value.length)
      } else if (type === 'INSERT_BELOW') {
        beforeText = inputElement.value.substring(0, end)
        afterText = inputElement.value.substring(end, inputElement.value.length)
        if (!beforeText.endsWith('\n') && inputElement.tagName === 'TEXTAREA') {
          value = '\n' + value
        } else if (
          !beforeText.endsWith(' ') &&
          inputElement.tagName === 'INPUT'
        ) {
          value = ' ' + value
        }
      } else if (type === 'INSERT_ABOVE') {
        beforeText = inputElement.value.substring(0, start)
        afterText = inputElement.value.substring(
          start,
          inputElement.value.length,
        )
        if (
          !afterText.startsWith('\n') &&
          inputElement.tagName === 'TEXTAREA'
        ) {
          value = value + '\n'
        } else if (
          !afterText.startsWith(' ') &&
          inputElement.tagName === 'INPUT'
        ) {
          value = value + ' '
        }
      } else if (type === 'INSERT') {
        beforeText = inputElement.value.substring(0, end)
        afterText = inputElement.value.substring(end, inputElement.value.length)
      }
      newValue = beforeText + value + afterText
      // inputElement.value = newValue
      try {
        if (await getClipboardPermission()) {
          await navigator.clipboard.writeText(newValue)
          inputElement.focus()
          inputElement.select()
          doc.execCommand('paste', false, '')
        } else {
          inputElement.focus()
          inputElement.select()
          doc.execCommand('insertText', false, newValue)
        }
      } catch (e) {
        inputElement.focus()
        inputElement.select()
        doc.execCommand('insertText', false, newValue)
      }
      inputSetSelectionAndScrollTo(
        inputElement,
        beforeText.length,
        beforeText.length + value.length,
      )
    }
  } else if (cacheRange) {
    if (type === 'INSERT_BELOW') {
      value = ('\n' + value).replace(/^\n+/, '\n')
    } else if (type === 'INSERT_ABOVE') {
      value = (value + '\n').replace(/\n+$/, '\n')
    } else if (type === 'REPLACE_SELECTION') {
      // nothing
    } else if (type === 'INSERT') {
      // nothing
    }
    try {
      console.log(
        'paste origin editableElementSelectionText',
        cacheRange,
        cacheRange.toString(),
      )
      const cloneRange = cacheRange.cloneRange()
      if (type === 'REPLACE_SELECTION') {
        // doc.execCommand('Delete')
      } else if (type === 'INSERT' || type === 'INSERT_BELOW') {
        // set range to end
        cloneRange.setStart(cacheRange.endContainer, cacheRange.endOffset)
        cloneRange.setEnd(cacheRange.endContainer, cacheRange.endOffset)
      } else if (type === 'INSERT_ABOVE') {
        // set range to start
        cloneRange.setStart(cacheRange.startContainer, cacheRange.startOffset)
        cloneRange.setEnd(cacheRange.startContainer, cacheRange.startOffset)
      }
      await replaceWithClipboard(cloneRange, value)
      console.log('paste editableElementSelectionText', value)
    } catch (e) {
      console.error('defaultPasteValue error: \t', e)
    }
  } else if (startMarker && endMarker) {
    const { editableElement } = getEditableElement(
      startMarker as HTMLSpanElement,
    )
    if (!editableElement) {
      return
    }
    originalEditableElement = editableElement
    const doc = editableElement.ownerDocument || document
    const range = doc.createRange()
    range.selectNode(editableElement)
    range.setStartAfter(startMarker)
    range.setEndBefore(endMarker)
    if (type === 'INSERT_BELOW') {
      value = ('\n' + value).replace(/^\n+/, '\n')
      range.setStart(range.endContainer, range.endOffset)
    } else if (type === 'INSERT_ABOVE') {
      value = (value + '\n').replace(/\n+$/, '\n')
      range.setEnd(range.startContainer, range.startOffset)
    } else if (type === 'REPLACE_SELECTION') {
      // nothing
    } else if (type === 'INSERT') {
      value = value.replace(/^\n+/, '')
      range.setStart(range.endContainer, range.endOffset)
    }
    // 判断是否为纯文本节点，还原纯文本节点
    if (
      startMarker.parentElement &&
      endMarker.parentElement &&
      startMarker.parentElement.isSameNode(endMarker.parentElement)
    ) {
      const originRangeStartOffset = range.startOffset
      const originRangeEndOffset = range.endOffset
      const parentElement = startMarker.parentElement
      startMarker.remove()
      endMarker.remove()
      let isPureText = true
      for (let i = 0; i < parentElement.childNodes.length; i++) {
        const childNode = parentElement.childNodes[i]
        if (childNode.nodeType !== Node.TEXT_NODE) {
          isPureText = false
          break
        }
      }
      if (isPureText) {
        const selectedText = range.toString()
        // 还原纯文本节点
        const textNode = doc.createTextNode(parentElement.innerText)
        parentElement.innerHTML = ''
        parentElement.appendChild(textNode)
        // 如果选中的文本有值，还原选中文本的range位置
        if (selectedText.length > 0) {
          const startIndex = Math.max(
            parentElement.innerText.indexOf(selectedText),
            0,
          )
          const endIndex = startIndex + selectedText.length
          range.setStart(parentElement.childNodes[0], startIndex)
          range.setEnd(parentElement.childNodes[0], endIndex)
        } else if (originRangeStartOffset === originRangeEndOffset) {
          const textNode = parentElement.childNodes[0] as Node
          if (!textNode) {
            return
          }
          if (originRangeEndOffset === 0) {
            // 移动到开头
            range.setStart(textNode, 0)
            range.setEnd(textNode, 0)
          } else {
            // 移动到结尾
            range.setStart(textNode, textNode.nodeValue?.length || 0)
            range.setEnd(textNode, textNode.nodeValue?.length || 0)
          }
        }
      }
      console.log(
        'insertValueToWithRichText pure text',
        range.startOffset,
        range.endOffset,
      )
    }
    // 高亮
    const highlightSelection = () => {
      doc.getSelection()?.removeAllRanges()
      // 移动光标
      if (type === 'INSERT_BELOW' || type === 'INSERT') {
        console.log(
          'insertValueToWithRichText highlightSelection',
          range.startOffset,
          range.endOffset,
        )
        range.setStart(range.endContainer, range.endOffset)
        range.setEnd(range.endContainer, range.endOffset)
      } else if (type === 'INSERT_ABOVE') {
        range.setStart(range.startContainer, range.startOffset)
        range.setEnd(range.startContainer, range.startOffset)
      }
      doc.getSelection()?.addRange(range)
    }
    // 选中的可编辑元素focus
    const focusEditableElement = () => {
      if (editableElement) {
        editableElement.focus()
      }
    }
    // 文本转换成富文本插件节点
    const insertValueToWithRichText = (
      insertValue: string,
      options?: {
        separator?: string
        tagName?: string
        className?: string
        cssText?: string
        onSeparator?: (partOfText: string) => Node
      },
    ) => {
      const newRange = range.cloneRange()
      if (type === 'REPLACE_SELECTION') {
        newRange.deleteContents()
      }
      doc.getSelection()?.removeAllRanges()
      doc.getSelection()?.addRange(newRange)
      console.log(
        'insertValueToWithRichText insertValue',
        newRange.startOffset,
        newRange.endOffset,
        insertValue,
      )
      const {
        separator = '\n\n',
        tagName = 'div',
        className = '',
        cssText = '',
        onSeparator,
      } = options || {}
      insertValue
        .split(separator)
        .reverse() // 反转数组是因为插入的内容是从底部插入的
        .forEach((partOfText, index, arr) => {
          // 理论上流程是
          // 1. "\n1\n\n2" => ["\n1", "2"]
          // 2. ["\n1", "2"] => ["2", "\n1"]
          // 3. ["2", "\n1"] => Range insertNode => ["<div>2</div>", <div><br></div> , "<div>\n1</div>"]
          console.log('insertValueToWithRichText partOfText', partOfText)
          const div = doc.createElement(tagName)
          className && (div.className = className)
          cssText && (div.style.cssText = cssText)
          div.innerText = partOfText
          newRange.insertNode(div)
          if (onSeparator && arr[index + 1]) {
            const node = onSeparator(partOfText)
            newRange.insertNode(node)
            console.log('insertValueToWithRichText partOfNode', node)
          }
        })
      doc.getSelection()?.removeAllRanges()
      doc.getSelection()?.addRange(newRange)
    }
    const host =
      getCurrentDomainHost() as (typeof CREATE_SELECTION_MARKER_WHITE_LIST_HOST)[number]
    switch (host) {
      case 'mail.google.com':
        {
          focusEditableElement()
          highlightSelection()
          insertValueToWithRichText(value, {
            cssText: 'white-space: pre-wrap;',
            onSeparator: () => {
              const div = doc.createElement('div')
              const br = doc.createElement('br')
              div.appendChild(br)
              return div
            },
          })
        }
        break
      case 'outlook.live.com':
        {
          focusEditableElement()
          highlightSelection()
          insertValueToWithRichText(value, {
            className: 'elementToProof ContentPasted0',
            onSeparator: () => {
              const div = doc.createElement('div')
              div.className = 'elementToProof ContentPasted0'
              const br = doc.createElement('br')
              div.appendChild(br)
              return div
            },
          })
        }
        break
      default: {
        console.log('default paste value', value, startMarker, endMarker)
        focusEditableElement()
        highlightSelection()
        await replaceWithClipboard(range, value)
      }
    }
    // dispatch keyup event with original target
    if (originalEditableElement) {
      const event = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
      })
      startMarker.dispatchEvent(event)
    }
  }
  // 移除所有的marker
  removeAllSelectionMarker()
  // 移除cacheRange
  removeAllCacheSelectionRange()
}

/**
 * @description - 移除所有的marker
 */
export const removeAllSelectionMarker = () => {
  if (typeof document === 'undefined') {
    return
  }
  document.querySelectorAll('[data-usechatgpt-marker]').forEach((marker) => {
    // remove span marker
    if (marker.tagName === 'SPAN' || marker?.id.includes('usechatgpt-marker')) {
      marker.remove()
      return
    }
    marker.removeAttribute('data-usechatgpt-marker')
    marker.removeAttribute('data-usechatgpt-start-offset')
    marker.removeAttribute('data-usechatgpt-end-offset')
    marker.removeAttribute('data-usechatgpt-marker-start-id')
    marker.removeAttribute('data-usechatgpt-marker-end-id')
  })
}

export const removeAllRange = () => {
  if (typeof document === 'undefined') {
    return
  }
  document.getSelection()?.removeAllRanges()
}

/**
 * @description - 获取可编辑的元素
 * @param element
 * @param defaultMaxLoop
 */
export const getEditableElement = (
  element: HTMLElement,
  defaultMaxLoop = 10,
) => {
  if (!element) {
    return {
      isEditableElement: false,
      editableElement: null,
    }
  }
  let parentElement: HTMLElement | null = element
  let editableElement: HTMLElement | null = null
  let maxLoop = defaultMaxLoop
  while (parentElement && maxLoop > 0) {
    if (isElementCanEditable(parentElement)) {
      editableElement = parentElement
      break
    }
    parentElement = parentElement.parentElement
    maxLoop--
  }
  if (editableElement) {
    return {
      isEditableElement: true,
      editableElement,
    }
  }
  return {
    isEditableElement: false,
    editableElement: null,
  }
}

/**
 * @description - 创建一个selectionElement
 * @param element
 * @param overwrite
 */
export const createSelectionElement = (
  element: HTMLElement,
  overwrite?: Partial<ISelectionElement>,
): ISelectionElement => {
  const target = element
  const selectionString = computedSelectionString()
  const editableElementSelectionString = ''
  const { isEditableElement, editableElement } = getEditableElement(target)
  const startMarkerId = ''
  const endMarkerId = ''
  let caretOffset = 0
  if (isEditableElement && editableElement) {
    caretOffset = getCaretCharacterOffsetWithin(editableElement)
    /**
     * @description - 2023/06/14 - 由于插入marker会改变editableElement的内容，所以这里先不插入marker，在展示floating menu的时候才插入marker
     */
  }
  const targetRect = cloneRect(target.getBoundingClientRect())
  let selectionRect: IRangyRect | null = null
  try {
    const windowRange = window
      .getSelection()
      ?.getRangeAt(0)
      ?.getBoundingClientRect()
    if (windowRange) {
      selectionRect = cloneRect(windowRange)
      if (isEditableElement && windowRange.width + windowRange.height === 0) {
        selectionRect = cloneRect(element.getBoundingClientRect())
      }
    }
  } catch (e) {
    console.log('createSelectionElement get range error: \t', e)
  }
  if (!selectionRect) {
    const boundary = {
      left: 0,
      right: window.innerWidth,
      top: 0,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
      x: 0,
      y: 0,
    }
    const centerRect = {
      x: boundary.width / 2,
      y: boundary.height / 2,
      left: boundary.width / 2,
      right: boundary.width / 2,
      top: boundary.height / 2,
      bottom: boundary.height / 2,
      width: 0,
      height: 0,
    }
    selectionRect = centerRect
  }
  const selectionElement: ISelectionElement = {
    isEmbedPage: false,
    virtual: false,
    tagName: target.tagName,
    // overwrite 会覆盖掉默认的值
    eventType: 'mouseup',
    target,
    isEditableElement,
    selectionText: selectionString,
    selectionHTML: selectionString,
    selectionRect,
    caretOffset,
    startMarkerId,
    endMarkerId,
    editableElementSelectionText: editableElementSelectionString,
    editableElementSelectionHTML: editableElementSelectionString,
    targetRect,
    ...overwrite,
  }
  return selectionElement
}

/**
 * @description - 获取当前的selection的实际元素
 * @param startContainer
 */
export const getSelectionBoundaryElement = (startContainer = true) => {
  let range, container
  if ((document as any).selection) {
    range = (document as any).selection.createRange()
    range.collapse(startContainer)
    return range.parentElement()
  } else {
    const selection = window.getSelection()
    if (selection?.getRangeAt) {
      if (selection?.rangeCount > 0) {
        range = selection.getRangeAt(0)
      }
    } else {
      // Old WebKit
      range = document.createRange()
      range.setStart(
        (selection as any)?.anchorNode,
        (selection as any)?.anchorOffset,
      )
      range.setEnd(
        (selection as any)?.focusNode,
        (selection as any)?.focusOffset,
      )
      // Handle the case when the selection was selected backwards (from the end to the start in the document)
      if (range.collapsed !== selection?.isCollapsed) {
        range.setStart(
          (selection as any)?.focusNode,
          (selection as any)?.focusOffset,
        )
        range.setEnd(
          (selection as any)?.anchorNode,
          (selection as any)?.anchorOffset,
        )
      }
    }
    if (range) {
      container = range[startContainer ? 'startContainer' : 'endContainer']
      // Check if the container is a text node and return its parent if so
      const element = (
        container.nodeType === 3 ? container.parentNode : container
      ) as HTMLElement
      if (
        element.tagName === 'BODY' ||
        element.tagName === 'HTML' ||
        element.tagName === 'IFRAME'
      ) {
        return undefined
      }
      if (isElementCanEditable(element)) {
        return element
      } else if (element.querySelector) {
        const editableDiv = element.querySelector(
          '[contenteditable="true"]',
        ) as HTMLElement
        if (editableDiv && isElementCanEditable(editableDiv)) {
          return editableDiv
        }
        const inputOrTextarea = element.querySelector(
          'input,textarea',
        ) as HTMLElement
        if (inputOrTextarea && isElementCanEditable(inputOrTextarea)) {
          return inputOrTextarea
        }
      }
      const { editableElement, isEditableElement } = getEditableElement(element)
      if (isEditableElement) {
        return editableElement
      }
      return undefined
    }
  }
}

/**
 * 移除修改过placeholder的元素
 * @param placeholderText
 */
export const removeEditableElementPlaceholder = (placeholderText: string) => {
  if (typeof document === 'undefined') {
    return
  }
  const nodes: Array<HTMLInputElement | HTMLTextAreaElement> = []
  document.querySelectorAll('input').forEach((input) => nodes.push(input))
  document
    .querySelectorAll('textarea')
    .forEach((textarea) => nodes.push(textarea))
  nodes.forEach((node) => {
    if (node.placeholder === placeholderText) {
      node.placeholder = ''
    }
  })
}

/**
 * 更新没有placeholder的元素
 * @param element
 * @param placeholderText
 */
export const updateEditableElementPlaceholder = (
  element: HTMLElement,
  placeholderText: string,
) => {
  if (typeof document === 'undefined') {
    return
  }
  removeEditableElementPlaceholder(placeholderText)
  if (isElementCanEditable(element)) {
    const inputElement = element as HTMLInputElement
    if (!inputElement.placeholder) {
      inputElement.placeholder = placeholderText
    }
  }
}
export const isElementCanEditable = (element: HTMLElement) => {
  if (!element?.tagName) {
    return false
  }
  if (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.getAttribute?.('contenteditable') === 'true'
  ) {
    // check input type
    const type = element.getAttribute('type')
    // check readonly/disabled
    // NOTE: 可能某些网站还是会有潜在问题导致检测异常
    const readonly = element.getAttribute('readonly')
    const ariaReadonly = element.getAttribute('aria-readonly')
    const disabled = element.getAttribute('disabled')
    const ariaDisabled = element.getAttribute('aria-disabled')
    if (
      type &&
      [
        'password',
        'file',
        'checkbox',
        'radio',
        'submit',
        'reset',
        'button',
        'image',
        'hidden',
      ].includes(type)
    ) {
      return false
    }
    if (
      readonly === 'true' ||
      disabled === 'true' ||
      ariaReadonly === 'true' ||
      ariaDisabled === 'true' ||
      readonly === '' ||
      disabled === ''
    ) {
      return false
    }
    if (
      element.id === ROOT_CHAT_BOX_INPUT_ID ||
      element.id === ROOT_FLOATING_INPUT_ID
    ) {
      return false
    }
    return true
  }
  return false
}

/**
 * 使用粘贴板粘贴【文本】在选区
 * 1. 创建可编辑的div
 * 2. 保存原始粘贴板的富文本html内容
 * 3. 删除可编辑的div
 * 4. 定位到原始的选区
 * 5. 粘贴【文本】
 * 6. 还原内容回粘贴板
 *  6.1 尝试调用copy
 *  6.2 如果失败, 还原粘贴板的富文本html为markdown
 *  6.3 还原markdown到粘贴板
 *  7. 还原最初选区
 * @param range
 * @param value
 */
export const replaceWithClipboard = async (range: Range, value: string) => {
  let originalRange: Range | null = range.cloneRange()
  const doc =
    (range.startContainer || range.endContainer)?.ownerDocument || document
  if (!doc) {
    return
  }
  try {
    const selection = doc.getSelection()
    // save rich text from clipboard
    const div = doc.createElement('div')
    div.id = ROOT_CLIPBOARD_ID
    div.setAttribute('contenteditable', 'true')
    div.style.cssText =
      'width: 1px;height: 1px;position: fixed;top: 0px;left:0px;overflow: hidden; z-index: -1;'
    doc.body.appendChild(div)
    div.addEventListener(
      'paste',
      (event) => {
        event.stopPropagation()
        console.log('replaceWithClipboard addEventListener paste div')
      },
      true,
    )
    div.addEventListener(
      'copy',
      (event) => {
        event.stopPropagation()
        console.log('replaceWithClipboard addEventListener copy div')
      },
      true,
    )
    div.focus() // 将光标定位到div中
    const divRange = doc.createRange()
    divRange.selectNodeContents(div)
    selection?.removeAllRanges()
    selection?.addRange(divRange)
    div.focus()
    if (!['evernote.com'].includes(getCurrentDomainHost())) {
      doc.execCommand('paste', false, '')
    }
    const { editableElement } = getEditableElement(
      (originalRange.startContainer ||
        originalRange.endContainer) as HTMLElement,
    )
    // 利用setTimeout来等待粘贴完成, 否则会在whatsapp中粘贴失败
    const delay = (t: number) =>
      new Promise((resolve) => setTimeout(resolve, t))
    if (await getClipboardPermission()) {
      await navigator.clipboard.writeText(value)
      editableElement && editableElement.focus()
      // restore rich text to clipboard
      selection?.removeAllRanges()
      selection?.addRange(originalRange)
      await delay(0)
      doc.execCommand('paste', false, '')
    } else {
      editableElement && editableElement.focus()
      // restore rich text to clipboard
      selection?.removeAllRanges()
      selection?.addRange(originalRange)
      doc.execCommand('insertText', false, value)
    }
    await delay(0)
    // 保存粘贴或者插入后的选区位置
    // 1. 如果是粘贴, 选区会变成粘贴的内容
    // 2. 如果是插入, 选区会变成插入的内容
    const currentSelection = doc.getSelection()
    if (currentSelection && currentSelection?.rangeCount > 0) {
      originalRange =
        currentSelection?.getRangeAt(0).cloneRange() || originalRange
    } else {
      originalRange = null
    }
    try {
      // select all from div
      const divRange2 = doc.createRange()
      divRange2.selectNodeContents(div)
      selection?.removeAllRanges()
      selection?.addRange(divRange2)
      div.focus()
      doc.execCommand('copy', false, '')
      console.log('replaceWithClipboard copy success')
    } catch (e) {
      console.log('replaceWithClipboard copy error: \t', e)
      const richText = div.innerText.trim()
      try {
        const turnDownService = new TurnDownService()
        turnDownService.addRule('pre', {
          filter: 'pre',
          replacement: function (content: string, node: any) {
            // Note this is not bulletproof, see below.
            return '```\n' + node.textContent + '\n```'
          },
        })
        const markdown = turnDownService.turndown(div)
        console.log('replaceWithClipboard markdown: \t', markdown)
        await navigator.clipboard.writeText(markdown || richText)
      } catch (e) {
        await navigator.clipboard.writeText(richText)
        console.log('replaceWithClipboard convert to markdown error: \t', e)
      }
    } finally {
      div.remove()
    }
  } catch (e) {
    console.log('replaceWithClipboard error: \t', e)
  } finally {
    const selection = doc.getSelection()
    if (selection && originalRange) {
      selection.removeAllRanges()
      selection.addRange(originalRange)
      originalRange.collapse(false)
      selection.collapseToEnd()
    }
  }
}

export const newShortcutHint = (shortCutKey: string) =>
  `Press '${shortCutKey}' for AI`
