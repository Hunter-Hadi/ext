import { useRef, useState } from 'react'

export const usePageUrlChange = () => {
  const [pageUrl, setPageUrl] = useState(window.location.href)
  const timerRef = useRef<any>(null)
  const pageUrlRef = useRef(pageUrl)
  pageUrlRef.current = pageUrl

  const startListen = () => {
    stopListen()
    timerRef.current = setInterval(() => {
      const url = window.location.href
      if (url === pageUrlRef.current) {
        console.log('usePageUrlChange 不更新url, 因为url没有变化')
        return
      } else {
        console.log('usePageUrlChange 检测更新url', url)
        setPageUrl(url) 
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
