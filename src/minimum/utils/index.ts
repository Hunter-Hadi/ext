/**
 * 判断是否为文章页
 */
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const isArticlePage = () => {
  const websiteHost = getCurrentDomainHost()
  const websitePathname =
    typeof window !== 'undefined' ? window.location.pathname : ''
  // 检查 pathname是否包含以下keywords
  const keywords = [
    'article',
    'news',
    'doc',
    'blog',
    'review',
    'product',
    'recipe',
    'profile',
    'website',
    'stories',
  ]

  const hasKeyword = keywords.some((keyword) =>
    websitePathname.includes(`/${keyword}/`),
  )
  if (hasKeyword) {
    return true
  }

  const hostWithPathname = `${websiteHost}${websitePathname}`
  // NOTE: 能尽量用字符串匹配的就用字符串匹配，不要用正则
  const textMatches = [
    'linkedin.com/feed/update',
    'stackoverflow.com/questions',
  ]
  if (textMatches.find((match) => hostWithPathname.startsWith(match))) {
    return true
  }

  // 黑名单地址
  const backListUrl = ['figma.com/file']
  if (backListUrl.some((url) => hostWithPathname.includes(url))) {
    return false
  }

  const regexMatches = [/github.com\/.+/, /reddit.com\/r\/.+/, /quora.com\/.+/]
  const regexHostWithPathname = `${websiteHost}${websitePathname.slice(0, 5)}`
  if (regexMatches.find((match) => regexHostWithPathname.match(match))) {
    return true
  }

  // 检查 JSON-LD 数据
  const jsonLd = document.querySelector('script[type="application/ld+json"]')
  if (jsonLd) {
    try {
      const jsonLdData = JSON.parse(jsonLd.textContent || '{}')
      if (
        [
          'Article',
          'BlogPosting',
          'NewsArticle',
          'ProfilePage',
          'ProductPage',
          'Review',
          'Recipe',
        ].includes(jsonLdData['@type'] || '')
      ) {
        return true
      }
    } catch (e) {
      // do nothing
    }
  }

  // 检查 SEO 元数据
  const ogType = document.querySelector('meta[property="og:type"]')
  const author =
    document.querySelector('meta[property="article:author"]') ||
    document.querySelector('meta[name="author"]')
  if (author) {
    return true
  }
  if (
    ogType &&
    [
      'article',
      'blog',
      'news',
      'profile',
      'product',
      'review',
      'recipe',
    ].includes(ogType.getAttribute('content') || '')
  ) {
    return true
  }

  // 检查其他条件
  const linkAuthor = document.querySelector('link[rel="author"]')
  if (linkAuthor && linkAuthor.getAttribute('href')) {
    return true
  }
  return false
}
