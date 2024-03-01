import debounce from 'lodash-es/debounce'
import throttle from 'lodash-es/throttle'

import { requestIdleCallbackPolyfill } from '@/features/common/utils/polyfills'
import {
  MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT,
  MAXAI_TRANSLATE_CUSTOM_ELEMENT,
  MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT,
} from '@/features/pageTranslator/constants'
import TranslateService from '@/features/pageTranslator/core/TranslateService'
import TranslateTextItem from '@/features/pageTranslator/core/TranslateTextItem'
import {
  findBlockParentElement,
  findParentElementWithTextNode,
  isBlockElement,
  isNotToTranslateText,
  isTranslationValidElement,
} from '@/features/pageTranslator/utils'

class PageTranslator {
  textNodesSet: Set<Node>
  translateItemsSet: Set<TranslateTextItem>
  translator: TranslateService
  loading: boolean
  isEnable: boolean

  fromCode?: string
  toCode?: string

  // 用于监听 document 动态变化
  mutationsObserver: MutationObserver | null = null

  _fetching: boolean
  onFetchingChange?: (loading: boolean) => void

  constructor(fromCode?: string, toCode?: string) {
    this.textNodesSet = new Set()
    this.translateItemsSet = new Set()
    this.translator = new TranslateService()
    this.isEnable = false
    this.loading = false
    this.fromCode = fromCode ?? ''
    this.toCode = toCode ?? 'en'

    this._fetching = false
    this.onFetchingChange = () => {}

    this.startEventListener()

    // const mutations = new MutationObserver((mutations) => {
  }

  get fetching() {
    return this._fetching
  }

  set fetching(value: boolean) {
    this._fetching = value
    if (this.onFetchingChange && this.isEnable) {
      this.onFetchingChange(value)
    }
  }

  setOnFetchingChange(onFetchingChange: (loading: boolean) => void) {
    this.onFetchingChange = onFetchingChange
  }

  updateFromCode(newFromCode: string) {
    this.fromCode = newFromCode
  }
  updateToCode(newToCode: string) {
    this.toCode = newToCode
  }

  findSameTranslateItem(element: HTMLElement) {
    const translateItemsSet = this.translateItemsSet
    for (const translateItem of translateItemsSet) {
      if (translateItem.rawElement === element) {
        return translateItem
      }
    }

    return null
  }

  startPageTranslator() {
    this.injectStyle()
    this.showTranslateElements()

    if (!this.isEnable) {
      return
    }

    const treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      (node) => {
        if (this.textNodesSet.has(node)) {
          return NodeFilter.FILTER_REJECT
        }

        const parentElement = node.parentElement
        if (
          !(node.nodeValue || '').trim() ||
          !parentElement ||
          parentElement.closest(MAXAI_TRANSLATE_CUSTOM_ELEMENT)
        ) {
          return NodeFilter.FILTER_REJECT
        }

        return NodeFilter.FILTER_ACCEPT
      },
    )

    let treeWalkerIsDone = false
    // translate item 的容器中所有的 textNode
    let prepareTranslateTextNodes: Node[] = []
    // translate item 的容器元素
    let prepareTranslateContainer: HTMLElement | null = null
    const loopTreeWorker = () => {
      requestIdleCallbackPolyfill((deadline) => {
        let timeRemain = deadline.timeRemaining()
        for (let i = 0; timeRemain > 0; timeRemain -= performance.now() - i) {
          i = performance.now()
          const currentTextNode = treeWalker.nextNode()

          // treeWalker.nextNode() 结束时 doTranslate
          if (!currentTextNode) {
            if (prepareTranslateTextNodes.length && prepareTranslateContainer) {
              this.newPageTranslateItem(
                prepareTranslateTextNodes,
                prepareTranslateContainer,
              )
            }

            treeWalkerIsDone = true
            setTimeout(() => {
              const doTranslateDebounce = debounce(this.doTranslate, 100)
              doTranslateDebounce.call(this)
            }, 500)
            return
          }

          const containerElement = findBlockParentElement(currentTextNode)

          if (
            containerElement &&
            containerElement.querySelector(MAXAI_TRANSLATE_CUSTOM_ELEMENT)
          ) {
            continue
          }

          if (
            !containerElement ||
            !isTranslationValidElement(currentTextNode.parentElement)
          ) {
            continue
          }

          if (!prepareTranslateContainer) {
            prepareTranslateContainer = containerElement
          }

          const parentElement = findParentElementWithTextNode(currentTextNode)
          const previousElement = parentElement
            ? parentElement.previousElementSibling
            : currentTextNode.previousSibling

          // 判断是否是新的一行，新的一行需要新建一个 translateItem
          let isNewLine = false

          if (previousElement) {
            isNewLine =
              previousElement.nodeName === 'BR' ||
              previousElement.nodeName === 'LI' ||
              ('tagName' in previousElement
                ? isBlockElement(previousElement)
                : false)
          }

          if (prepareTranslateContainer !== containerElement || isNewLine) {
            this.newPageTranslateItem(
              prepareTranslateTextNodes,
              prepareTranslateContainer,
            )
            prepareTranslateContainer = containerElement
            prepareTranslateTextNodes = [currentTextNode]
          } else {
            prepareTranslateTextNodes.push(currentTextNode)
          }
        }

        if (timeRemain <= 0 && !treeWalkerIsDone) {
          loopTreeWorker()
        }
      })
    }

