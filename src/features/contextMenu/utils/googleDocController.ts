import { debounce } from 'lodash-es'

import { IRangyRect } from '@/features/contextMenu/types'
import {
  calculateRectLayout,
  emptyRect,
  isPointInRects,
  isRectChange,
  isRectIntersect,
} from '@/features/contextMenu/utils'
import { EventEmitter } from '@/utils/eventEmitter'
import Log from '@/utils/Log'

const log = new Log('ContextMenu/GoogleDocHelper')

export enum IGoogleDocEventType {
  SELECTION_CHANGE = 'selection-change',
  CARET_CHANGE = 'caret-change',
  MOUSEUP = 'mouseup',
  KEYUP = 'keyup',
  FOCUS = 'focus',
  BLUR = 'blur',
  SCROLL = 'scroll'
}

export interface IGoogleDocRect extends IRangyRect {}

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
  content: string
}

export interface IGoogleDocCaret {
  element: Element
  rect: IGoogleDocRect
  layout: IGoogleDocLayout
  // text: IGoogleDocText | null
  // offset: number
}

export class GoogleDocController extends EventEmitter {
  disabled = false

  editable = true

  initialized = false

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

  observer: MutationObserver | null = null

  debounceCaretOrSelectionChange = debounce(() => {
    this.checkCaretChange()
    this.checkSelectionChange()
  }, 20)

  constructor() {
    super()
    this.disabled = !location.href.startsWith(
      'https://docs.google.com/document',
    )
    this.editable = !!document.querySelector('#docs-insert-menu')
  }

  init() {
    if (this.disabled) return
    if (this.initialized) return
    this.initElement()
    this.initListener()
  }

  initElement() {
    this.editorElement = document.querySelector('div.kix-appview-editor')
    this.scrollElement = document.querySelector(
      'div.kix-scrollareadocumentplugin',
    )
    this.iframeElement = document.querySelector(
      'iframe.docs-texteventtarget-iframe',
    )
    this.inputElement = this.iframeElement?.contentDocument?.querySelector(
      'div[contenteditable="true"]',
    )
    this.caretElement = document.querySelector('#kix-current-user-cursor-caret')
  }

  _onScroll = (event: Event) => {
    log.info('onScroll')
    this.emit(IGoogleDocEventType.SCROLL, event)
  }

  _onMouseUp = (event: MouseEvent) => {
    log.info('onMouseUp')
    // 标记过滤useInitRang.ts里saveHighlightedRangeAndShowContextMenu的处理
    ;(event as any).MAX_AI_IGNORE = true
    this.emit(IGoogleDocEventType.MOUSEUP, event)
  }

  onKeyUp = (event: KeyboardEvent) => {
    log.info('onKeyUp')
    // 标记过滤useInitRang.ts里saveHighlightedRangeAndShowContextMenu的处理
    ;(event as any).MAX_AI_IGNORE = true
    this.emit(IGoogleDocEventType.KEYUP, event)
  }

  _onFocus = (event: FocusEvent) => {
    log.info('onFocus')
    this.emit(IGoogleDocEventType.FOCUS, event)
  }

  _onBlur = (event: FocusEvent) => {
    log.info('onBlur')
    this.emit(IGoogleDocEventType.BLUR, event)
  }

  initListener() {
    // const contentElement = document.querySelector(
    //   '.kix-rotatingtilemanager-content',
    // )
    const cursorElement = document.querySelector('div.kix-cursor')
    this.observer = new MutationObserver((mutations) => {
      if (
        mutations.some((item) =>
          (item.target as HTMLElement).classList?.contains('kix-cursor'),
        )
      ) {
        log.info('光标移动')
        this.debounceCaretOrSelectionChange()
      }
      // if (
      //   mutations.find((item) =>
      //     item.target.parentElement?.classList.contains(
      //       'kix-canvas-tile-selection',
      //     ),
      //   )
      // ) {
      //   log.info('选区变化')
      //   this.debounceCaretOrSelectionChange()
      // }
    })
    // if (contentElement) {
    //   this.observer.observe(contentElement, {
    //     attributes: false,
    //     childList: true,
    //     characterData: true,
    //     subtree: true,
    //   })
    // }
    if (cursorElement) {
      this.observer.observe(cursorElement, {
        attributes: true,
        attributeFilter: ['style'],
        childList: false,
        characterData: false,
        subtree: false,
      })
    }
    this.editorElement?.addEventListener('scroll', this._onScroll)
    this.editorElement?.addEventListener('mouseup', this._onMouseUp)
    this.inputElement?.addEventListener('keyup', this.onKeyUp)
    this.inputElement?.addEventListener('focus', this._onFocus)
    this.inputElement?.addEventListener('blur', this._onBlur)
  }

