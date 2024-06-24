import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

import { clientFetchAPI } from '@/features/shortcuts/utils'
import { promiseTimeout } from '@/utils/promiseUtils'

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
  images: any[]
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
      console.log(`url123`, url)
      console.log(`doc111`, doc)
      console.log(`reader`, reader)
      console.log(`htmlContent`, htmlContent)
      console.log(`reader?.content`, reader?.content)
      if (needMedia && reader?.content) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = reader?.content
        const images = tempDiv.querySelectorAll('img')
        // const videos = tempDiv.querySelectorAll('video')
        console.log(`1images111`, images)
        // console.log(`videos111`, videos)

        const _resImages = Array.from(images)
          // .slice(0, 3)
          .map((item) => {
            console.log(`Image ${item.title}:`, item.src)

            return {
              src: item.src,
              alt: item.alt,
              title: item.title,
            }
          })
        // const _resVideos = Array.from(videos)
        //   // .slice(0, 3)
        //   .map((item) => {
        //     console.log(`Image ${item.title}:`, item.src)

        //     return {
        //       src: item.src,
        //       poster: item.poster,
        //       // title: item.title,
        //     }
        //   })
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
