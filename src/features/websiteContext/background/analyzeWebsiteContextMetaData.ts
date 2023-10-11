import cheerio from 'cheerio'
import { IWebsiteContextMeta } from '@/features/websiteContext/background/index'

export const analyzeWebsiteContextMetaData = async (
  url: string,
  html: string,
) => {
  const $ = cheerio.load(html)

  // 获取JSON-LD
  const jsonLD = $('script[type="application/ld+json"]').html()
  const jsonLDData = jsonLD ? JSON.parse(jsonLD) : null

  // 获取Open Graph
  const openGraphData: IWebsiteContextMeta['openGraph'] = {}
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr('property')
    const content = $(element).attr('content')
    if (property && content) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      openGraphData[property.replace('og:', '')] = content
    }
  })

  // 获取标题
  const title = $('title').text()

  // 获取描述
  const description = $('meta[name="description"]').attr('content')

  // 获取Logo
  const logo = $('link[rel="logo"]').attr('href')

  // 获取Favicon
  const favicon = $('link[rel="icon"]').attr('href')

  // 构建结果对象
  const result: IWebsiteContextMeta = {
    jsonLD: jsonLDData,
    openGraph:
      Object.keys(openGraphData).length > 0 ? openGraphData : undefined,
    title,
    description,
    logo,
    favicon,
  }
  return result
}
