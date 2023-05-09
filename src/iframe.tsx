import Log from '@/utils/Log'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { v4 as uuidV4 } from 'uuid'
const isInIframe = () => {
  try {
    return window.self !== window.top
  } catch (e) {
    // 如果跨域访问iframe，则会抛出异常
    return true
  }
}

const log = new Log('Iframe')
const initIframe = async () => {
  if (!isInIframe()) {
    return
  }
  // NOTE: iframeId 的意义是因为在跨域的情况下，无法传递或者获取iframe窗体的引用值，所以需要一个定位的id
  const iframeId = uuidV4()
  // NOTE: markerId 的意义是因为在iframe中，无法通过getSelection()获取到input或者textarea的引用
  const markerId = uuidV4()
  // NOTE: 保存鼠标按下的时候的元素是什么, 因为mouseup的时候target不一定还在input或者textArea内
  let mouseDownElement: null | HTMLInputElement | HTMLTextAreaElement = null
  log.info('init')
  document.documentElement.setAttribute('data-usechatgpt-iframe-id', iframeId)
  // 鼠标点击事件和键盘事件
  const handleClickOrKeyUp = (event: MouseEvent | KeyboardEvent) => {
    const target = mouseDownElement || (event.target as HTMLElement)
    // 释放mouseDownElement
    mouseDownElement = null
    // remove all marker
    const prevMarkers = document.querySelectorAll(
      `[data-usechatgpt-marker-id="${markerId}"]`,
    )
    if (prevMarkers) {
      prevMarkers.forEach((marker) =>
        marker.removeAttribute('data-usechatgpt-marker-id'),
      )
    }
    const rect = target.getBoundingClientRect()
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      target.setAttribute('data-usechatgpt-marker-id', markerId)
    }
    log.info('iframe rect', rect, target)
    // // 发送iframeId和markerId给父级
    // window.parent.postMessage(
    //   {
    //     id: CHROME_EXTENSION_POST_MESSAGE_ID,
    //     type: event instanceof MouseEvent ? 'mouseup' : 'keyup',
    //     target: {
    //       tagName: target.tagName,
    //       id: target.id,
    //       iframeId,
    //       markerId,
    //       className: target.className,
    //       rect: {
    //         x: rect.x,
    //         y: rect.y,
    //         width: rect.width,
    //         height: rect.height,
    //       },
    //     },
    //   },
    //   '*',
    // )
  }
  // 鼠标按下事件
  const handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLInputElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      mouseDownElement = target
    }
  }
  document.addEventListener('mousedown', handleMouseDown)
  // 注入点击事件并且透传到父页面
  document.addEventListener('mouseup', handleClickOrKeyUp)
  // 注入keyup事件并且透传到父页面
  document.addEventListener('keyup', handleClickOrKeyUp)
  // embed页面初始化
  if (window.location.href.indexOf('usechatgpt.ai')) {
    const inVisibleDiv = document.createElement('div')
    inVisibleDiv.id = 'USE_CHAT_GPT_AI_ROOT'
    inVisibleDiv.style.display = 'none'
    inVisibleDiv.style.zIndex = '-1'
    inVisibleDiv.style.position = 'absolute'
    inVisibleDiv.style.top = '-10000px'
    inVisibleDiv.style.left = '-10000px'
    inVisibleDiv.style.width = '1px'
    inVisibleDiv.style.height = '1px'
    inVisibleDiv.style.overflow = 'hidden'
    inVisibleDiv.style.opacity = '0'
    inVisibleDiv.style.pointerEvents = 'none'
    inVisibleDiv.innerText = `usechatgpt init success`
    document.body.appendChild(inVisibleDiv)
  }
}

initIframe()
