import { v4 as uuidV4 } from 'uuid'
import isNumber from 'lodash-es/isNumber'
import { IRangyRect, ISelectionElement } from '@/features/contextMenu/types'
import { cloneRect } from '@/features/contextMenu/utils/index'
import { getCurrentDomainHost } from '@/utils'
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
      return String(document.getSelection())
    } else if ((document as any).selection) {
      // Internet Explorer 8 and below
      return (document as any).selection.createRange().text
    } else if (window.getSelection) {
      // Safari 3
      return String(window.getSelection())
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
export const createSelectionMarker = (element: HTMLElement) => {
  try {
    if (element) {
      const doc = element.ownerDocument || (element as any).document
      // remove all markers
      removeAllSelectionMarker()
      const win = doc.defaultView || (doc as any).parentWindow
      let sel
      const startMarkerId = `usechatgpt-start-marker-${uuidV4()}`
      const endMarkerId = `usechatgpt-end-marker-${uuidV4()}`
      const markerTextChar = '\ufeff'
      if (typeof win.getSelection != 'undefined') {
        sel = win.getSelection()
        if (sel.rangeCount > 0) {
          const range = win.getSelection().getRangeAt(0)
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
            /**
             * 选区内容优先级
             * 1. 选区内容
             * 2. 输入框的从[0 - 光标位置]的内容
             * 3. 输入框的内容
             */
            const selectionString =
              inputElement.value.substring(start, end).trim() ||
              inputElement.value.substring(0, start).trim() ||
              inputElement.value.trim() ||
              ''
            return { startMarkerId, endMarkerId, selectionString }
          } else {
            const partOfRangeSelected = range.cloneRange()
            partOfRangeSelected.selectNodeContents(element)
            partOfRangeSelected.setEnd(range.endContainer, range.endOffset)
            const partOfRangeSelectedText = partOfRangeSelected
              .toString()
              .trim()
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
            /**
             * 选区内容优先级
             * 1. 选区内容
             * 2. 选区的innerText从[0 - 光标位置]的内容
             * 3. 选区的innerText内容
             */
            const selectionString =
              range.toString().trim() ||
              partOfRangeSelectedText ||
              element.innerText.trim() ||
              ''
            return { startMarkerId, endMarkerId, selectionString }
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
    selectionString: '',
  }
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
  editableElement.focus()
  // Define selection
  editableElement.setSelectionRange(start, end)
  if (editableElement.tagName === 'TEXTAREA') {
    const textArea = editableElement as HTMLTextAreaElement
    // We need the number of characters in a row
    const charsPerRow = textArea.cols
    // We need to know at which row our selection starts
    const selectionRow = (end - (end % charsPerRow)) / charsPerRow
    // We need to scroll to this row but scrolls are in pixels,
    // so we need to know a row's height, in pixels
    const lineHeight = textArea.clientHeight / textArea.rows
    // Scroll!!
    textArea.scrollTop = lineHeight * selectionRow
  }
}

/**
 * 替换marker内容
 * @description - 替换分两种情况
 * 1. input/textarea
 *  1.1 基于startMarker和endMarker的offset，替换或添加到底部在input/textarea的value
 *  1.2 选中替换/插入的内容
 *  1.3 滚动到光标位置并且设置高亮
 * 2. editable元素
 *  2.1 基于startMarker和endMarker的offset，替换或添加到底部在元素的innerHTML
 *  2.2 选中替换/插入的内容
 *  2.3 设置高亮
 * 基于startMarker和endMarker的offset，替换或添加到底部在元素的innerHTML
 * @param startMarkerId
 * @param endMarkerId
 * @param value
 * @param type
 */
export const replaceMarkerContent = (
  startMarkerId: string,
  endMarkerId: string,
  value: string,
  type: 'insert_blow' | 'insert_above' | 'replace',
) => {
  const startMarker = document.querySelector(
    `[data-usechatgpt-marker-start-id="${startMarkerId}"`,
  ) as HTMLElement
  const endMarker = document.querySelector(
    `[data-usechatgpt-marker-end-id="${endMarkerId}"`,
  )
  if (startMarker.tagName === 'INPUT' || startMarker.tagName === 'TEXTAREA') {
    const inputElement = startMarker as HTMLInputElement
    const start = Number(
      inputElement.getAttribute('data-usechatgpt-start-offset'),
    )
    const end = Number(inputElement.getAttribute('data-usechatgpt-end-offset'))
    if (isNumber(start) && isNumber(end)) {
      if (type === 'replace') {
        const newValue =
          inputElement.value.substring(0, start) +
          value +
          inputElement.value.substring(end, inputElement.value.length)
        inputElement.value = newValue
      } else if (type === 'insert_blow') {
        if (inputElement.tagName === 'TEXTAREA') {
          value = ('\n\n' + value).replace(/^\n{2,}/, '\n\n')
        } else {
          value = (' ' + value).replace(/^\s+/, ' ')
        }
        const newValue =
          inputElement.value.substring(0, start) +
          value +
          inputElement.value.substring(start, inputElement.value.length)
        inputElement.value = newValue
      }
      inputSetSelectionAndScrollTo(inputElement, start, start + value.length)
    }
  } else if (startMarker && endMarker) {
    const range = document.createRange()
    if (type === 'insert_blow') {
      value = ('\n\n' + value).replace(/^\n{2,}/, '\n\n')
      range.setStartAfter(endMarker)
      range.setEndAfter(endMarker)
    } else if (type === 'replace') {
      range.setStartAfter(startMarker)
      range.setEndBefore(endMarker)
      range.deleteContents()
    }
    /**
     * @description - 默认的修改内容和高亮选中内容处理, 在不同网站下，高亮选中内容的处理不一样
     *
     */
    const defaultHandleChangeValueAndHighlight = (insertValue?: string) => {
      if (insertValue) {
        range.insertNode(document.createTextNode(insertValue))
      }
      startMarker.focus()
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
      removeAllSelectionMarker()
    }
    if (getCurrentDomainHost() === 'mail.google.com') {
      const { editableElement } = getEditableElement(
        startMarker as HTMLSpanElement,
      )
      if (editableElement) {
        editableElement.focus()
        editableElement.click()
      }
      setTimeout(() => {
        /**
         * 反转数组是因为插入的内容是从底部插入的
         */
        value
          .split('\n\n')
          .reverse()
          .forEach((partOfText) => {
            const div = document.createElement('div')
            div.style.cssText = 'white-space: pre-wrap;'
            div.innerText = partOfText
            range.insertNode(div)
          })
        defaultHandleChangeValueAndHighlight()
      }, 100)
    } else {
      defaultHandleChangeValueAndHighlight(value)
    }
  }
  removeAllSelectionMarker()
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
  let editableElement: HTMLInputElement | null = null
  let maxLoop = defaultMaxLoop
  while (parentElement && maxLoop > 0) {
    if (
      parentElement?.tagName === 'INPUT' ||
      parentElement?.tagName === 'TEXTAREA' ||
      parentElement?.getAttribute?.('contenteditable') === 'true'
    ) {
      const type = parentElement.getAttribute('type')
      if (type && type !== 'text') {
        break
      }
      editableElement = parentElement as any
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
    // const selectionMarker = createSelectionMarker(editableElement)
    // startMarkerId = selectionMarker.startMarkerId
    // endMarkerId = selectionMarker.endMarkerId
    // // 如果是输入框，则获取输入框选中的文本的值，否则用输入框的内容
    // if (selectionMarker.selectionString) {
    //   console.log('AIInput marker string', selectionMarker.selectionString)
    //   editableElementSelectionString = selectionMarker.selectionString
    // }
  }
  const targetRect = cloneRect(target.getBoundingClientRect())
  let selectionRect: IRangyRect | null = null
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
      return container.nodeType === 3 ? container.parentNode : container
    }
  }
}
