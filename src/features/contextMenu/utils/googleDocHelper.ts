import Log from '@/utils/Log'

const log = new Log('ContextMenu/GoogleDocContext')

export const isRectIntersect = (rect1: DOMRect, rect2: DOMRect) => {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  )
}

export class GoogleDocContext {
  log = log;

  editorElement?: HTMLDivElement | null

  // 选择框
  selectionElement?: HTMLDivElement | null

  // 注释画布 TODO 处理多页情况
  annotateElement?: HTMLDivElement | null

  // 输入框 通过此input触发粘贴事件
  inputElement?: HTMLDivElement | null

  // 光标
  cursorElement?: HTMLDivElement | null

  lastCursor = {}

  constructor() {
    if (location.href.startsWith('https://docs.google.com/document')) {
      this.initElement()
    }
  }

  initElement() {
    this.editorElement = document.querySelector('div.kix-appview-editor')
    this.selectionElement = document.querySelector('.kix-canvas-tile-selection')
    this.annotateElement = document.querySelector(
      'canvas ~ .kix-canvas-tile-content:not(.kix-canvas-tile-selection)',
    )
    this.inputElement = (
      document.querySelector(
        '.docs-texteventtarget-iframe',
      ) as HTMLIFrameElement
    )?.contentDocument?.querySelector('div[contenteditable="true"]')
    this.cursorElement = document.querySelector('div.kix-cursor')
  }

  /**
   * 替换选区内容
   * @param value
   */
  replaceSelection(value: string) {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/plain', value)
    this.inputElement?.focus()
    this.inputElement?.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    )
  }

  /**
   * 选择选区
   */
  selectRectByIndexes() {}

  getRectsFromRange() {}

  /**
   * 获取当前选区
   */
  getCurrentSelection() {
    if (!this.selectionElement) return
    // 找selection下的所有选择框
    const rectList = Array.from(this.selectionElement.querySelectorAll('rect'))
      .filter((item) => item.parentElement?.tagName !== 'clipPath')
      .filter((item) =>
        ['rgba(118,167,250,0.5)', 'rgba(0,0,0,0.15)'].includes(
          item.getAttribute('fill') || '',
        ),
      )
      .map((item) => item.getBoundingClientRect())
    log.info('getCurrentSelection', rectList)
    return rectList
  }

  getRectsFromSelection(selections: DOMRect[]) {
    if (!this.annotateElement) return
    const recList = Array.from(this.annotateElement.querySelectorAll('rect'))
      .filter((item) => item.parentElement?.tagName !== 'clipPath')
      .filter((item) => {
        return selections.some((selection) =>
          isRectIntersect(selection, item.getBoundingClientRect()),
        )
      })
    log.info('getRectsFromSelection', recList);
    return recList
  }
}
