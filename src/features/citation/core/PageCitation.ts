import { getVisibleTextNodes } from '@/features/chat-base/summary/utils/pageContentHelper'
import { ICitationMatch, ICitationService } from '@/features/citation/types'
import { isParentElement, scrollToRange } from '@/features/citation/utils'
import { wait } from '@/utils'

export default class PageCitation implements ICitationService {
  // 记录查询的缓存
  caches: Map<string, ICitationMatch[]> = new Map()
  // 查询状态
  loading = false
  // 查询时间
  searchTime = Date.now()
  // 先给所有textNode加上唯一标记
  elementMap: Record<string, Element> | null = null

  constructor(public conversationId?: string) {
    this.init()
  }

  init() {
    return this
  }

  destroy() {
    this.caches.clear()
    this.loading = false
    this.elementMap = null
  }

  /**
   * 触发context menu
   * @param element
   */
  async dispatchContextMenu(element: Element, delay = 250) {
    element.dispatchEvent(
      new MouseEvent('mousedown', {
        cancelable: true,
        bubbles: true,
      }),
    )
    await wait(delay)
    element.dispatchEvent(
      new MouseEvent('mouseup', {
        cancelable: true,
        bubbles: true,
      }),
    )
  }

  /**
   * 高亮匹配项
   * @param matches
   */
  async highlightMatches(matches: ICitationMatch[]) {
    if (!matches) return
    const getMarkedElement = (match: ICitationMatch) => {
      if (typeof match.container === 'string') {
        return document.querySelector(match.container)
      }
      if (typeof match.container === 'function') {
        return match.container()
      }
      return match.container
    }
    const containers = [
      ...new Set(matches.map((item) => getMarkedElement(item))),
    ]
      .filter((item) => {
        // 过滤掉header，不去选中大部分网页的头部
        return item && !isParentElement(item, 'header')
      })
      .map((item) => {
        const element = item as HTMLElement
        // TODO 更改高亮颜色
        // element.classList.add('maxai-reading-highlight')
        return element
      })
    const range = document.createRange()
    const start = containers[0]
    const end = containers[containers.length - 1]
    range.setStart(start.firstChild!, 0)
    range.setEnd(end.lastChild!, end.lastChild?.nodeValue?.length || 0)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
      scrollToRange(selection.getRangeAt(0))
      await this.dispatchContextMenu(start)
    }
    // scrollToRange(range.cloneRange())
    // setTimeout(() => {
    //   document.body.addEventListener(
    //     'click',
    //     () => {
    //       containers.forEach((element) => {
    //         element.classList.remove('maxai-reading-highlight')
    //       })
    //     },
    //     { once: true },
    //   )
    // }, 100)
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
        scrollToRange(selection.getRangeAt(0))
        await this.dispatchContextMenu(startMarked)
      }
    }
  }

  /**
   * 查找文本
   * TODO 针对特殊网站的查询逻辑
   * 1. 获取页面上所有有内容的textNodes
   * 2. 匹配文本节点，去除换行符和空格进行查找
   * 3. 查找到的文本节点，选中文本
   *    3.1 给父元素加上highlight的样式
   *    3.2 用window.selection选中
   */
  async findText(searchString: string, startIndex: number) {
    // 这里主要是兼容旧数据，因为旧数据通过${readabilityArticle.title}\n\n作为开头，这里简单匹配去掉
    if (searchString.startsWith(`${document.title}\n\n`)) {
      searchString = searchString.replace(`${document.title}\n\n`, '')
    }

    // 去除所有空格换行符匹配
    searchString = searchString.replace(/\s+/g, '')

    if (!searchString) {
      return { title: '', matches: [] }
    }
    if (this.caches.get(searchString)) {
      const result = this.caches.get(searchString)!
      await this.highlightMatches(result)
      return { title: '', matches: result }
    }
    if (this.loading) {
      return { title: '', matches: [] }
    }

    this.loading = true
    this.searchTime = Date.now()

    let matches: ICitationMatch[] = []
    let currentContent = ''

    try {
      const textNodes = getVisibleTextNodes(document.body)
      textNodes.some((item, index) => {
        if (Date.now() - this.searchTime > 1000 * 20) {
          // 查询时间大于20s超时返回
          throw new Error('Page citation timeout')
        }

        let startOffset = 0
        let endOffset = 0
        let isFirstMatch = false
        const str = item.textContent?.replace(/\s+/g, '') || ''
        // const str = formattedTextContent(item)

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
                i = startOffset
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
          const textNode = item
          const container = textNode.parentElement
          matches.push({
            text: str,
            container,
            textNode,
            offset: !matches.length ? startOffset : endOffset,
          })
        }
        if (currentContent.length === searchString.length) {
          return true
        }
      })

      this.caches.set(searchString, matches)

      if (matches.length) {
        await this.highlightMatches(matches)
      }
    } catch (e) {
      console.error(e)
    }

    this.loading = false

    return { title: '', matches }
  }
}