  destroy() {
    this.initialized = false
    this.observer?.disconnect()
    this.editorElement?.addEventListener('scroll', this._onScroll)
    this.editorElement?.removeEventListener('mouseup', this._onMouseUp)
    this.inputElement?.removeEventListener('keyup', this.onKeyUp)
    this.inputElement?.removeEventListener('focus', this._onFocus)
    this.inputElement?.removeEventListener('blur', this._onBlur)
    this.removeAllListeners()
  }

  /**
   * 判断两个选区位置是否有变化
   * @param selection1
   * @param selection2
   */
  isSelectionChange(
    selection1: IGoogleDocSelection | null,
    selection2: IGoogleDocSelection | null,
  ) {
    if (selection1 === selection2) return false
    if (selection1 && selection2) {
      if (
        selection1.layouts.length === selection2.layouts.length &&
        selection1.layouts.every(
          (item, i) => !isRectChange(item, selection2.layouts[i]),
        )
      ) {
        return false
      }
    }
    return true
  }

  /**
   * 判断两个光标位置是否有变化
   * @param caret1
   * @param caret2
   */
  isCaretChange(
    caret1: IGoogleDocCaret | null,
    caret2: IGoogleDocCaret | null,
  ) {
    if (caret1 === caret2) return false
    if (caret1 && caret2 && !isRectChange(caret1.layout, caret2.layout)) {
      return
    }
    return true
  }

  /**
   * 是否获取焦点
   */
  isFocus() {
    return document.activeElement === this.iframeElement
  }

  /**
   * 检测当前选区变化
   */
  checkSelectionChange() {
    const selection = this.getCurrentSelection()
    if (this.isSelectionChange(selection, this.lastSelection)) {
      this.lastSelection = selection
      this.emit(IGoogleDocEventType.SELECTION_CHANGE, this.lastSelection)
    }
  }

  /**
   * 检测当前光标变化
   */
  checkCaretChange() {
    const caret = this.getCurrentCaret()
    if (this.isCaretChange(caret, this.lastCaret)) {
      this.lastCaret = caret
      this.emit(IGoogleDocEventType.CARET_CHANGE, this.lastCaret)
    }
  }

  /**
   * 计算相对于scrollElement的位置
   * @param rect
   */
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
    log.info(value)

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
   * 选区下方插入内容
   * @param value
   */
  insertBelowSelection(value: string) {
    log.info(value)

    this.inputElement?.focus()
    if (this.lastSelection) {
      const keyData = {
        code: 'ArrowRight',
        key: 'ArrowRight',
        keyCode: 39,
        bubbles: true,
        repeat: false,
      }
      this.inputElement?.dispatchEvent(new KeyboardEvent('keydown', keyData))
    }
    this.replaceSelection(`\n${value}`)
  }

  /**
   * 选区上方插入内容
   * @param value
   */
  insertAboveSelection(value: string) {
    log.info(value)

    this.inputElement?.focus()
    if (this.lastSelection) {
      const keyData = {
        charCode: 0,
        code: 'ArrowLeft',
        key: 'ArrowLeft',
        keyCode: 37,
        bubbles: true,
        repeat: false,
      }
      this.inputElement?.dispatchEvent(new KeyboardEvent('keydown', keyData))
    }
    this.replaceSelection(`${value}\n`)
  }

  /**
   * 拷贝当前选区内容
   * @param command
   */
  copySelection(command = false) {
    log.info(command)

    this.inputElement?.focus()
    if (command) {
      this.iframeElement?.contentDocument?.execCommand('copy')
    } else {
      this.inputElement?.dispatchEvent(
        new ClipboardEvent('copy', {
          bubbles: true,
          cancelable: true,
        }),
      )
    }
    const content = this.inputElement?.innerText || ''
    if (content.endsWith('\n')) {
      // inputElement里总是在最后会加入一个br换行符
      return content.slice(0, -1)
    }
    return content;
  }

