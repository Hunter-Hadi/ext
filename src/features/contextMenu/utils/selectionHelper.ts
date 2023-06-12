import { v4 as uuidV4 } from 'uuid'
import isNumber from 'lodash-es/isNumber'
import { ISelectionElement } from '@/features/contextMenu/types'
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
          let boundaryRange = range.cloneRange()
          boundaryRange.collapse(true)
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
            const selectionString =
              inputElement.value.substring(start, end) ||
              inputElement.value ||
              ''
            return { startMarkerId, endMarkerId, selectionString }
          } else {
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
            const selectionString = range.toString()
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

export const createSelectionElement = (
  element: HTMLElement,
  overwrite?: Partial<ISelectionElement>,
): ISelectionElement => {}
