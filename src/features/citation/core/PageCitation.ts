import {
  formattedTextContent,
  getReadabilityArticle,
  getVisibleTextNodes,
} from '@/features/chat-base/summary/utils/pageContentHelper'
import { ICitationMatch, ICitationService } from '@/features/citation/types'
import { scrollToRange } from '@/features/citation/utils'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
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
  // 缓存一下readabilityArticle
  readabilityArticle: ReturnType<typeof getReadabilityArticle> | null = null

  constructor(public conversationId?: string) {
    this.init()
  }

  init() {
    return this
  }

  destroy() {
    this.elementMap = null
    this.readabilityArticle = null
  }

  /**
   * 触发context menu
   * @param element
   */
  async dispatchContextMenu(element: Element, delay = 500) {
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

  getElementMap = () => {
    if (this.elementMap) return this.elementMap
    this.elementMap = {}
    let id = 0
    document.body.querySelectorAll('*').forEach((item) => {
      const readabilityId = ++id
      item.setAttribute('maxai-readability-id', `${readabilityId}`)
      this.elementMap![readabilityId] = item
    })
    return this.elementMap
  }

  getReadabilityArticle = () => {
    if (this.readabilityArticle) return this.readabilityArticle
    this.readabilityArticle = getReadabilityArticle()
    return this.readabilityArticle
  }

  /**
   * 查找文本
   * TODO 针对特殊网站的查询逻辑
   */
  async findText(searchString: string, startIndex: number) {
    // searchString = searchString.replaceAll('\n', '')
    // searchString = searchString.replace(/\s+/g, '')
    if (!searchString) {
      return { title: '', matches: [] }
    }
    if (this.caches.get(searchString)) {
      const result = this.caches.get(searchString)!
      await this.selectMatches(result)
      return { title: '', matches: result }
    }
    if (this.loading) {
      return { title: '', matches: [] }
    }

    this.loading = true
    this.searchTime = Date.now()

    let elementMap = this.elementMap || {}
    let readabilityArticle = this.readabilityArticle

    if (this.conversationId) {
      const conversation = await ClientConversationManager.getConversationById(
        this.conversationId,
      )
      // 这里的临界点在GET_READABILITY_CONTENTS_OF_WEBPAGE里定义的，后续配置一下
      if (
        conversation?.meta.pageSummary?.content?.length &&
        conversation.meta.pageSummary.content.length > 100
      ) {
        // Readability逻辑
        elementMap = this.getElementMap()
        // Readability去查找页面内容
        readabilityArticle = this.getReadabilityArticle()
        // 先移除掉标题，标题目前还没去标识具体的节点位置
        if (readabilityArticle) {
          if (searchString.startsWith(`${readabilityArticle.title}\n\n`)) {
            searchString = searchString.replace(
              `${readabilityArticle?.title}\n\n`,
              '',
            )
          }
        }
      } else {
        // Visible逻辑
      }
    }

    // 根据标记查找真实的dom节点
    const getDomTextNode = (node: Node): Node => {
      if (!readabilityArticle?.content) return node
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

    let matches: ICitationMatch[] = []
    let currentContent = ''

    try {
      // 1. 先找到页面上所有textNodes
      const textNodes = getVisibleTextNodes(
        readabilityArticle?.content || document.body,
      )
      // 2. 匹配文字节点，去除\n匹配
      textNodes.some((item, index) => {
        if (Date.now() - this.searchTime > 1000 * 20) {
          // 查询时间大于20s超时返回
          throw new Error('Page citation timeout')
        }

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

    return { title: '', matches }
  }
}
