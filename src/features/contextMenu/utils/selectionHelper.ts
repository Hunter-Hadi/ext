import { v4 as uuidV4 } from 'uuid'
import isNumber from 'lodash-es/isNumber'
import { IRangyRect, ISelectionElement } from '@/features/contextMenu/types'
import { cloneRect } from '@/features/contextMenu/utils/index'
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
            element.setAttribute('data-usechatgpt-start', start.toString())
            element.setAttribute('data-usechatgpt-end', end.toString())
            element.setAttribute('data-usechatgpt-marker', 'usechatgpt-marker')
            element.setAttribute(
              'data-usechatgpt-start-marker-id',
              startMarkerId,
            )
            element.setAttribute('data-usechatgpt-end-marker-id', endMarkerId)
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
              'data-usechatgpt-start-marker-id',
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
            endMarker.setAttribute('data-type', 'usechatgpt-marker')
            endMarker.setAttribute('contenteditable', 'false')
            endMarker.setAttribute(
              'data-usechatgpt-marker',
              'usechatgpt-marker',
            )
            endMarker.setAttribute('data-usechatgpt-end-marker-id', endMarkerId)
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
 * 2. 其他元素
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
    `[data-usechatgpt-start-marker-id="${startMarkerId}"`,
  ) as HTMLElement
  const endMarker = document.querySelector(
    `[data-usechatgpt-end-marker-id="${endMarkerId}"`,
  )
  if (startMarker.tagName === 'INPUT' || startMarker.tagName === 'TEXTAREA') {
    const inputElement = startMarker as HTMLInputElement
    const start = Number(inputElement.getAttribute('data-usechatgpt-start'))
    const end = Number(inputElement.getAttribute('data-usechatgpt-end'))
    if (isNumber(start) && isNumber(end)) {
      if (type === 'replace') {
        const newValue =
          inputElement.value.substring(0, start) +
          value +
          inputElement.value.substring(end, inputElement.value.length)
        inputElement.value = newValue
      } else if (type === 'insert_blow') {
        if (inputElement.tagName === 'TEXTAREA') {
          value = '\n' + value
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
    range.setStartAfter(startMarker)
    range.setEndBefore(endMarker)
    range.deleteContents()
    if (type === 'insert_blow') {
      value = '\n' + value
    }
    range.insertNode(document.createTextNode(value))
    startMarker.remove()
    endMarker.remove()
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
    if (marker.tagName === 'SPAN') {
      marker.remove()
      return
    }
    marker.removeAttribute('data-usechatgpt-marker')
    marker.removeAttribute('data-usechatgpt-start')
    marker.removeAttribute('data-usechatgpt-end')
    marker.removeAttribute('data-usechatgpt-start-marker-id')
    marker.removeAttribute('data-usechatgpt-end-marker-id')
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

export const createSelectionElement = (
  element: HTMLElement,
  overwrite?: Partial<ISelectionElement>,
): ISelectionElement => {
  const target = element
  const selectionString = computedSelectionString()
  let editableElementSelectionString = ''
  const { isEditableElement, editableElement } = getEditableElement(target)
  let startMarkerId = ''
  let endMarkerId = ''
  let caretOffset = 0
  if (isEditableElement && editableElement) {
    caretOffset = getCaretCharacterOffsetWithin(editableElement)
    const selectionMarker = createSelectionMarker(editableElement)
    startMarkerId = selectionMarker.startMarkerId
    endMarkerId = selectionMarker.endMarkerId
    // 如果是输入框，则获取输入框选中的文本的值，否则用输入框的内容
    if (selectionMarker.selectionString) {
      console.log('AIInput marker string', selectionMarker.selectionString)
      editableElementSelectionString = selectionMarker.selectionString
    }
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
