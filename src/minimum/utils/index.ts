/**
 * 判断是否为文章页
 */
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const isArticlePage = () => {
  const currentHost = getCurrentDomainHost()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const hostWithPathname = `${currentHost}${pathname}`
  const matches = [
    'linkedin.com/feed/update',
    'stackoverflow.com/questions',
    'github.com',
  ]
  if (matches.find((match) => hostWithPathname.startsWith(match))) {
    return true
  }
  const url = typeof window !== 'undefined' ? window.location.href : ''
  // 检查 URL
  const urlMatch = url.match(
    /\/(article|news|doc|blog|review|product|recipe|profile)\//,
  )
  if (urlMatch) {
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
