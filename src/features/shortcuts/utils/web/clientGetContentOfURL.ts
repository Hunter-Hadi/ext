import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

import { clientFetchAPI } from '@/features/shortcuts/utils'
import { promiseTimeout } from '@/utils/promiseUtils'

interface Image {
  src: string
  alt: string
  title: string
}

const dirtywords = ['icon', 'menu', 'logo', 'load', 'search']

/**
 * 插件客户端获取网页内容
 * @param url
 * @param timeout
 * @param abortTaskId
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
    images: [] as any[],
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
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = reader?.content
        const images = tempDiv.querySelectorAll('img')
        // const videos = tempDiv.querySelectorAll('video')
        // console.log(`videos111`, videos)

        const _resImages = Array.from(images)
          .filter((item) => {
            // 检查是否有获取图片链接不合规的情况，并且进行属性检查
            const src = item.src.toLowerCase()
            const forbiddenPatterns = /chrome-extension:|icon|menu|logo/
            if (forbiddenPatterns.test(src)) {
              return false
            }

            const attributes = item.attributes
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
            const alt = item.getAttribute('alt')

            // 尺寸有一个大于 200
            const isLarge =
              widthAttr &&
              heightAttr &&
              parseInt(widthAttr) > 200 &&
              parseInt(heightAttr) > 200

            // alt 存在且不为空
            const altString = String(alt)
            const trimmedAlt = altString.trim()
            const vaildAlt =
              trimmedAlt !== '' &&
              dirtywords.some((dirtyword) => trimmedAlt.includes(dirtyword))

            // 过滤条件
            return isLarge || vaildAlt
          })
          .reduce<Image[]>((acc, current) => {
            // 检查当前图片的 src 是否已经存在于去重后的数组中
            if (!acc.some((item) => item.src === current.src)) {
              acc.push(current)
            }
            return acc
          }, [])
          .slice(0, 8)
          .map((item) => {
            return {
              src: item.src,
              alt: item.alt || '', // 如果没有 alt 属性，返回空字符串
              title: item.title || '', // 如果没有 title 属性，返回空字符串
            }
          })
        result.images = _resImages
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
