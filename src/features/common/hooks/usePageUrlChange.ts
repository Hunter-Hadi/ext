import { useRef, useState } from 'react'

export const usePageUrlChange = () => {
  const [pageUrl, setPageUrl] = useState(window.location.href)
  const prevPageUrlRef = useRef(pageUrl)
  const prevPageTitleRef = useRef(document.title)
  const countRef = useRef(0)
  const timerRef = useRef<any>(null)
  const pageUrlRef = useRef(pageUrl)
  pageUrlRef.current = pageUrl

  const startListen = () => {
    stopListen()
    timerRef.current = setInterval(() => {
      const url = window.location.href
      if (url === pageUrlRef.current) {
        prevPageUrlRef.current = url
        prevPageTitleRef.current = document.title
        console.log('usePageUrlChange 不更新url, 因为url没有变化')
        return
      }
      if (url !== prevPageUrlRef.current) {
        // 如果url变化了, 初始化count
        countRef.current = 0
        prevPageUrlRef.current = url
        console.log('usePageUrlChange 检测到变化', url)
      }
      // 如果title变化了, 初始化count, 更新pageUrl
      if (prevPageTitleRef.current !== document.title) {
        countRef.current = 0
        prevPageUrlRef.current = url
        prevPageTitleRef.current = document.title
        console.log('usePageUrlChange 检测更新url', url)
        setPageUrl(url)
      } else {
        countRef.current += 1
        // 如果count大于10, 说明页面已经停止变化了, 更新pageUrl
        if (countRef.current > 10) {
          countRef.current = 0
          prevPageUrlRef.current = url
          prevPageTitleRef.current = document.title
          console.log('usePageUrlChange 超时更新url', url)
          setPageUrl(url)
        }
      }
    }, 1000)
  }
  const stopListen = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }
  return {
    pageUrl,
    startListen,
    stopListen,
  }
}
export default usePageUrlChange
