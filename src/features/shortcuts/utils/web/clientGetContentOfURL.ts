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
): Promise<{
  title: string
  body: string
  html: string
  readabilityText: string
  url: string
  status: number
  success: boolean
}> => {
  const result = {
    success: true,
    status: 200,
    url,
    title: '',
    body: '',
    html: '',
    readabilityText: '',
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
          console.log(`match && match[1]:`, match[1])
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
    }

    handleReader(result.html)
  } catch (e) {
    console.error(e)
    result.success = false
  }

  return result
}

export default clientGetContentOfURL
