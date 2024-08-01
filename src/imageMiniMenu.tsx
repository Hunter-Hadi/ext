import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ImageMiniMenu } from '@/features/imageMiniMenu'

export type IImageMiniMenuAppInstance = ReturnType<typeof createAppInstance>

// 创建单实例
function createAppInstance() {
  if (appInstance) {
    return
  }
  const CHAT_WITH_IMAGE_ROOT_ID = 'chat-with-image-root'
  let rootEl = document.getElementById(CHAT_WITH_IMAGE_ROOT_ID)
  if (!rootEl) {
    rootEl = document.createElement('div')
  }
  rootEl.id = CHAT_WITH_IMAGE_ROOT_ID
  document.documentElement.appendChild(rootEl)

  function createApp() {
    const app = createRoot(rootEl!)
    app.render(
      <StrictMode>
        <ImageMiniMenu />
      </StrictMode>,
    )
    return app
  }

  // 鼠标进入组件
  rootEl.addEventListener('mouseenter', () => {
    instance.mouseIsInComponent = true
  })

  // 鼠标离开组件
  rootEl.addEventListener('mouseleave', () => {
    instance.mouseIsInComponent = false
    if (!instance.mouseIsInImage) {
      instance.hide()
    }
  })

  const instance = {
    rootEl,

    currentHoverImage: null as HTMLImageElement | null,

    /**
     * 鼠标指针是否在组件内
     */
    mouseIsInComponent: false,

    /**
     * 鼠标指针是否在图片内
     */
    mouseIsInImage: false,

    show() {
      rootEl.style.display = 'block'
    },

    hide() {
      rootEl.style.display = 'none'
    },

    reactApp: createApp(),
  }
  return instance
}

function injectImageMiniMenu() {
  if (!appInstance) {
    return
  }
  // 根据图片计算位置
  function calcComponentPositionByImage(img: HTMLImageElement) {
    const rect = img.getBoundingClientRect()
    console.log('img rect: ', rect)
    if (appInstance) {
      appInstance.rootEl.style.setProperty(
        '--chat-with-image-bottom',
        rect.bottom + 'px',
      )
      appInstance.rootEl.style.setProperty(
        '--chat-with-image-left',
        rect.left + 'px',
      )
    }
  }

  let timerHideApp: ReturnType<typeof setTimeout> | null = null

  // 遍历页面上的所有图片元素
  Array.from(document.querySelectorAll('img')).forEach((img) => {
    // 网页滚动时，重新定位
    function handleWindowScroll() {
      calcComponentPositionByImage(img)
    }

    // 鼠标进入图片
    img.addEventListener('mouseenter', () => {
      timerHideApp && clearTimeout(timerHideApp)
      window.removeEventListener('scroll', handleWindowScroll)

      appInstance.currentHoverImage = img
      appInstance.mouseIsInImage = true
      appInstance.show()
      calcComponentPositionByImage(img)

      window.addEventListener('scroll', handleWindowScroll)
    })

    // 鼠标离开图片
    img.addEventListener('mouseleave', () => {
      timerHideApp = setTimeout(() => {
        appInstance.mouseIsInImage = false
        if (!appInstance.mouseIsInComponent) {
          appInstance.hide()
        }
        window.removeEventListener('scroll', handleWindowScroll)
      }, 50)
    })
  })
}

const appInstance: IImageMiniMenuAppInstance = createAppInstance()!
window.ImageMiniMenuAppInstance = appInstance

injectImageMiniMenu()
