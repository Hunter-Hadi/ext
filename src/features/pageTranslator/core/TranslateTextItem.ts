import {
  MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT,
  MAXAI_TRANSLATE_CUSTOM_ELEMENT,
  MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT,
} from '@/features/pageTranslator/constants'

type ITranslateStatus = 'idle' | 'fetching' | 'success' | 'error'

/**
 * 监听 ELement 节点，通过 IntersectionObserverEntry 来判断元素是否进入 可视窗口
 * 当进入可视窗口时，进行翻译
 */
class TranslateTextItem {
  // uid: string
  rawText: string
  rawElement: HTMLElement

  textNodes: Node[]

  isTranslated: boolean
  translatedText: string

  translatedLangCode: string
  originalLangCode: string

  observer: IntersectionObserver | null

  isIntersecting: boolean

  translateContainerElement: HTMLElement | null
  translateInnerElement: HTMLElement | null

  translateStatus: ITranslateStatus

  isInline: boolean

  constructor(textNode: Node[], element: HTMLElement) {
    // this.uid = uuidV4()
    this.rawElement = element
    this.rawText = element.innerText || ''
    this.textNodes = textNode
    this.translatedLangCode = ''
    this.originalLangCode = ''
    this.translatedText = ''
    this.isTranslated = false
    this.observer = null
    this.isIntersecting = false

    this.translateStatus = 'idle'

    this.translateContainerElement = null
    this.translateInnerElement = null

    this.isInline = false

    this.observeIntersection()
    this.insertCustomElement()
  }

  observeIntersection() {
    if (!this.observer) {
      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // 因为只监听一个元素，所以只有一个 entry
        const element = entries[0]
        this.isIntersecting = element.isIntersecting
        if (this.isIntersecting) {
          window.dispatchEvent(
            new CustomEvent('MAXAI_PageTranslatorEvent_doTranslate'),
          )
        }
      }

      this.observer = new IntersectionObserver(observerCallback, {
        threshold: 0.1,
      })

      if (this.rawElement) {
        this.observer.observe(this.rawElement)
      }
    }
  }

  disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  insertCustomElement() {
    if (this.rawElement) {
      let isInline = false

      const rawText = this.rawText.trim()

      const { display } = getComputedStyle(this.rawElement)
      if (display.includes('inline')) {
        isInline = true
      }

      if (rawText.length <= 25 || rawText.split(' ').length <= 4) {
        isInline = true
      }

      const isUnicodeText = rawText.match(/\p{Unified_Ideograph}/gu)
      if (isUnicodeText) {
        isInline = rawText.length <= 7
      }

      this.isInline = isInline

      const customElement = document.createElement(
        MAXAI_TRANSLATE_CUSTOM_ELEMENT,
      )
      const inlineElement = document.createElement(
        isInline
          ? MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT
          : MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT,
      )

      inlineElement.classList.add('notranslate')
      customElement.appendChild(inlineElement)
      this.translateContainerElement = customElement
      this.translateInnerElement = inlineElement

      const textNode = this.textNodes[this.textNodes.length - 1]
      if (this.textNodes.length === 1) {
        textNode.parentElement?.insertBefore(
          customElement,
          textNode.nextSibling,
        )
      } else {
        this.rawElement.appendChild(customElement)
      }
    }
  }

  updateFetchStatus(status: ITranslateStatus) {
    this.translateStatus = status

    // 更新状态前把 click 事件清空
    this.translateInnerElement?.removeEventListener(
      'click',
      this.handleInlineElementClick,
    )

    if (status === 'fetching') {
      this.renderLoadingStatus()
    }

    if (status === 'success') {
      this.renderTranslatedText()
      this.disconnectObserver()
    }

    if (status === 'error') {
      this.renderErrorStatus()
    }
  }

  renderTranslatedText() {
    if (
      this.translatedText &&
      this.isTranslated &&
      this.translateInnerElement
    ) {
      this.translateInnerElement.removeAttribute('title')
      this.translateInnerElement.innerText = this.translatedText
      // 清空 class
      this.translateInnerElement.className = ''

      if (this.isInline) {
        // inline 元素需要添加 class
        this.translateInnerElement.classList.add('maxai-trans-inline')
      } else {
        // block 元素需要添加 br
        const hasBr = this.translateContainerElement?.querySelector('br')
        if (!hasBr) {
          const br = document.createElement('br')
          this.translateContainerElement?.insertBefore(
            br,
            this.translateInnerElement,
          )
        }
      }
    }
  }

  renderLoadingStatus() {
    if (this.translateInnerElement) {
      this.translateInnerElement.innerHTML = `
        <svg class="maxai-trans-inline maxai-trans-icon maxai-trans-loading" style="display: inline;" width="12" height="12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokewidth="4"></circle>
          <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `
      this.translateInnerElement.classList.add('loading')
    }
  }

  renderErrorStatus() {
    if (this.translateInnerElement) {
      this.translateInnerElement.title = 'retry'
      this.translateInnerElement.classList.add('retry')
      this.translateInnerElement.innerHTML = `
        <svg class="maxai-trans-inline maxai-trans-icon maxai-trans-refresh" style="display: inline;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12">
          <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z" fill="currentColor"></path>
        </svg>
      `
      this.translateInnerElement.addEventListener(
        'click',
        this.handleInlineElementClick,
      )
    }
  }

  handleInlineElementClick(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    window.dispatchEvent(
      new CustomEvent('MAXAI_PageTranslatorEvent_doTranslate'),
    )
  }

  reset() {
    this.disconnectObserver()
    this.rawElement.removeChild(this.translateContainerElement as Node)
    this.translateStatus = 'idle'
    this.translatedText = ''
    this.isTranslated = false
    this.isIntersecting = false
    this.translatedLangCode = ''
    this.originalLangCode = ''
  }
}

export default TranslateTextItem
