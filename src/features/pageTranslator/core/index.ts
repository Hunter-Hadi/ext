import debounce from 'lodash-es/debounce'

import { requestIdleCallbackPolyfill } from '@/features/common/utils/polyfills'
import {
  MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT,
  MAXAI_TRANSLATE_CUSTOM_ELEMENT,
  MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT,
} from '@/features/pageTranslator/constants'
import TranslateService from '@/features/pageTranslator/core/TranslateService'
import TranslateTextItem from '@/features/pageTranslator/core/TranslateTextItem'
import { checkValidElement } from '@/features/pageTranslator/utils'

class PageTranslator {
  translateItemsSet: Set<TranslateTextItem>
  translator: TranslateService
  loading: boolean
  isEnable: boolean

  fromCode?: string
  toCode?: string

  // 用于监听 document 动态变化
  mutationsObserver: MutationObserver | null = null

  constructor(fromCode?: string, toCode?: string) {
    this.translateItemsSet = new Set()
    this.translator = new TranslateService()
    this.isEnable = false
    this.loading = false
    this.fromCode = fromCode ?? ''
    this.toCode = toCode ?? 'en'

    this.startEventListener()

    // const mutations = new MutationObserver((mutations) => {
  }

  updateFromCode(newFromCode: string) {
    this.fromCode = newFromCode
  }
  updateToCode(newToCode: string) {
    this.toCode = newToCode
  }

  findSameElement(element: HTMLElement) {
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
        const containerElement = node.parentElement
        if (
          node.nodeValue?.trim() &&
          containerElement &&
          checkValidElement(containerElement) &&
          containerElement.getElementsByTagName(MAXAI_TRANSLATE_CUSTOM_ELEMENT)
            .length <= 0
        ) {
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_REJECT
      },
    )

    let treeWalkerIsDone = false
    const loopTreeWorker = () => {
      requestIdleCallbackPolyfill((deadline) => {
        let timeRemain = deadline.timeRemaining()
        for (let i = 0; timeRemain > 0; timeRemain -= performance.now() - i) {
          i = performance.now()
          const textNode = treeWalker.nextNode()
          const containerElement = textNode?.parentElement

          // treeWalker.nextNode() 结束时 doTranslate
          if (!textNode) {
            treeWalkerIsDone = true
            setTimeout(() => {
              const doTranslateDebounce = debounce(this.doTranslate, 100)
              doTranslateDebounce.call(this)
            }, 500)
            return
          }

          if (textNode && containerElement) {
            const sameElementItem = this.findSameElement(containerElement)

            if (sameElementItem) {
              sameElementItem.reset()
              this.translateItemsSet.delete(sameElementItem)
            }

            if (containerElement.innerText.trim()) {
              const translateTextItem = new TranslateTextItem(containerElement)
              this.translateItemsSet.add(translateTextItem)
            }
          }
        }

        if (timeRemain <= 0 && !treeWalkerIsDone) {
          loopTreeWorker()
        }
      })
    }

    loopTreeWorker()
  }

  async doTranslate() {
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
      console.log(`needTranslateItems`, needTranslateItems)
      await this.translator.translate(
        needTranslateItems,
        this.toCode,
        this.fromCode,
      )
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
      ${MAXAI_TRANSLATE_INLINE_CUSTOM_ELEMENT} {
        display: inline-block;
      }
      ${MAXAI_TRANSLATE_CUSTOM_ELEMENT}.maxai-trans-hide {
        display: none !important;
      }
      ${MAXAI_TRANSLATE_BLOCK_CUSTOM_ELEMENT} {
        display: inline-block;
        margin: 4px 0;
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

  cleanTranslateElements() {
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
      debounce(this.startPageTranslator, 500).bind(this),
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
      this.cleanTranslateElements()
    }
  }

  retranslate() {
    // remove all translateItems
    this.translateItemsSet.forEach((translateItem) => {
      translateItem.translateContainerElement?.remove()
    })

    this.translateItemsSet.clear()
    this.startPageTranslator()
  }
}

export default PageTranslator
