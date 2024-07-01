import {
  ICitationMatch,
  ICitationNode,
  ICitationService,
} from '@/features/citation/types'
import { createCitationNode } from '@/features/citation/utils'
import { wait } from '@/utils'

// https://github.com/mozilla/pdf.js/issues/1875
// pdf.js可以用这种方式去全文匹配，如果是换行必须要用空格去替换掉否则匹配不出来
// 如果是带目录的，每一页前会有额外内容，无法实现对于横跨多页的查询
// PDFViewerApplication.findBar.open();
// PDFViewerApplication.findBar.findField.value = `xxx`;
// PDFViewerApplication.findBar.highlightAll.checked= true;
// PDFViewerApplication.findBar.findNextButton.click();
// renderTextLayer

export interface IPDFCitationMatch extends ICitationMatch {
  pageNum: number
}

export default class PDFCitation implements ICitationService {
  private PDFViewerApplication: any
  private pdfDocument: any
  private pdfViewer: any

  // 记录查询的缓存
  caches: Map<string, IPDFCitationMatch[]> = new Map()
  // 记录每页的字符数量
  pages: number[] = []
  // 查询状态
  loading = false
  // 查询时间
  searchTime = Date.now()

  constructor() {
    this.init()
  }

  init() {
    this.PDFViewerApplication = (window as any)?.PDFViewerApplication
    this.pdfDocument = this.PDFViewerApplication?.pdfDocument
    this.pdfViewer = this.PDFViewerApplication?.pdfViewer
    return this
  }

  /**
   * 跳转到对应页面
   * @param pageNum
   */
  async gotoPage(pageNum: number) {
    this.PDFViewerApplication.page = pageNum
  }

  /**
   * 渲染页面
   * 目前我们用selection去选择内容，所以这里要等待页面上text layer渲染完毕之后才能选中dom元素
   * @param pages
   */
  async renderPages(pages: number[]) {
    for (const pageNum of pages) {
      const pageView = this.pdfViewer.getPageView(pageNum - 1)
      if (pageView && !pageView.textLayer) {
        // 有个问题就是如果是已经渲染了1,2,3,4页，假设当前pdfjs虚拟滚动只会渲染4页
        // 要渲染10,11页时，跳转到10页，他只会去渲染2,3,4,10页，第11页即使draw也没渲染
        // 这里处理方法就是先跳转到此页, 再去draw
        await this.gotoPage(pageNum)
        await pageView.draw()
        // 监听完成事件，处理下万一超时了的情况
        let onTextLayerRendered: ((event: any) => void) | null = null
        await Promise.race([
          new Promise((resolve) => setTimeout(resolve, 1500)),
          new Promise((resolve) => {
            onTextLayerRendered = (event) => {
              if (event.pageNumber === pageNum) {
                this.PDFViewerApplication.eventBus.off(
                  'textlayerrendered',
                  onTextLayerRendered,
                )
                resolve(null)
              }
            }
            this.PDFViewerApplication.eventBus.on(
              'textlayerrendered',
              onTextLayerRendered,
            )
          }),
        ]).finally(() => {
          this.PDFViewerApplication.eventBus.off(
            'textlayerrendered',
            onTextLayerRendered,
          )
        })
      }
    }
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
  async selectMatches(matches: IPDFCitationMatch[]) {
    if (!matches.length) return

    const start = matches[0]
    const end = matches[matches.length - 1]

    // 跳转到指定页面
    await this.gotoPage(start.pageNum)
    // 等待文档渲染
    await this.renderPages(
      Array(end.pageNum - start.pageNum + 1)
        .fill('')
        .map((_, index) => start.pageNum + index),
    )

    // 选中元素
    const range = document.createRange()
    const getMarkedElement = (match: IPDFCitationMatch) => {
      if (typeof match.container === 'string') {
        return document.querySelector(match.container)
      }
      if (typeof match.container === 'function') {
        return match.container()
      }
      return match.container
    }
    let startMarked = getMarkedElement(start)
    let endMarked = getMarkedElement(end)
    if (!startMarked || !endMarked) {
      // 没有找到对应节点，这里先选中第一页的内容
      const spans = document.querySelectorAll(
        `.pdfViewer .page[data-page-number="${start.pageNum}"] .textLayer span[role="presentation"]`,
      )
      startMarked = spans[0]
      endMarked = spans[spans.length - 1]
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
   */
  async findText(searchString: string, startIndex: number) {
    if (!searchString) {
      return ''
    }
    if (this.caches.get(searchString)) {
      const result = this.caches.get(searchString)!
      await this.selectMatches(result)
      return `${result[0] ? result[0].pageNum : ''}`
    }
    if (this.loading) {
      return ''
    }

    const numPages = this.pdfDocument.numPages
    let matches: IPDFCitationMatch[] = []
    let currentContent = ''
    let totalPageTextLength = 0
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

          const pageNode = createCitationNode()
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
                parentNode = createCitationNode(parentNode)
                return
              }
              if (item.type === 'endMarkedContent') {
                parentNode = parentNode?.parent || null
                return
              }
              const currentNode = createCitationNode(parentNode)

              let startOffset = 0
              let endOffset = 0
              let isFirstMatch = false
              const str = item.hasEOL ? `${item.str}\n` : item.str || ''
              pageTextLength += str.length
              itemIndex = index

              if (item.hasEOL && item.str) {
                // 这种元素实际会在下一个插入一个<br/>节点
                createCitationNode(parentNode)
              }

              // if (
              //   currentContent &&
              //   str.length <= searchString.length - currentContent.length
              // ) {
              //   if (
              //     str[0] !== searchString[currentContent.length] &&
              //     str[str.length - 1] !==
              //       searchString[currentContent.length + str.length - 1]
              //   ) {
              //     matches = []
              //     currentContent = ''
              //     return
              //   }
              // }
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

      const step = 100
      let beforeStart = 1
      let afterStart = numPages

      this.searchTime = Date.now()

      while (beforeStart < afterStart) {
        if (Date.now() - this.searchTime > 1000 * 20) {
          // 查询时间大于20s超时返回
          throw new Error('PDF citation timeout')
        }
        // 先找开头100页
        let end = Math.min(numPages, beforeStart + step)
        await findByPages(beforeStart, end)
        beforeStart = end + 1
        if (currentContent.length === searchString.length) {
          break
        }
        while (currentContent.length > 0 && beforeStart < end) {
          // 继续找下一页
          beforeStart = end + 1
          end = Math.min(numPages, beforeStart + 1)
          await findByPages(beforeStart, end)
        }

        // 找尾部100页
        afterStart = Math.max(end + 1, afterStart - step + 1)
        end = Math.min(numPages, afterStart + step)
        await findByPages(afterStart, end)
        if (currentContent.length === searchString.length) {
          break
        }
        while (currentContent.length > 0 && afterStart < end) {
          // 继续找下一页
          afterStart = end + 1
          end = Math.min(numPages, afterStart + 1)
          await findByPages(afterStart, end)
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