    loopTreeWorker()
  }

  newPageTranslateItem(textNodes: Node[], containerElement: HTMLElement) {
    textNodes.forEach((textNode) => {
      this.textNodesSet.add(textNode)
    })

    const allText = textNodes
      .map((node) => node.textContent || '')
      .join('')
      .trim()

    if (isNotToTranslateText(allText)) {
      return
    }

    const translateItem = new TranslateTextItem(textNodes, containerElement)
    this.translateItemsSet.add(translateItem)
    console.log(`zztest this.translateItemsSet`, this.translateItemsSet)
  }

  async doTranslate() {
    if (this.fetching) {
      return
    }
    const needTranslateItems: TranslateTextItem[] = []

    this.translateItemsSet.forEach((translateItem) => {
      if (
        !translateItem.isTranslated &&
        translateItem.isIntersecting &&
        translateItem.translateStatus !== 'fetching'
      ) {
        needTranslateItems.push(translateItem)
      }
    })

    if (needTranslateItems.length > 0) {
      this.fetching = true
      await this.translator.translate(
        needTranslateItems,
        this.toCode,
        this.fromCode,
      )
      this.fetching = false
    }
  }

  startEventListener() {
    const doTranslateDebounce = debounce(this.doTranslate, 100).bind(this)
    window.addEventListener(
      'MAXAI_PageTranslatorEvent_doTranslate',
      doTranslateDebounce,
    )
    window.addEventListener('beforeunload', () => {
      window.removeEventListener(
        'MAXAI_PageTranslatorEvent_doTranslate',
        doTranslateDebounce,
      )
    })
  }

  injectStyle() {
    const styleId = 'maxai-translate-style'
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.innerHTML = `
      @keyframes maxai-trans-spin {
        to {transform: rotate(360deg);}
      }
      ${MAXAI_TRANSLATE_CUSTOM_ELEMENT}.maxai-trans-hide {
        display: none !important;
      }
      ${MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT} {
        display: inline-block;
        margin: 4px 0;
      }

      ${MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT}.retry,
      ${MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT}.retry {
        white-space: normal;
        margin: 0;
      }

      .maxai-trans-icon {
        display: inline !important;
        border: none !important;
        background: transparent !important;
        color: #9065B0 !important;
        vertical-align: middle !important;
        fill: none !important;
        stroke: none !important;
      }
      .maxai-trans-inline {
        margin-inline-start: 4px !important;        
      }
      .maxai-trans-loading {
        animation: maxai-trans-spin 1s linear infinite !important;
      }
      .maxai-trans-refresh {
        cursor: pointer;
      }
    `
    document.head.appendChild(style)
  }

  hideTranslateElements() {
    this.isEnable = false

    this.translateItemsSet.forEach((translateItem) => {
      translateItem.translateContainerElement?.classList.add('maxai-trans-hide')
    })

    this.closeMutationsObserver()
  }

  showTranslateElements() {
    this.isEnable = true

    this.translateItemsSet.forEach((translateItem) => {
      translateItem.translateContainerElement?.classList.remove(
        'maxai-trans-hide',
      )
    })

    this.startMutationsObserver()
  }

  closeMutationsObserver() {
    if (this.mutationsObserver) {
      this.mutationsObserver.disconnect()
      this.mutationsObserver = null
    }
  }

  startMutationsObserver() {
    if (this.mutationsObserver) {
      return
    }
    this.mutationsObserver = new MutationObserver(
      throttle(this.startPageTranslator, 300).bind(this),
    )
    this.mutationsObserver.observe(document, {
      attributes: false,
      childList: true,
      characterData: true,
      subtree: true,
    })
  }

  toggle(enable: boolean) {
    if (enable) {
      this.startPageTranslator()
    } else {
      this.hideTranslateElements()
    }
  }

  retranslate() {
    // remove all translateItems
    this.translateItemsSet.forEach((translateItem) => {
      translateItem.translateContainerElement?.remove()
    })

    this.translateItemsSet.clear()
    this.textNodesSet.clear()
    this.startPageTranslator()
  }
}

export default new PageTranslator()
