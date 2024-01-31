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
  const html = ''

  if (!html) {
    const fetchHtml = async () => {
      try {
        const response = await clientFetchAPI(
          url,
          {
            parse: 'text',
          },
          abortTaskId,
        )
        result.status = response.responseRaw?.status || 200
        if (response.success && response.data) {
          return response.data
        }
      } catch (e) {
        return ''
      }
    }
    result.html = await promiseTimeout(fetchHtml(), timeout, '')
  }
  try {
    const doc = parseHTML(result.html).document
    const reader = new Readability(doc as any).parse()
    result.title = reader?.title || ''
    result.body = reader?.content || ''
    result.readabilityText = reader?.textContent || ''
  } catch (e) {
    console.log(e)
    result.success = false
  }
  return result
}
export default clientGetContentOfURL
