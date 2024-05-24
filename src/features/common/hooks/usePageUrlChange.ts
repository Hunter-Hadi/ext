import { useRef, useState } from 'react'

export const usePageUrlChange = () => {
  const [pageUrl, setPageUrl] = useState(() => {
    return window.location.href
  })
  const [documentTitle, setDocumentTitle] = useState(document.title)
  const timerRef = useRef<any>(null)
  const pageUrlRef = useRef(pageUrl)
  pageUrlRef.current = pageUrl
  const documentTitleRef = useRef(documentTitle)
  documentTitleRef.current = documentTitle

  const startListen = () => {
    stopListen()
    timerRef.current = setInterval(() => {
      const url = window.location.href
      if (document.title !== documentTitleRef.current) {
        setDocumentTitle(document.title)
      }
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
    documentTitle,
    startListen,
    stopListen,
  }
}
export default usePageUrlChange
