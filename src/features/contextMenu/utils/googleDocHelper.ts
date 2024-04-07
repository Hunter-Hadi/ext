import { EventEmitter } from '@/utils/eventEmitter'
import Log from '@/utils/Log'

const log = new Log('ContextMenu/GoogleDocHelper')

const emptyRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
}

export enum IGoogleDocEventType {
  SELECTION_CHANGE = 'selection-change',
  CARET_CHANGE = 'caret-change',
}

export interface IGoogleDocRect {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface IGoogleDocLayout extends Exclude<IGoogleDocRect, 'x' | 'y'> {}

export interface IGoogleDocParagraph {
  element: Element
  rect: IGoogleDocRect
  layout: IGoogleDocLayout
  texts: IGoogleDocText[]
  style: {
    top: number
    left: number
    width: number
    height: number
  }
}

export interface IGoogleDocText {
  element: Element
  rect: IGoogleDocRect
  layout: IGoogleDocLayout
  content: string
  style: {
    top: number
    left: number
    height: number
    width: number
    fontWeight: string
    fontSize: string
    fontFamily: string
  }
}

export interface IGoogleDocSelection {
  elements: Element[]
  paragraphs: IGoogleDocParagraph[]
  rects: IGoogleDocRect[]
  layouts: IGoogleDocLayout[]
}

export interface IGoogleDocCaret {
  element: Element
  text: IGoogleDocText | null
  rect: IGoogleDocRect
  layout: IGoogleDocLayout
  // index: number;
}

/**
 * 检测两个元素是否相交
 * @param rect1
 * @param rect2
 */
export const isRectIntersect = (
  rect1: IGoogleDocRect,
  rect2: IGoogleDocRect,
) => {
  return !(
    rect1.top >= rect2.bottom ||
    rect1.bottom <= rect2.top ||
    rect1.left >= rect2.right ||
    rect1.right <= rect2.left
  )
}

/**
 * 计算目标元素相对于compare元素位置和大小
 * @param compare
 * @param target
 */
export const calculateRectLayout = (
  compare: IGoogleDocRect,
  target: IGoogleDocRect,
) => {
  const offsetX = target.left - compare.left
  const offsetY = target.top - compare.top
  return {
    x: target.x - compare.x,
    y: target.y - compare.y,
    top: offsetY,
    left: offsetX,
    right: offsetX + target.width,
    bottom: offsetY + target.height,
    width: target.width,
    height: target.height,
  }
}

/**
 * 检测坐标是否位于元素内
 * @param x
 * @param y
 * @param rects
 */
export const isPointInRect = (
  x: number,
  y: number,
  rects: IGoogleDocRect[],
) => {
  for (const rect of rects) {
    if (
      x >= Math.floor(rect.left) &&
      x <= Math.floor(rect.right) &&
      y >= Math.floor(rect.top) &&
      y <= Math.floor(rect.bottom)
    ) {
      return true
    }
  }
  return false
}

export const mergeRects = (rects: IGoogleDocRect[]) => {
  if (!rects.length) return emptyRect
  const rect = { ...rects[0] }
  rects.forEach((item) => {
    rect.top = Math.min(rect.top, item.top)
    rect.left = Math.min(rect.left, item.left)
    rect.right = Math.max(rect.right, item.right)
    rect.bottom = Math.max(rect.bottom, item.bottom)
  })
  rect.x = rect.left
  rect.y = rect.top
  rect.width = Math.abs(rect.right - rect.left)
  rect.height = Math.abs(rect.bottom - rect.top)
  return rect
}

export class GoogleDocControl extends EventEmitter {
  disabled: boolean

  styleElement?: HTMLStyleElement | null

  // 编辑器
  editorElement?: HTMLDivElement | null

  // 滚动容器
  scrollElement?: HTMLDivElement | null

  // iframe元素
  iframeElement?: HTMLIFrameElement | null

  // 输入框 通过此input触发粘贴事件
  inputElement?: HTMLDivElement | null

  // 光标
  caretElement?: HTMLDivElement | null

  // 记录上一次光标
  lastCaret: IGoogleDocCaret | null = null

  // 记录上一次选区
  lastSelection: IGoogleDocSelection | null = null

  constructor() {
    super()
    this.disabled = !location.href.startsWith(
      'https://docs.google.com/document',
    )
  }

  init() {
    if (this.disabled) return
    this.initElement()
    this.initListener()
  }

  initElement() {
    this.editorElement = document.querySelector('div.kix-appview-editor')
    this.scrollElement = document.querySelector(
      'div.kix-scrollareadocumentplugin',
    )
    // this.selectionElement = document.querySelector('.kix-canvas-tile-selection')
    // this.annotateElement = document.querySelector(
    //   'canvas ~ .kix-canvas-tile-content:not(.kix-canvas-tile-selection)',
    // )
    this.iframeElement = document.querySelector(
      'iframe.docs-texteventtarget-iframe',
    )
    this.inputElement = this.iframeElement?.contentDocument?.querySelector(
      'div[contenteditable="true"]',
    )
    this.caretElement = document.querySelector('#kix-current-user-cursor-caret')
  }

