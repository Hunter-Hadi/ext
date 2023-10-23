import useEffectOnce from '@/hooks/useEffectOnce'
import { APP_ROOT_ID, ROOT_MINIMIZE_CONTAINER_ID } from '@/constants'
import debounce from 'lodash-es/debounce'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const startHideInHostHandle = debounce(() => {
  const host = getCurrentDomainHost()
  if (host === 'youtube.com') {
    // youtube.com全屏播放器处理
    // sidebar
    if (document.documentElement.style.position === 'relative') {
      document.documentElement.style.position = 'unset'
      document
        .querySelector(`#${APP_ROOT_ID}`)
        ?.classList.replace('open', 'close')
    }
    // quick access
    const minimizeApp = document.querySelector(
      `#${ROOT_MINIMIZE_CONTAINER_ID}`,
    ) as HTMLDivElement
    if (minimizeApp) {
      minimizeApp.style.display = 'none'
    }
  }
}, 100)
const stopHideInHostHandle = debounce(() => {
  {
    const host = getCurrentDomainHost()
    if (host === 'youtube.com') {
      // youtube.com全屏播放器处理
      // sidebar
      if (document.documentElement.style.position === 'unset') {
        document.documentElement.style.position = 'relative'
        document
          .querySelector(`#${APP_ROOT_ID}`)
          ?.classList.replace('close', 'open')
      }
      // quick access
      const minimizeApp = document.querySelector(
        `#${ROOT_MINIMIZE_CONTAINER_ID}`,
      ) as HTMLDivElement
      if (minimizeApp) {
        minimizeApp.style.display = ''
      }
    }
  }
}, 100)

const useHideInHost = () => {
  const host = getCurrentDomainHost()
  useEffectOnce(() => {
    if (host === 'youtube.com') {
      // 全屏模式需要隐藏quick access
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target) {
            const target = mutation.target as HTMLDivElement
            if (target.hasAttribute('scrolling')) {
              startHideInHostHandle()
            } else {
              stopHideInHostHandle()
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
}
export default useHideInHost