  /**
   * 选择当前光标附近的内容
   * @param length 负数为选择之前 正数为选择之后
   */
  selectContent(length: number) {
    if (!this.editorElement || !this.inputElement) return
    const key = length < 0 ? 'ArrowLeft' : 'ArrowRight'
    const keyCode = length < 0 ? 37 : 39
    this.inputElement.focus()
    for (let i = 0; i < Math.abs(length); i++) {
      this.inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          charCode: 0,
          code: key,
          key,
          keyCode,
          bubbles: true,
          repeat: false,
          shiftKey: true,
        }),
      )
    }
  }

  /**
   * 获取当前光标之前的所有内容
   * @param caret
   */
  getCaretBeforeContent(caret: IGoogleDocCaret) {
    if (!this.editorElement || !this.inputElement) return ''
    const x = caret.rect.left + caret.rect.width / 2
    const y = caret.rect.top + caret.rect.height / 2

    let content = ''

    // 查找所有段落
    this.getParagraphElements()
      .sort(
        (a, b) =>
          a.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom,
      )
      .some((paragraphEle) => {
        let paragraphContent = ''

        let lastText: IGoogleDocText | null = null

        this.getTextElements(paragraphEle).some((textEle) => {
          const text = this.parseTextElement(textEle)
          if (
            text.rect.bottom < y || // 位于光标上方
            (text.rect.top < y && text.rect.right < x) // 同行位于光标左侧
          ) {
            if (lastText && text.rect.top >= lastText.rect.bottom) {
              // 同段落文字换行
              paragraphContent += `\n${text.content}`
            } else {
              // 同一行文字
              paragraphContent += text.content
            }
            lastText = text
          } else if (isPointInRects(x, y, [text.rect])) {
            // 光标位于当前文本内
            const offset = this.getCaretOffset(text, caret.rect)
            if (offset > 0) {
              const content = text.content.slice(0, offset)
              paragraphContent += content
            }
            return true
          }
        })
        if (paragraphContent) {
          if (!content) {
            content = paragraphContent
          } else {
            content += `\n\n${paragraphContent}`
          }
        }
        return paragraphEle.getBoundingClientRect().bottom > y
      })

    return content
  }

  /**
   * 选中某个选区
   * @param selection
   */
  async selectSelection(selection: IGoogleDocSelection): Promise<void> {
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
      return this.selectSelection(selection)
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

  /**
   * 获取当前选区
   */
  getCurrentSelection(): IGoogleDocSelection | null {
    if (!this.editorElement) return null

    // 找selection下的所有选择框
    const layouts: IGoogleDocRect[] = []
    const rects: IGoogleDocRect[] = []
    const elements = this.getSelectionElements()
    elements.forEach((item) => {
      const rect = item.getBoundingClientRect().toJSON()
      layouts.push(this.calculateRelativeLayout(rect))
      rects.push(rect)
    })

    if (!elements.length) return null

    // 找画布下处于选择框内的段落和文字
    const paragraphs = this.getParagraphElements()
      .filter((item) =>
        rects.some((rect) =>
          isRectIntersect(rect, item.getBoundingClientRect()),
        ),
      )
      .map((item) => this.parseParagraphElement(item))

    const content = this.copySelection()

    log.info({ paragraphs, rects, layouts, content })

    return { elements, rects, paragraphs, layouts, content }
  }

  /**
   * 获取当前光标
   */
  getCurrentCaret(): IGoogleDocCaret | null {
    if (!this.editorElement || !this.caretElement) return null

    const element = this.caretElement
    const rect = this.caretElement.getBoundingClientRect()
    const layout = this.calculateRelativeLayout(rect)
    // const { left, top, width, height } = rect
    // const x = left + width / 2
    // const y = top + height / 2
    // const textElement = this.getTextElementFromPoint(x, y)
    // const text =
    //   textElement && textElement.tagName === 'rect'
    //     ? this.parseTextElement(textElement)
    //     : null

    log.info({ element, rect, layout })

    return {
      element,
      rect,
      layout,
      // text,
    }
  }

  /**
   * 获取光标位于当前文本节点的位置
   * @param text
   * @param caretRect
   */
  getCaretOffset(text: IGoogleDocText, caretRect: IGoogleDocRect) {
    const { left, top, width, height } = caretRect
    const x = left + width / 2
    const y = top + height / 2
    if (x < text.rect.left || y < text.rect.top) {
      return 0
    }
    if (x > text.rect.right || y > text.rect.bottom) {
      return text.content.length
    }

    const { element, content } = text
    const contentNode = document.createTextNode(content)
    const textOverlay = this.createTextOverlay(element, contentNode)

    if (!textOverlay) return 0

    const { width: textWidth, left: textLeft } =
      textOverlay.getBoundingClientRect()
    const range = document.createRange()
    const length = contentNode.nodeValue?.length || 0
    const charWidth = textWidth / length

    const selectionRects: Record<string, DOMRect> = {}

    // 先计算光标在平均宽度的下标位置，减少循环次数
    let offset = Math.floor((x - textLeft) / charWidth)

    // 计算光标的位置，去计算当前获取的文本区域内容的位置
    // 假设文本内容为'123'，如果光标位于'2''3'之间很难计算准确
    // 所以计算位置以上一次选择的宽度，比如'12'的宽度加上'3'宽度的一半去对比计算
    while (offset <= length) {
      range.setStart(contentNode, 0)
      range.setEnd(contentNode, offset)
      const rect = range.getClientRects()[0].toJSON()
      const last = selectionRects[offset - 1]
      const currentRight = last
        ? last.right + (rect.right - last.right) / 2
        : rect.left + rect.width

      if (x < currentRight) {
        if (last) {
          offset = Math.max(offset - 1, 0)
          break
        } else {
          offset--
          continue
        }
      }

      selectionRects[offset] = rect
      offset++
    }

    textOverlay.remove()
    return offset
  }

  /**
   * 构造IGoogleDocText
   * @param element
   */
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

  /**
   * 构造IGoogleDocParagraph
   * @param element
   */
  parseParagraphElement(element: Element): IGoogleDocParagraph {
    const rect = element.getBoundingClientRect().toJSON()
    const layout = this.calculateRelativeLayout(rect)
    const texts = this.getTextElements(element).map((item) =>
      this.parseTextElement(item),
    )
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
   * 获取当前画布下的注释选区元素
   */
  getSelectionElements() {
    if (!this.editorElement) return []
    return Array.from(
      this.editorElement.querySelectorAll('.kix-canvas-tile-selection rect'),
    ).filter(
      (item) =>
        item.parentElement?.tagName !== 'clipPath' &&
        ['rgba(118,167,250,0.5)', 'rgba(0,0,0,0.15)'].includes(
          item.getAttribute('fill') || '',
        ),
    )
  }

  /**
   * 获取当前画布下的注释段落元素
   */
  getParagraphElements() {
    if (!this.editorElement) return []
    return Array.from(
      this.editorElement.querySelectorAll(
        'canvas ~ .kix-canvas-tile-content:not(.kix-canvas-tile-selection) g[role="paragraph"]',
      ),
    )
  }

  /**
   * 获取当前画布/段落下的注释文本元素
   * @param paragraphElement
   */
  getTextElements(paragraphElement?: Element): Element[] {
    if (paragraphElement) {
      return Array.from(paragraphElement.querySelectorAll('rect')).filter(
        (item) => item.parentElement?.tagName !== 'clipPath',
      )
    }
    if (!this.editorElement) return []
    return Array.from(
      this.editorElement.querySelectorAll(
        'canvas ~ .kix-canvas-tile-content:not(.kix-canvas-tile-selection) g[role="paragraph"] rect',
      ),
    ).filter((item) => item.parentElement?.tagName !== 'clipPath')
  }

  /**
   * 根据坐标获取当前的注释文本元素
   * @param x
   * @param y
   */
  getTextElementFromPoint(x: number, y: number) {
    const paragraphElement = this.getParagraphElements().find((item) =>
      isPointInRects(x, y, [item.getBoundingClientRect()]),
    )
    if (!paragraphElement) return null
    return this.getTextElements(paragraphElement).find((item) =>
      isPointInRects(x, y, [item.getBoundingClientRect()]),
    )
  }

  /**
   * 根据坐标获取当前元素
   * @deprecated 此方法不再使用，如果元素上方有其他元素遮挡没法获取
   * @param x
   * @param y
   */
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

  /**
   * 创建一个注释文本元素的dom节点，利用document.createRange去计算光标位置
   * @param element
   * @param textNode
   */
  createTextOverlay(element: Element, textNode: any) {
    if (!element || element.tagName !== 'rect') return null

    const textOverlay = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text',
    )
    const transform = element.getAttribute('transform') || ''
    const font = element.getAttribute('data-font-css') || ''

    textOverlay.setAttribute('x', element.getAttribute('x') || '')
    textOverlay.setAttribute('y', element.getAttribute('y') || '')
    textOverlay.appendChild(textNode)
    textOverlay.style.setProperty('all', 'initial', 'important')
    textOverlay.style.setProperty('transform', transform, 'important')
    textOverlay.style.setProperty('font', font, 'important')
    textOverlay.style.setProperty('text-anchor', 'start', 'important')
    element.parentNode?.appendChild(textOverlay)

    const elementRect = element.getBoundingClientRect()
    const textRect = textOverlay.getBoundingClientRect()
    const yOffset =
      (elementRect.top -
        textRect.top +
        (elementRect.bottom - textRect.bottom)) *
      0.5
    textOverlay.style.setProperty(
      'transform',
      `translate(0px,${yOffset}px) ${transform}`,
      'important',
    )

    return textOverlay
  }
}