  _onSelectionOrCaretChange = () => {
    this.lastSelection = this.getCurrentSelection()
    this.emit(IGoogleDocEventType.SELECTION_CHANGE, this.lastSelection)

    this.lastCaret = this.getCurrentCaret()
    this.emit(IGoogleDocEventType.CARET_CHANGE, this.lastCaret)
  }

  initListener() {
    this.editorElement?.addEventListener(
      'mouseup',
      this._onSelectionOrCaretChange,
    )
    this.inputElement?.addEventListener('keyup', this._onSelectionOrCaretChange)
  }

  destroy() {
    this.editorElement?.removeEventListener(
      'mouseup',
      this._onSelectionOrCaretChange,
    )
    this.inputElement?.removeEventListener(
      'keyup',
      this._onSelectionOrCaretChange,
    )
    this.removeAllListeners()
  }

  calculateRelativeLayout(rect: IGoogleDocRect) {
    if (!this.scrollElement) {
      return emptyRect
    }
    return calculateRectLayout(
      this.scrollElement?.getBoundingClientRect(),
      rect,
    )
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
   * 拷贝当前选区内容
   */
  copySelection() {
    this.inputElement?.focus()
    this.inputElement?.dispatchEvent(
      new ClipboardEvent('copy', {
        bubbles: true,
        cancelable: true,
      }),
    )
    return this.inputElement?.innerText
  }

  async getSelectionContent(selection: IGoogleDocSelection) {
    if (this.lastSelection === selection) {
      return this.copySelection()
    }
    await this.selectRectBySelection(selection)
    return this.copySelection()
  }

  /**
   * 选中某个选区
   * @param selection
   */
  async selectRectBySelection(selection: IGoogleDocSelection): Promise<void> {
    if (!this.editorElement || !this.scrollElement) return

    const { layouts } = selection
    const first = layouts[0]
    const last = layouts[layouts.length - 1]

    const scrollRect = this.scrollElement.getBoundingClientRect()

    const start = {
      bubbles: true,
      clientX: scrollRect.left + first.left,
      clientY: scrollRect.top + first.top + first.height / 2,
    }

    const end = {
      bubbles: true,
      clientX: scrollRect.left + last.right,
      clientY: scrollRect.top + last.top + last.height / 2,
    }

    // 目前遇到个问题，如果选区在可视区上方会自动滚动上去，如果在下方则会失效
    // 如果选区在可视区下方，先滚动到目标位置
    const bottom = Math.max(first.bottom, last.bottom)
    const top = Math.max(first.top, last.top)

    if (
      this.editorElement.scrollTop + this.editorElement.offsetHeight <
      bottom
    ) {
      this.editorElement.scrollTo({ top, behavior: 'auto' })
      await new Promise((resolve) => setTimeout(resolve, 50))
      return this.selectRectBySelection(selection)
    }

    const events = [
      // 先点击一次取消选区，防止在原位上直接点击拖拽的话会变成拖拽选区
      new MouseEvent('click', start),
      // new MouseEvent('mouseup', start),,
      // new MouseEvent('mousedown', start),
      // 模拟点击选择操作
      new MouseEvent('mousedown', start),
      new MouseEvent('mousemove', end),
      new MouseEvent('mouseup', end),
    ]

    events.forEach((e) => this.editorElement?.dispatchEvent(e))
    await new Promise((resolve) => setTimeout(resolve, 50))
    this.inputElement?.dispatchEvent(
      new KeyboardEvent('keyup', {
        shiftKey: true,
        key: 'Shift',
        code: 'ShiftLeft',
      }),
    )
  }

  parseTextElement(element: Element): IGoogleDocText {
    const content = element.getAttribute('aria-label') || ''
    const css = element.getAttribute('data-font-css') || ''
    const [fontWeight, fontSize, fontFamily] = css.split(' ')
    const rect = element.getBoundingClientRect().toJSON()
    const layout = this.calculateRelativeLayout(rect)
    return {
      element,
      content,
      rect,
      layout,
      style: {
        top: layout.top,
        left: layout.left,
        width: layout.width,
        height: layout.height,
        fontWeight,
        fontSize,
        fontFamily: fontFamily?.replaceAll('"', ''),
      },
    }
  }

  parseParagraphElement(element: Element): IGoogleDocParagraph {
    const rect = element.getBoundingClientRect().toJSON()
    const layout = this.calculateRelativeLayout(rect)
    const texts = Array.from(element.querySelectorAll('rect'))
      .filter((item) => item.parentElement?.tagName !== 'clipPath')
      .map((item) => this.parseTextElement(item))
    return {
      element,
      rect,
      layout,
      texts,
      style: {
        top: layout.top,
        left: layout.left,
        width: layout.width,
        height: layout.height,
      },
    }
  }

  /**
   * 获取当前选区
   */
  getCurrentSelection(): IGoogleDocSelection | null {
    if (!this.editorElement) return null

    // 找selection下的所有选择框
    const layouts: IGoogleDocRect[] = []
    const rects: IGoogleDocRect[] = []
    const elements = Array.from(
      this.editorElement.querySelectorAll('.kix-canvas-tile-selection rect'),
    ).filter((item) => {
      const flag =
        item.parentElement?.tagName !== 'clipPath' &&
        ['rgba(118,167,250,0.5)', 'rgba(0,0,0,0.15)'].includes(
          item.getAttribute('fill') || '',
        )
      if (flag) {
        const rect = item.getBoundingClientRect().toJSON()
        layouts.push(this.calculateRelativeLayout(rect))
        rects.push(rect)
      }
      return flag
    })

    // 找画布下处于选择框内的段落和文字
    const paragraphs = Array.from(
      this.editorElement.querySelectorAll(
        'canvas ~ .kix-canvas-tile-content:not(.kix-canvas-tile-selection) g[role="paragraph"]',
      ),
    )
      .filter((item) =>
        rects.some((rect) =>
          isRectIntersect(rect, item.getBoundingClientRect()),
        ),
      )
      .map((item) => this.parseParagraphElement(item))

    log.info({ paragraphs, rects, layouts })

    return { elements, rects, paragraphs, layouts }
  }

  /**
   * 获取当前光标
   */
  getCurrentCaret(): IGoogleDocCaret | null {
    if (!this.editorElement || !this.caretElement) return null

    const element = this.caretElement
    const rect = this.caretElement.getBoundingClientRect()
    const layout = this.calculateRelativeLayout(rect)
    const { top, right } = rect
    const x = Math.floor(right || 0)
    const y = Math.floor(top || 0)
    const textElement = this.getElementFromPoint(x, y)
    const text =
      textElement && textElement.tagName === 'rect'
        ? this.parseTextElement(textElement)
        : null

    log.info({ element, text, rect, layout })

    return {
      element,
      text,
      rect,
      layout,
    }
  }

  /**
   * 获取选取内的文字
   * @param selection
   */
  getTextsFromSelection(selection: IGoogleDocSelection): IGoogleDocText[] {
    const { paragraphs, rects } = selection
    const texts = paragraphs.flatMap((paragraph) =>
      paragraph.texts.filter((text) =>
        rects.some((br) => isRectIntersect(br, text.rect)),
      ),
    )
    log.info(texts)
    return texts
  }

  getElementFromPoint(x: number, y: number) {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style')
      this.styleElement.id = 'enable-pointer-events-on-rect'
      this.styleElement.textContent = [
        `.kix-canvas-tile-content{pointer-events:none!important;}`,
        `#kix-current-user-cursor-caret{pointer-events:none!important;}`,
        `.kix-canvas-tile-content svg>g>rect{pointer-events:all!important; stroke-width:7px !important;}`,
      ].join('\n')
      ;(document.head || document.documentElement).appendChild(
        this.styleElement,
      )
    }
    this.styleElement.disabled = false
    const element = document.elementFromPoint(x, y)
    this.styleElement.disabled = true
    return element
  }

