import { ICitationService } from '@/features/citation/types'

// https://github.com/mozilla/pdf.js/issues/1875
// pdf.js可以用这种方式去全文匹配，如果是换行必须要用空格去替换掉否则匹配不出来
// 如果是带目录的，每一页前会有额外内容，无法实现对于横跨多页的查询
// PDFViewerApplication.findBar.open();
// PDFViewerApplication.findBar.findField.value = `xxx`;
// PDFViewerApplication.findBar.highlightAll.checked= true;
// PDFViewerApplication.findBar.findNextButton.click();
// renderTextLayer

export interface IPDFCitationMatch {
  pageNum: number
  markedIndex: number
  markedChildIndex: number
  offset: number
}

export default class PDFCitation implements ICitationService {
  private PDFViewerApplication: any
  private pdfDocument: any
  private pdfViewer: any

  caches: Map<string, IPDFCitationMatch[]> = new Map()

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
  async scrollElement(element: Element) {
    const container = document.querySelector('#viewerContainer')
    if (!container || !element) return

    // 滚动到页面正中间
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    // 计算目标元素相对于容器的位置
    const elementOffsetTop =
      elementRect.top - containerRect.top + container.scrollTop
    // 计算滚动位置，使目标元素位于容器的四分之一位置
    // const scrollTop =
    //   elementOffsetTop - container.clientHeight / 4 + element.clientHeight / 2
    // 计算滚动位置，使目标元素位于容器顶部加上 offset
    const scrollTop = elementOffsetTop - 50

    // 滚动页面
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
      if (match.markedIndex >= 0) {
        // 有.markedContent元素
        return document.querySelector(
          `.pdfViewer .page[data-page-number="${
            match.pageNum
          }"] .textLayer .markedContent:nth-of-type(${match.markedIndex + 1})`,
        )?.children[match.markedChildIndex]
      }
      // 无.markedContent元素
      return document.querySelector(
        `.pdfViewer .page[data-page-number="${match.pageNum}"] .textLayer`,
      )?.children[match.markedChildIndex]
    }
    const startMarked = getMarkedElement(start)
    const endMarked = getMarkedElement(end)
    if (startMarked && endMarked) {
      await this.scrollElement(startMarked)

      range.setStart(startMarked.firstChild!, start.offset)
      range.setEnd(endMarked.firstChild!, end.offset)

      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  /**
   * 查找文本
   */
  async findText(searchString: string) {
    if (this.caches.get(searchString)) {
      const result = this.caches.get(searchString)!
      await this.selectMatches(result)
      return `${result[0] ? result[0].pageNum : ''}`
    }

    const numPages = this.pdfDocument.numPages
    let matches: IPDFCitationMatch[] = []
    let currentContent = ''

    /**
     * 这里匹配内容的算法要优化，目前效率不太行
     */
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await this.pdfDocument.getPage(pageNum)
      const textContent = await page.getTextContent({
        includeMarkedContent: true,
      })

      let markedIndex = -1
      let markedChildIndex = -1

      textContent.items.some(
        (item: { type: string; hasEOL: boolean; str: string }) => {
          if (item.type === 'beginMarkedContentProps') {
            markedIndex += 1
            markedChildIndex = -1
            return
          }
          if (item.type === 'endMarkedContent') {
            return
          }
          let offset = 0
          markedChildIndex += 1
          const str = item.hasEOL ? `${item.str}\n` : item.str
          let isEqual = false
          if (
            str ===
            searchString.slice(
              currentContent.length,
              currentContent.length + str.length,
            )
          ) {
            isEqual = true
            currentContent += str
            if (currentContent.length === searchString.length) {
              offset = str.length
            }
          }
          if (!isEqual) {
            for (let i = 0; i < str.length; i++) {
              if (str[i] === searchString[currentContent.length]) {
                if (!currentContent.length) {
                  // 首次匹配中
                  offset = i
                }
                currentContent += str[i]
                if (currentContent.length === searchString.length) {
                  // 匹配完毕
                  offset = i
                  break
                }
              } else {
                // 未匹配中
                matches = []
                currentContent = ''
              }
            }
          }
          if (currentContent.length) {
            matches.push({
              pageNum,
              markedIndex,
              markedChildIndex,
              offset,
            })
          }
          if (item.hasEOL && item.str) {
            // 这种元素实际会在下一个插入一个<br/>节点
            markedChildIndex += 1
          }
          if (currentContent.length === searchString.length) {
            return true
          }
        },
      )

      if (currentContent.length === searchString.length) {
        break
      }

      if (currentContent.length) {
        currentContent += '\n'
      }
    }

    this.caches.set(searchString, matches)

    if (matches.length) {
      await this.selectMatches(matches)
    }

    return `${matches[0] ? matches[0].pageNum : ''}`

    // 以下方法原本是想去计算位置然后用一个div模拟高亮选区，实际计算出的坐标有点问题，弃用掉
    // for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    //   const page = await this.pdfDocument.getPage(pageNum)
    //   const textContent = await page.getTextContent()
    //   // const viewport = page.getViewport({
    //   //   scale: scale * pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS,
    //   //   rotation: (page.rotate) % 360,
    //   // })
    //   const viewport = page.getViewport({ scale })
    //   const { items, styles } = textContent
    //
    //   // const pageWidth = viewport.width
    //   // const pageHeight = viewport.height
    //   const pageWidth = page.view[2] - page.view[0]
    //   const pageHeight = page.view[3] = page.view[1]
    //
    //   outer: for (const item of items) {
    //     const str = item.hasEOL ? `${item.str}\n` : item.str
    //     for (let i = 0; i < str.length; i++) {
    //       if (currentContent.length === searchString.length) {
    //         this.PDFViewerApplication.page = pageNum
    //         return matches
    //       }
    //       if (str[i] !== searchString[currentContent.length + i]) {
    //         matches = []
    //         currentContent = ''
    //         continue outer
    //       }
    //     }
    //     // const tx = transform(viewport.transform, item.transform)
    //     const [scaleX, shearY, shearX, scaleY, translateX, translateY] =
    //       item.transform
    //     // let angle = Math.atan2(tx[1], tx[0])
    //     // const style = styles[item.fontName]
    //     //
    //     // if (style.vertical) {
    //     //   angle += Math.PI / 2
    //     // }
    //     // const fontHeight = Math.hypot(tx[2], tx[3])
    //     // const fontAscent = fontHeight * getAscent(style.fontFamily, ctx);
    //     // let left, top
    //     //
    //     // if (angle === 0) {
    //     //   left = tx[4]
    //     //   top = tx[5]
    //     // } else {
    //     //   left = tx[4] + fontAscent * Math.sin(angle);
    //     //   top = tx[5] - fontAscent * Math.cos(angle);
    //     // }
    //
    //     const container = this.PDFViewerApplication.pdfViewer.getPageView(
    //       pageNum - 1,
    //     ).div
    //
    //     // 计算缩放后的位置和大小
    //     const scaledWidth =
    //       (item.width / pageWidth) * container.clientWidth * scale
    //     const scaledHeight =
    //       (item.height / pageHeight) * container.clientHeight * scale
    //
    //     // 转换为 HTML 坐标系（左上角）
    //     const x = (translateX / pageWidth) * 100 + '%'
    //     const y =
    //       ((pageHeight - (translateY + item.height)) / pageHeight) * 100 + '%'
    //     // const x = (translateX / pageWidth) * container.clientWidth * scale
    //     // const y =
    //     //   (container.clientHeight -
    //     //     (translateY / pageHeight) * container.clientHeight -
    //     //     scaledHeight) *
    //     //   scale
    //
    //     // const x = tx[4]
    //     // const y = tx[5]
    //
    //     const layout = {
    //       top: y,
    //       left: x,
    //       right: x + scaledWidth,
    //       bottom: y + scaledHeight,
    //       width: scaledWidth,
    //       height: scaledHeight,
    //     }
    //   }
    // }
  }
}
