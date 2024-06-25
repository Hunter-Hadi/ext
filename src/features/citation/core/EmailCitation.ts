import {
  ICitationMatch,
  ICitationNode,
  ICitationService,
} from '@/features/citation/types'
import { createNode } from '@/features/citation/utils'

export default class EmailCitation implements ICitationService {
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
    const container = document.querySelector('#viewerContainer')
    if (!container || !element) return

    const containerRect = container.getBoundingClientRect()
    const elementRect =
      element instanceof Element ? element.getBoundingClientRect() : element
    // 计算目标元素相对于容器的位置
    const elementOffsetTop =
      elementRect.top - containerRect.top + container.scrollTop
    // 计算滚动位置，使目标元素位于容器的四分之一位置
    // const scrollTop =
    //   elementOffsetTop - container.clientHeight / 4 + element.clientHeight / 2
    // 计算滚动位置，使目标元素位于容器顶部加上 offset
    const scrollTop = elementOffsetTop - 50

    container.scrollTo({
      top: scrollTop,
      behavior: 'auto',
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
    if (!startMarked || !endMarked) {
      // 没有找到对应节点，这里先选中第一页的内容
      // startMarked = spans[0]
      // endMarked = spans[spans.length - 1]
    }
    if (startMarked && endMarked) {
      range.setStart(
        startMarked.firstChild!,
        Math.min(startMarked.firstChild!.nodeValue?.length || 0, start.offset),
      )
      range.setEnd(
        endMarked.firstChild!,
        Math.min(endMarked.firstChild!.nodeValue?.length || 0, end.offset + 1),
      )

      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        await this.scrollElement(
          selection.getRangeAt(0).getBoundingClientRect(),
        )
      }
    }
  }

  /**
   * 查找文本
   */
  async findText(searchString: string, startIndex: number) {
    if (!searchString) {
      return ''
    }
    if (this.caches.get(searchString)) {
      const result = this.caches.get(searchString)!
      await this.selectMatches(result)
      return 'Title'
    }
    if (this.loading) {
      return ''
    }

    let matches: ICitationMatch[] = []
    let currentContent = ''
    this.loading = true

    try {
      /**
       * 这里匹配内容的算法要优化，目前效率不太行
       */
      const findByPages = async (start: number, end: number) => {
        for (let pageNum = start; pageNum <= end; pageNum++) {
          const page = await this.pdfDocument.getPage(pageNum)
          const textContent = await page.getTextContent({
            includeMarkedContent: true,
          })

          if (typeof this.pages[pageNum - 1] === 'number') {
            totalPageTextLength += this.pages[pageNum - 1]
            if (startIndex > totalPageTextLength - 1) {
              continue
            }
          }

          const pageNode = createNode()
          let parentNode: ICitationNode | null = pageNode
          let pageTextLength = 0
          let itemIndex = 0

          textContent.items.some(
            (
              item: { type: string; hasEOL: boolean; str: string },
              index: number,
            ) => {
              if (
                item.type === 'beginMarkedContentProps' ||
                item.type === 'beginMarkedContent'
              ) {
                parentNode = createNode(parentNode)
                return
              }
              if (item.type === 'endMarkedContent') {
                parentNode = parentNode?.parent || null
                return
              }
              const currentNode = createNode(parentNode)

              let startOffset = 0
              let endOffset = 0
              const str = item.hasEOL ? `${item.str}\n` : item.str || ''
              pageTextLength += str.length
              itemIndex = index

              if (item.hasEOL && item.str) {
                // 这种元素实际会在下一个插入一个<br/>节点
                createNode(parentNode)
              }

              if (
                currentContent &&
                str.length <= searchString.length - currentContent.length
              ) {
                if (
                  str[0] !== searchString[currentContent.length] &&
                  str[str.length - 1] !==
                    searchString[currentContent.length + str.length - 1]
                ) {
                  matches = []
                  currentContent = ''
                  return
                }
              }
              for (let i = 0; i < str.length; i++) {
                if (str[i] === searchString[currentContent.length]) {
                  if (!currentContent.length) {
                    // 首次匹配中
                    startOffset = i
                    endOffset = i
                  }
                  currentContent += str[i]
                  if (currentContent.length === searchString.length) {
                    // 匹配完毕
                    endOffset = i
                    break
                  }
                } else {
                  // 未匹配中
                  matches = []
                  currentContent = ''
                }
              }
              if (currentContent.length) {
                if (
                  !matches.length ||
                  currentContent.length === searchString.length
                ) {
                  let node: ICitationNode | null = parentNode
                  let markedContentSelector = ''
                  while (node && node !== pageNode) {
                    // 有.markedContent元素
                    markedContentSelector =
                      ` > .markedContent:nth-child(${node.index + 1})` +
                      markedContentSelector
                    node = node.parent
                  }
                  const container = `.pdfViewer .page[data-page-number="${pageNum}"] .textLayer${markedContentSelector} > :nth-child(${
                    currentNode.index + 1
                  })`
                  if (!matches.length) {
                    // 匹配项就处于当前text内，所以先插入一个起始的匹配
                    matches.push({
                      pageNum,
                      text: str,
                      container,
                      offset: startOffset,
                    })
                  }
                  if (currentContent.length === searchString.length) {
                    // 结尾项
                    matches.push({
                      pageNum,
                      text: str,
                      container,
                      offset: endOffset,
                    })
                  }
                }
              }
              if (currentContent.length === searchString.length) {
                return true
              }
            },
          )

          pageTextLength += 1
          if (itemIndex === textContent.items.length - 1) {
            this.pages[pageNum - 1] = pageTextLength
          }

          if (currentContent.length === searchString.length) {
            break
          }

          if (currentContent.length) {
            currentContent += '\n'
          }
        }
      }

      this.caches.set(searchString, matches)

      if (matches.length) {
        await this.selectMatches(matches)
      }
    } catch (e) {
      console.error(e)
    }

    this.loading = false
    return `${matches[0] ? matches[0].pageNum : ''}`
  }
}
