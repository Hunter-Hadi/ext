import { v4 as uuidV4 } from 'uuid'
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
// export const getSelectionOffset = (element: HTMLElement) => {
//   let start = 0
//   let end = 0
//   const doc = element.ownerDocument || (element as any).document
//   const win = doc.defaultView || (doc as any).parentWindow
//   let sel
//   if (typeof win.getSelection != 'undefined') {
//     sel = win.getSelection()
//     if (sel.rangeCount > 0) {
//       const range = win.getSelection().getRangeAt(0)
//       const preCaretRange = range.cloneRange()
//       preCaretRange.selectNodeContents(element)
//       preCaretRange.setEnd(range.startContainer, range.startOffset)
//       start = preCaretRange.toString().length
//       preCaretRange.setEnd(range.endContainer, range.endOffset)
//       end = preCaretRange.toString().length
//     }
//   } else if ((sel = (doc as any).selection) && sel.type != 'Control') {
//     const textRange = sel.createRange()
//     const preCaretTextRange = (doc.body as any).createTextRange()
//     preCaretTextRange.moveToElementText(element)
//     preCaretTextRange.setEndPoint('EndToEnd', textRange)
//     end = preCaretTextRange.text.length
//     preCaretTextRange.setEndPoint('EndToStart', textRange)
//     start = preCaretTextRange.text.length
//   }
//   return { start, end }
// }

export const createSelectionMarker = (element: HTMLElement) => {
  if (element) {
    const doc = element.ownerDocument || (element as any).document
    // remove all markers
    const markers = doc.querySelectorAll('[data-type="usechatgpt-marker"]')
    markers.forEach((marker) => {
      marker.remove()
    })
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
        const startMarker = doc.createElement('span')
        startMarker.id = startMarkerId
        startMarker.style.lineHeight = '0'
        startMarker.style.display = 'none'
        startMarker.textContent = markerTextChar
        startMarker.setAttribute('data-type', 'usechatgpt-marker')
        startMarker.setAttribute('contenteditable', 'false')
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
        boundaryRange.insertNode(endMarker)
        return { startMarkerId, endMarkerId }
      }
    }
  }
  return {
    startMarkerId: '',
    endMarkerId: '',
  }
}
export const replaceMarkerContent = (
  startMarkerId: string,
  endMarkerId: string,
  value: string,
  type: 'insert_blow' | 'insert_above' | 'replace',
) => {
  const startMarker = document.getElementById(startMarkerId)
  const endMarker = document.getElementById(endMarkerId)
  if (startMarker && endMarker) {
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
  document
    .querySelectorAll('[data-type="usechatgpt-marker"]')
    .forEach((marker) => {
      marker.remove()
    })
}
