import { useRef, useState } from 'react'

export const usePageUrlChange = () => {
  const [pageUrl, setPageUrl] = useState('')
  const prevPageUrlRef = useRef('')
  const prevPageTitleRef = useRef(document.title)
  const countRef = useRef(0)
  const timerRef = useRef<any>(null)
  const startListen = () => {
    stopListen()
    timerRef.current = setInterval(() => {
      const url = window.location.href
      if (!prevPageUrlRef.current) {
        prevPageTitleRef.current = document.title
        prevPageUrlRef.current = url
        return
      }
      if (url === prevPageUrlRef.current) {
        prevPageTitleRef.current = document.title
        return
      }
      if (url !== prevPageUrlRef.current) {
        // 如果url变化了, 初始化count
        countRef.current = 0
      }
      // 如果title变化了, 初始化count, 更新pageUrl
      if (prevPageTitleRef.current !== document.title) {
        countRef.current = 0
        prevPageTitleRef.current = document.title
        prevPageUrlRef.current = url
        setPageUrl(url)
      } else {
        countRef.current += 1
        // 如果count大于10, 说明页面已经停止变化了, 更新pageUrl
        if (countRef.current > 10) {
          countRef.current = 0
          prevPageTitleRef.current = document.title
          prevPageUrlRef.current = url
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
