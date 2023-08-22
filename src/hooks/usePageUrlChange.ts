import { useRef, useState } from 'react'

export const usePageUrlChange = () => {
  const [pageUrl, setPageUrl] = useState('')
  const timerRef = useRef<any>(null)
  const startListen = () => {
    timerRef.current = setInterval(() => {
      const url = window.location.href
      if (pageUrl !== url) {
        setPageUrl(url)
      }
    }, 500)
  }
  const stopListen = () => {
    clearInterval(timerRef.current)
  }
  return {
    pageUrl,
    startListen,
    stopListen,
  }
}
export default usePageUrlChange
