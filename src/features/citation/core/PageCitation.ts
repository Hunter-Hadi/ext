import { Readability } from '@mozilla/readability'

import {
  formattedTextContent,
  getFormattedTextFromNodes,
  getVisibleTextNodes,
} from '@/features/chat-base/summary/utils/pageContentHelper'
import { ICitationMatch, ICitationService } from '@/features/citation/types'
import { wait } from '@/utils'

export default class PageCitation implements ICitationService {
  // 记录查询的缓存
  caches: Map<string, ICitationMatch[]> = new Map()
  // 查询状态
  loading = false
  // 查询时间
  searchTime = Date.now()

  constructor() {
    this.init()
  }

  init() {
    return this
  }

  /**
   * 滚动到元素位置
   * @param element
   */
  async scrollElement(element: Element | DOMRect) {
    const container = document.body
    if (!container || !element) return

    const containerRect = container.getBoundingClientRect()
    const elementRect =
      element instanceof Element ? element.getBoundingClientRect() : element
    // 计算目标元素相对于容器的位置
    const elementOffsetTop =
      elementRect.top - containerRect.top + container.scrollTop
    let scrollTop = elementOffsetTop
    // 判断元素高度是否小于可视区域高度
    if (elementRect.height < window.innerHeight) {
      // 计算滚动位置，使元素位于正中间
      scrollTop =
        elementOffsetTop - window.innerHeight / 2 + elementRect.height / 2
    } else {
      // 元素高度大于容器高度，滚动到元素顶部
      scrollTop = elementOffsetTop
    }

    document.documentElement.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    })
  }

  /**
   * 选中匹配项
   * @param matches
   */
  async selectMatches(matches: ICitationMatch[]) {
    if (!matches.length) return

    const start = matches[0]
    const end = matches[matches.length - 1]

    // 选中元素
    const range = document.createRange()
    const getMarkedElement = (match: ICitationMatch) => {
      if (typeof match.container === 'string') {
        return document.querySelector(match.container)
      }
      if (typeof match.container === 'function') {
        return match.container()
      }
      return match.container
    }
    const startMarked = getMarkedElement(start)
    const endMarked = getMarkedElement(end)
    if (startMarked && endMarked) {
      const startNode = start.textNode || startMarked.firstChild
      const endNode = end.textNode || endMarked.firstChild
      range.setStart(
        startNode!,
        Math.min(startNode!.nodeValue?.length || 0, start.offset),
      )
      range.setEnd(
        endNode!,
        Math.min(endNode!.nodeValue?.length || 0, end.offset + 1),
      )

      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        await this.scrollElement(
          selection.getRangeAt(0).getBoundingClientRect(),
        )
        // 触发context menu
        startMarked.dispatchEvent(
          new MouseEvent('mousedown', {
            cancelable: true,
            bubbles: true,
          }),
        )
        await wait(500)
        startMarked.dispatchEvent(
          new MouseEvent('mouseup', {
            cancelable: true,
            bubbles: true,
          }),
        )
      }
    }
  }

  /**
   * 查找文本
   * 1. 获取页面上所有可见textNodes
   * 2. 去除\n和空格进行匹配
   */
  async findText(searchString: string, startIndex: number) {
    // searchString = searchString.replaceAll('\n', '')
    // searchString = searchString.replace(/\s+/g, '')
    if (!searchString) {
      return ''
    }
    if (this.caches.get(searchString)) {
      const result = this.caches.get(searchString)!
      await this.selectMatches(result)
      return ''
    }
    if (this.loading) {
      return ''
    }

    this.loading = true

    // 先给所有textNode加上唯一标记
    const elementMap: Record<string, Element> = {}
    let id = 0
    document.body.querySelectorAll('*').forEach((item) => {
      const readabilityId = ++id
      item.classList.add(`maxai-readability-id-${readabilityId}`)
      item.setAttribute('maxai-readability-id', `${readabilityId}`)
      elementMap[readabilityId] = item
    })

    // Readability去查找页面内容
    const clonedDocument = document.cloneNode(true) as Document
    const reader = new Readability(clonedDocument as any, {
      serializer: (el) => el,
    })
    const readabilityArticle = reader.parse()
    const contentElement =
      readabilityArticle?.content as any as HTMLElement | null
    const readabilityText = contentElement
      ? `${readabilityArticle?.title}\n\n${getFormattedTextFromNodes(
          getVisibleTextNodes(contentElement),
        )}`
      : ''
    // 字数过少的内容应该是去读取document.body的内容了
    const hasReadability = readabilityText.length > 100
    if (hasReadability) {
      searchString = searchString.replace(
        `${readabilityArticle?.title}\n\n`,
        '',
      )
    }

    // 根据标记查找真实的dom节点
    const getDomTextNode = (node: Node): Node => {
      if (!hasReadability) return node
      const parentElement = node.parentElement
      const readabilityId = parentElement?.getAttribute('maxai-readability-id')
      if (readabilityId && elementMap[readabilityId]) {
        const childNodes = Array.from(elementMap[readabilityId].childNodes)
        let fallbackNode = null
        const domNode = childNodes.find((childNode) => {
          if (childNode.nodeType === node.nodeType) {
            fallbackNode = childNode
          }
          return (
            childNode.nodeType === node.nodeType &&
            formattedTextContent(childNode) === formattedTextContent(node)
          )
        })
        return domNode || fallbackNode || node
      }
      return node
    }

    try {
      // 1. 先找到页面上所有textNodes
      const textNodes = getVisibleTextNodes(
        hasReadability && contentElement ? contentElement : document.body,
      )
      // 2. 匹配文字节点，去除\n匹配
      let matches: ICitationMatch[] = []
      let currentContent = ''
      textNodes.some((item, index) => {
        let startOffset = 0
        let endOffset = 0
        let isFirstMatch = false
        const str = formattedTextContent(item)

        for (let i = 0; i < str.length; i++) {
          if (str[i] === searchString[currentContent.length]) {
            if (!currentContent.length) {
              // 首次匹配中
              startOffset = i
              endOffset = i
              isFirstMatch = true
            }
            currentContent += str[i]
            if (currentContent.length === searchString.length) {
              // 匹配完毕
              endOffset = i
              break
            }
          } else {
            // 未匹配中
            if (currentContent) {
              if (isFirstMatch) {
                i = startOffset + 1
              } else {
                i--
              }
            }
            matches = []
            currentContent = ''
            isFirstMatch = false
          }
        }
        if (currentContent.length) {
          // 这里textNode要去elementMap里寻找页面里实际的dom
          const textNode = getDomTextNode(item)
          const container = textNode.parentElement
          if (!matches.length) {
            // 匹配项就处于当前text内，所以先插入一个起始的匹配
            matches.push({
              text: str,
              container,
              textNode,
              offset: startOffset,
            })
          }
          if (currentContent.length === searchString.length) {
            // 结尾项
            matches.push({
              text: str,
              container,
              textNode,
              offset: endOffset,
            })
          }
        }
        if (currentContent.length === searchString.length) {
          return true
        }
      })

      this.caches.set(searchString, matches)

      if (matches.length) {
        await this.selectMatches(matches)
      }
    } catch (e) {
      console.error(e)
    }

    this.loading = false
    return ''
  }
}