  getCaretIndex(caret: IGoogleDocCaret) {
    if (!caret.text) return null

    const { rect, text } = caret
    const { top, right } = rect
    const x = Math.floor(right || 0)
    const y = Math.floor(top || 0)
    const { element, content } = text
    const contentNode = document.createTextNode(content)
    const textOverlay = this.createTextOverlay(element, contentNode)

    if (!textOverlay) return null

    const range = document.createRange()
    let start = 0
    let end = contentNode.nodeValue?.length || 0

    while (end - start > 1) {
      const mid = Math.floor((start + end) / 2)
      range.setStart(contentNode, mid)
      range.setEnd(contentNode, end)
      const rects = Array.from(range.getClientRects())
      if (isPointInRect(x, y, rects)) {
        start = mid
      } else {
        if (x > rects[0].right) {
          start = end
        } else {
          end = mid
        }
      }
    }

    const caretIndex = start
    textOverlay.remove()
    return caretIndex
  }

  createTextOverlay(element: Element, textNode: any) {
    if (!element || element.tagName !== 'rect') return null

    const textElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text',
    )
    const transform = element.getAttribute('transform') || ''
    const font = element.getAttribute('data-font-css') || ''

    textElement.setAttribute('x', element.getAttribute('x') || '')
    textElement.setAttribute('y', element.getAttribute('y') || '')
    textElement.appendChild(textNode)
    textElement.style.setProperty('all', 'initial', 'important')
    textElement.style.setProperty('transform', transform, 'important')
    textElement.style.setProperty('font', font, 'important')
    textElement.style.setProperty('text-anchor', 'start', 'important')

    element.parentNode?.appendChild(textElement)

    const elementRect = element.getBoundingClientRect()
    const textRect = textElement.getBoundingClientRect()
    const yOffset =
      (elementRect.top -
        textRect.top +
        (elementRect.bottom - textRect.bottom)) *
      0.5
    textElement.style.setProperty(
      'transform',
      `translate(0px,${yOffset}px) ${transform}`,
      'important',
    )

    return textElement
  }
}
