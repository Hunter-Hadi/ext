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
  findContentEditableParent,
  findParentElementWithTextNode,
  isBlockElement,
  isNotToTranslateText,
  isTranslationValidElement,
} from '@/features/pageTranslator/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

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
                ? isBlockElement(previousElement as HTMLElement)
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

    if (findContentEditableParent(containerElement)) {
      return
    }

    const translateItem = new TranslateTextItem(textNodes, containerElement)
    this.translateItemsSet.add(translateItem)
  }

  async doTranslate(retryTranslateItem: TranslateTextItem[] = []) {
    if (this.fetching) {
      return
    }
    const needTranslateItems: TranslateTextItem[] = [...retryTranslateItem]

    this.translateItemsSet.forEach((translateItem) => {
      if (
        !translateItem.isTranslated &&
        translateItem.isIntersecting &&
        translateItem.translateStatus === 'idle'
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

  async retryTranslate() {
    const needTranslateItems: TranslateTextItem[] = []

    this.translateItemsSet.forEach((translateItem) => {
      if (
        !translateItem.isTranslated &&
        translateItem.isIntersecting &&
        translateItem.translateStatus === 'error'
      ) {
        needTranslateItems.push(translateItem)
      }
    })

    this.doTranslate(needTranslateItems)
  }

  startEventListener() {
    const doTranslateDebounce = debounce(this.doTranslate, 500).bind(this)
    const retryTranslateDebounce = debounce(this.retryTranslate, 500).bind(this)

    const messageHandler = {
      MAXAI_PageTranslatorEvent_doTranslate: () => {
        doTranslateDebounce()
      },
      MAXAI_PageTranslatorEvent_retryTranslate: () => {
        retryTranslateDebounce()
      },
    }

    window.addEventListener(
      'MAXAI_PageTranslatorEvent_doTranslate',
      messageHandler['MAXAI_PageTranslatorEvent_doTranslate'],
    )
    window.addEventListener(
      'MAXAI_PageTranslatorEvent_retryTranslate',
      messageHandler['MAXAI_PageTranslatorEvent_retryTranslate'],
    )
    window.addEventListener('beforeunload', () => {
      window.removeEventListener(
        'MAXAI_PageTranslatorEvent_doTranslate',
        messageHandler['MAXAI_PageTranslatorEvent_doTranslate'],
      )
      window.removeEventListener(
        'MAXAI_PageTranslatorEvent_retryTranslate',
        messageHandler['MAXAI_PageTranslatorEvent_retryTranslate'],
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
        display: inline;
        margin: 4px 0;
        background-image: linear-gradient(to right, #94a3b8 30%, rgba(255, 255, 255, 0) 0%);
        background-position: bottom;
        background-size: 5px 1px;
        background-repeat: repeat-x;
        padding-bottom: 3px;
      }
      ${MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT} {
        background-image: linear-gradient(to right, #94a3b8 30%, rgba(255, 255, 255, 0) 0%);
        background-position: bottom;
        background-size: 5px 1px;
        background-repeat: repeat-x;
        padding-bottom: 3px;
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

    // 这里针对不同网站做下兼容处理，比如某些网站下设定了固定高度导致无法显示出完整的翻译
    const host = getCurrentDomainHost()
    if (host === 'tiktok.com') {
      style.innerHTML += `
      body.maxai-trans-show [data-e2e="user-post-item-list"] [data-e2e="user-post-item-desc"] {
        height: auto;
      }
      `
    } else if (host === 'larksuite.com') {
      style.innerHTML += `
      body.maxai-trans-show .catalogue-container .catalogue__list-item {
        height: auto!important;
      }
      body.maxai-trans-show .catalogue-container .catalogue__list-item ${MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT} {
        margin-left: 16px;
      }
      `
    }

    document.head.appendChild(style)
  }

  hideTranslateElements() {
    this.isEnable = false

    document.body.classList.remove('maxai-trans-show')

    this.translateItemsSet.forEach((translateItem) => {
      translateItem.translateContainerElement?.classList.add('maxai-trans-hide')
    })

    this.closeMutationsObserver()
  }

  showTranslateElements() {
    this.isEnable = true

    document.body.classList.add('maxai-trans-show')

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
