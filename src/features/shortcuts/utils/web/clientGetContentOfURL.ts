import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import orderBy from 'lodash-es/orderBy'

import { clientFetchAPI } from '@/features/shortcuts/utils'
import { promiseTimeout } from '@/utils/promiseUtils'

interface Image {
  src: string
  alt: string
  title: string
}

/**
 * 获取具有最高分辨率图片的 src 和宽度。
 * @param {HTMLElement} element - 需要提取 srcset 属性的 HTML 元素。
 * @returns {{ src: string, size: number }} 包含最高分辨率图片的 src 和相应的大小。
 */
const getImageHighestResponsiveData = (
  element: HTMLElement,
): { src: string; size: number } => {
  // 获取元素的 srcset 属性
  const srcset = element.getAttribute('srcset')

  // 如果 srcset 存在
  if (srcset) {
    // 分割 srcset 并通过 reduce 寻找具有最大宽度的图片
    const highestResImg = srcset.split(',').reduce(
      (acc, currentValue) => {
        // 去除空格并分割当前项为 url 和宽度
        const [url, widthStr] = currentValue.trim().split(' ') as [
          string,
          string,
        ]
        // 将宽度转换为整数
        const width = parseInt(widthStr)
        // 如果宽度有效且大于当前记录的最大宽度，则更新
        if (!isNaN(width) && width > acc.size) {
          return { size: width, src: url }
        }
        return acc
      },
      { size: 0, src: '' }, // 初始化累加值为一个具有大小为0的对象
    )
    // 返回包含具有最大分辨率图片的 src 和大小的对象
    return highestResImg
  }

  // 如果不存在 srcset，返回空字符串和大小为0的对象
  return { src: '', size: 0 }
}

/**
 * 插件客户端获取网页内容
 * @param url
 * @param timeout
 * @param abortTaskId
 * @param needMedia  updata: copilot获取网页多媒体资源
 */
const clientGetContentOfURL = async (
  url: string,
  timeout: number,
  abortTaskId?: string,
  needMedia?: boolean, // copilot获取网页多媒体资源
): Promise<{
  title: string
  body: string
  html: string
  readabilityText: string
  url: string
  status: number
  success: boolean
  images: Image[]
  videos: any[]
}> => {
  const result = {
    success: true,
    status: 200,
    url,
    title: '',
    body: '',
    html: '',
    readabilityText: '',
    images: [] as Image[],
    videos: [] as any[],
  }

  try {
    const fetchHtml = async (targetUrl: string) => {
      const response = await clientFetchAPI(
        targetUrl,
        {
          method: 'GET',
          parse: 'text',
        },
        abortTaskId,
      )
      result.status = response.responseRaw?.status || 200
      // 搜狗引擎的防爬机制响应是 200 需要手动鉴别
      if (response?.responseRaw?.url.includes('www.sogou.com/antispider')) {
        result.status = 301
      }
      if (response.success && response.data) {
        return response.data
      }
      throw new Error('Failed to fetch HTML content')
    }

    const fetchHtmlWithRedirection = async (
      initialUrl: string,
    ): Promise<string> => {
      let htmlContent = await promiseTimeout(fetchHtml(initialUrl), timeout, '')
      // 搜狗引擎部分页面会重定向，需要做二次请求抓取
      if (initialUrl.includes('https://www.sogou.com')) {
        const regex = /window\.location\.replace\("([^"]+)"\)/
        const match = htmlContent.match(regex)
        if (match && match[1]) {
          htmlContent = await promiseTimeout(fetchHtml(match[1]), timeout, '')
        }
      }
      return htmlContent
    }

    result.html = await fetchHtmlWithRedirection(url)

    const handleReader = (htmlContent: string) => {
      const doc = parseHTML(htmlContent).document
      const reader = new Readability(doc as any).parse()
      result.title = reader?.title || ''
      result.body = reader?.content || ''
      result.readabilityText = reader?.textContent || ''
      if (needMedia && reader?.content) {
        // 创建一个临时容器来解析 HTML 内容
        const parser = new DOMParser()
        const parsedDoc = parser.parseFromString(reader.content, 'text/html')

        // 获取所有 img 标签
        const images = parsedDoc.querySelectorAll('img')
        const validImages: Array<{
          width: number
          height: number
          src: string
          alt: string
          title: string
        }> = []
        Array.from(images).forEach((imgElement) => {
          // 检查是否有获取图片链接不合规的情况，并且进行属性检查
          const src = imgElement.src.toLowerCase()
          const forbiddenPatterns = /chrome-extension:|icon|menu|logo|svg/
          if (forbiddenPatterns.test(src) || src === '') {
            return false
          }
          const attributes = imgElement.attributes
          let widthAttr = ''
          let heightAttr = ''
          for (let i = 0; i < attributes.length; i++) {
            const attrName = attributes[i].name.toLowerCase()
            if (attrName.includes('width')) {
              widthAttr = attributes[i].value
            }
            if (attrName.includes('height')) {
              heightAttr = attributes[i].value
            }
          }
          const alt = imgElement.getAttribute('alt') || ''
          if (
            ['icon', 'menu', 'logo', 'load', 'search'].some((word) =>
              alt.toLowerCase().includes(word),
            )
          ) {
            return
          }
          const title = imgElement.getAttribute('title') || ''
          const imageResponsiveData = getImageHighestResponsiveData(imgElement)
          // 尺寸有一个大于 200
          const isLarge =
            !imageResponsiveData.src &&
            ((widthAttr && parseInt(widthAttr) > 200) ||
              (heightAttr && parseInt(heightAttr) > 200))
          let imgSrc = imageResponsiveData.src || imgElement.src
          // 如果是相对路径，补全
          if (imgSrc.startsWith('/')) {
            try {
              imgSrc = new URL(imgSrc, url).href
            } catch (e) {
              console.error(e)
            }
          }
          if (isLarge || imageResponsiveData.src || alt) {
            validImages.push({
              width: imageResponsiveData.size || parseInt(widthAttr) || 0,
              height: imageResponsiveData.size || parseInt(heightAttr) || 0,
              src: imgSrc,
              alt: alt === 'undefined' ? '' : alt,
              title: title === 'undefined' ? '' : title,
            })
          }
        })
        result.images = orderBy(
          validImages,
          (item) => Math.max(item.width, item.height),
          'desc',
        )
          .slice(0, 8)
          .map((imageItem) => {
            return {
              src: imageItem.src,
              alt: imageItem.alt,
              title: imageItem.title,
            }
          })
        // result.videos = _resVideos
      }
    }

    handleReader(result.html)
  } catch (e) {
    console.error(e)
    result.success = false
  }

  return result
}

export default clientGetContentOfURL
