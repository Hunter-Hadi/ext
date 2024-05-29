import debounce from 'lodash-es/debounce'

import {
  MAXAI_APP_ROOT_ID,
  MAXAI_MINIMIZE_CONTAINER_ID,
} from '@/features/common/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { isShowChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const startHideInHostHandle = debounce(() => {
  const host = getCurrentDomainHost()
  if (host === 'youtube.com') {
    // youtube.com全屏播放器处理
    // sidebar
    if (isShowChatBox()) {
      // sidebar打开会给body加上relative
      document.body.style.position = ''
    }
    if (document.documentElement.style.position === 'relative') {
      document.documentElement.style.position = 'unset'
      document
        .querySelector(`#${MAXAI_APP_ROOT_ID}`)
        ?.classList.replace('open', 'close')
    }
    // quick access
    const minimizeApp = document.querySelector(
      `#${MAXAI_MINIMIZE_CONTAINER_ID}`,
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
          .querySelector(`#${MAXAI_APP_ROOT_ID}`)
          ?.classList.replace('close', 'open')
      }
      if (isShowChatBox()) {
        // sidebar打开需要给body重新加上relative
        document.body.style.position = 'relative'
      }
      // quick access
      const minimizeApp = document.querySelector(
        `#${MAXAI_MINIMIZE_CONTAINER_ID}`,
      ) as HTMLDivElement
      if (minimizeApp) {
        minimizeApp.style.display = ''
      }
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 300)
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
