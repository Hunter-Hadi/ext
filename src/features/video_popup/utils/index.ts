import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import {
  MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID,
  MAXAI_GLOBAL_VIDEO_POPUP_WRAPPER_ID,
} from '@/features/video_popup/constant'
import { queryShadowContainerElementSelector } from '@/utils/elementHelper'

export const openGlobalVideoPopup = async (
  videoSrc: string,
  autoplay = false,
) => {
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  await port.postMessage({
    event: 'Client_switchVideoPopup',
    data: {
      videoSrc: videoSrc,
      open: true,
      autoplay,
    },
  })
}

export const closeGlobalVideoPopup = async () => {
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  await port.postMessage({
    event: 'Client_switchVideoPopup',
    data: {
      videoSrc: '',
      open: false,
      autoplay: false,
    },
  })
}

/**
 * 判断 element 是否是 global video popup 的子元素
 */
export const isVideoPopupElementChildren = (
  element?: Element | EventTarget | null,
) => {
  if (element) {
    const globalVideoPopupWrapper = queryShadowContainerElementSelector(
      MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID,
      `#${MAXAI_GLOBAL_VIDEO_POPUP_WRAPPER_ID}`,
    )
    if (globalVideoPopupWrapper) {
      return globalVideoPopupWrapper.contains(element as Element)
    }
  }

  return false
}

/**
 * 判断 video popup 是否是打开状态
 */
export const isGlobalVideoPopupOpen = () => {
  const videoPopupContainer = document.getElementById(
    MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID,
  )
  return videoPopupContainer?.getAttribute('data-status') === 'open'
}
