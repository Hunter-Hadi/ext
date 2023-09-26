import { getCurrentDomainHost } from '@/utils'
import useEffectOnce from '@/hooks/useEffectOnce'
import { useState } from 'react'

const useHideInHost = () => {
  const host = getCurrentDomainHost()
  const [hide, setHide] = useState(false)
  useEffectOnce(() => {
    if (host === 'youtube.com') {
      // 全屏模式需要隐藏quick access
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target) {
            const target = mutation.target as HTMLDivElement
            if (target.hasAttribute('scrolling')) {
              setHide(true)
            } else {
              setHide(false)
            }
          }
        })
      })
      const target = document.querySelector('ytd-app')
      if (target) {
        observer.observe(target, {
          attributes: true,
          childList: false,
          subtree: false,
        })
      }
    }
  })
  return hide
}
export default useHideInHost
