import Log from '@/utils/Log'

const log = new Log('ContextMenu/GoogleDocContext')

export interface IGoogleDocParagraph {
  element: Element
  rect: IGoogleDocRect
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

export interface IGoogleDocRect {
  // 基于适口位置
  x: number
  y: number
  // 基于scrollElement的位置
  top: number
  left: number
  right: number
  bottom: number
  // 大小
  width: number
  height: number
}

export interface IGoogleDocSelection {
  paragraphs: IGoogleDocParagraph[]
  rects: IGoogleDocRect[]
}

export interface IGoogleDocCursor {}

/**
 * 检测两个元素是否相交
 * @param rect1
 * @param rect2
 */
export const isRectIntersect = (
  rect1: IGoogleDocRect,
  rect2: IGoogleDocRect,
) => {
  // return !(
  //   rect1.top > rect2.bottom ||
  //   rect1.bottom < rect2.top ||
  //   rect1.left > rect2.right ||
  //   rect1.right < rect2.left
  // )
  return (
    (rect1.top > rect2.top && rect1.top < rect2.top + rect2.height) ||
    (rect1.bottom < rect2.bottom &&
      rect1.bottom > rect2.bottom - rect2.height) ||
    (rect1.left > rect2.left && rect1.left < rect2.left + rect2.width) ||
    (rect1.right < rect2.right && rect1.right > rect2.right - rect2.width)
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
  return {
    x: target.x,
    y: target.y,
    top: target.top - compare.top,
    left: target.left - compare.left,
    right: target.right - compare.right,
    bottom: target.bottom - compare.bottom,
    width: target.width,
    height: target.height,
  }
}

export class GoogleDocControl {
  log = log

  editorElement?: HTMLDivElement | null

  // 文档 包含多个canvas
  docElement?: HTMLDivElement | null

  // 滚动容器
  scrollElement?: HTMLDivElement | null

  // 选择框
  selectionElement?: HTMLDivElement | null

  // 注释画布 TODO 处理多页情况
  annotateElement?: HTMLDivElement | null

  // 输入框 通过此input触发粘贴事件
  inputElement?: HTMLDivElement | null

  // 光标
  cursorElement?: HTMLDivElement | null

  // 记录上一次光标
  lastCursor: IGoogleDocCursor | null = null

  // 记录上一次选区
  lastSelection: IGoogleDocSelection | null = null

  constructor() {
    if (location.href.startsWith('https://docs.google.com/document')) {
      this.initElement()
    }
  }

  initElement() {
    this.editorElement = document.querySelector('div.kix-appview-editor')
    this.docElement = document.querySelector('div.kix-rotatingtilemanager')
    this.scrollElement = document.querySelector(
      'div.kix-scrollareadocumentplugin',
    )
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

  initListener() {
    this.selectionElement?.addEventListener('mouseup', this.onSelectionChange)
    this.selectionElement?.addEventListener('keyup', this.onSelectionChange)
  }

  destroy() {
    this.selectionElement?.removeEventListener(
      'mouseup',
      this.onSelectionChange,
    )
    this.selectionElement?.removeEventListener('keyup', this.onSelectionChange)
  }

  onSelectionChange() {}

  calculateElementRect(element: Element) {
    if (!this.scrollElement) {
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      }
    }
    return calculateRectLayout(
      this.scrollElement?.getBoundingClientRect(),
      element.getBoundingClientRect(),
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
   * 选中某个选区
   * @param selection
   */
  selectRectBySelection(selection: IGoogleDocSelection) {
    const { rects } = selection
    const first = rects[0]
    const last = rects[rects.length - 1]

    const mouseEvents = [
      // 先点击一次取消选区，防止在原位上直接点击拖拽的话会变成拖拽选区
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: first.x,
        clientY: first.y,
      }),
      new MouseEvent('mouseup', {
        bubbles: true,
        clientX: first.x,
        clientY: first.y,
      }),
      // 模拟点击选择操作
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: first.x,
        clientY: first.y,
      }),
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: last.x + last.width,
        clientY: last.y + last.height,
      }),
      new MouseEvent('mouseup', {
        bubbles: true,
        clientX: last.x + last.width,
        clientY: last.y + last.height,
      }),
    ]

    mouseEvents.forEach((event) => this.editorElement?.dispatchEvent(event))
  }

  getTextFromTextElement(element: Element): IGoogleDocText {
    const content = element.getAttribute('aria-label') || ''
    const css = element.getAttribute('data-font-css') || ''
    const [fontWeight, fontSize, fontFamily] = css.split(' ')
    const rect = this.calculateElementRect(element)
    return {
      element,
      content,
      rect,
      style: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        fontWeight,
        fontSize,
        fontFamily,
      },
    }
  }

  getTextsFromParagraphElement(element: Element): IGoogleDocText[] {
    return Array.from(element.querySelectorAll('rect'))
      .filter((item) => item.parentElement?.tagName !== 'clipPath')
      .map((item) => this.getTextFromTextElement(item))
  }

  /**
   * 获取当前选区
   */
  getCurrentSelection(): IGoogleDocSelection {
    if (
      !this.selectionElement ||
      !this.annotateElement ||
      !this.scrollElement
    ) {
      return { paragraphs: [], rects: [] }
    }

    // 找selection下的所有选择框
    const rects = Array.from(this.selectionElement.querySelectorAll('rect'))
      .filter(
        (item) =>
          item.parentElement?.tagName !== 'clipPath' &&
          ['rgba(118,167,250,0.5)', 'rgba(0,0,0,0.15)'].includes(
            item.getAttribute('fill') || '',
          ),
      )
      .map((item) => this.calculateElementRect(item))

    // 找画布下处于选择框内的段落和文字
    const paragraphs = Array.from(
      this.annotateElement.querySelectorAll('g[role="paragraph"]'),
    )
      .filter((item) =>
        rects.some((rect) =>
          isRectIntersect(rect, this.calculateElementRect(item)),
        ),
      )
      .map((item) => {
        const rect = this.calculateElementRect(item)
        return {
          element: item,
          rect,
          texts: this.getTextsFromParagraphElement(item),
          style: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        }
      })
    log.info('getCurrentSelection', { paragraphs, rects })
    return { rects, paragraphs }
  }

  /**
   * 获取选取内的文字
   * @param selection
   */
  getTextsFromSelection(selection: IGoogleDocSelection): IGoogleDocText[] {
    if (!this.annotateElement) {
      return []
    }
    const { paragraphs, rects } = selection
    const texts = paragraphs.flatMap((paragraph) =>
      paragraph.texts.filter((text) =>
        rects.some((br) =>
          isRectIntersect(br, text.element.getBoundingClientRect()),
        ),
      ),
    )
    log.info('getRectsFromSelection', texts)
    return texts
  }
}
