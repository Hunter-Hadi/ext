import Log from '@/utils/Log'
import { CHROME_EXTENSION_POST_MESSAGE_ID, isProduction } from '@/types'
import {
  createSelectionMarker,
  getCaretCharacterOffsetWithin,
  replaceMarkerContent,
} from '@/features/contextMenu/utils/selectionHelper'
import Browser from 'webextension-polyfill'
import { v4 } from 'uuid'
import {
  IRangyRect,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
const iframeId = v4()

const getEditableElementContext = (
  element: HTMLElement,
  defaultMaxLoop = 10,
) => {
  if (!element) {
    return {
      isEditableElement: false,
      editableElement: null,
    }
  }
  let parentElement: HTMLElement | null = element
  let editableElement: HTMLInputElement | null = null
  let maxLoop = defaultMaxLoop
  while (parentElement && maxLoop > 0) {
    if (
      parentElement?.tagName === 'INPUT' ||
      parentElement?.tagName === 'TEXTAREA' ||
      parentElement?.getAttribute?.('contenteditable') === 'true'
    ) {
      const type = parentElement.getAttribute('type')
      if (type && type !== 'text') {
        break
      }
      editableElement = parentElement as any
      break
    }
    parentElement = parentElement.parentElement
    maxLoop--
  }
  if (editableElement) {
    return {
      isEditableElement: true,
      editableElement,
    }
  }
  return {
    isEditableElement: false,
    editableElement: null,
  }
}

const cloneRect = (rect: IRangyRect): IRangyRect => {
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width: rect.width || rect.right - rect.left,
    height: rect.height || rect.bottom - rect.top,
    x: rect.x || rect.left,
    y: rect.y || rect.top,
  }
}

const isInIframe = () => {
  try {
    return window.self !== window.top
  } catch (e) {
    // 如果跨域访问iframe，则会抛出异常
    return true
  }
}
const computedSelectionString = () => {
  if (document) {
    if (document.getSelection) {
      // Most browsers
      return String(document.getSelection())
    } else if ((document as any).selection) {
      // Internet Explorer 8 and below
      return (document as any).selection.createRange().text
    } else if (window.getSelection) {
      // Safari 3
      return String(window.getSelection())
    }
  }
  /* Fall-through. This could happen if this function is called
       on a frame that doesn't exist or that isn't ready yet. */
  return ''
}

const log = new Log('Iframe')

const initIframe = async () => {
  if (!isInIframe()) {
    return
  }
  let mouseDownElement: null | HTMLInputElement | HTMLTextAreaElement = null
  let positions: number[] = []
  let isEmbedPage = false
  // 鼠标点击事件和键盘事件
  const handleClickOrKeyUp = (event: MouseEvent | KeyboardEvent, times = 0) => {
    try {
      const target = mouseDownElement || (event.target as HTMLElement)
      const iframeSelectionString = computedSelectionString()
      let editableElementSelectionString = ''
      const { isEditableElement, editableElement } =
        getEditableElementContext(target)
      let startMarkerId = ''
      let endMarkerId = ''
      let caretOffset = 0
      if (isEditableElement && editableElement) {
        caretOffset = getCaretCharacterOffsetWithin(editableElement)
        const selectionMarker = createSelectionMarker(editableElement)
        startMarkerId = selectionMarker.startMarkerId
        endMarkerId = selectionMarker.endMarkerId
        // 如果是输入框，则获取输入框选中的文本的值，否则用输入框的内容
        if (selectionMarker.selectionString) {
          console.log('AIInput marker string', selectionMarker.selectionString)
          editableElementSelectionString = selectionMarker.selectionString
        }
      }
      if (!iframeSelectionString && isEmbedPage) {
        if (target.tagName === 'BUTTON' && times < 10) {
          setTimeout(() => {
            handleClickOrKeyUp(event, times + 1)
          }, 100)
        }
      }
      // 释放mouseDownElement
      mouseDownElement = null
      const windowRect = cloneRect(document.body.getBoundingClientRect())
      const targetRect = cloneRect(target.getBoundingClientRect())
      const selectionRect = window
        .getSelection()
        ?.getRangeAt(0)
        ?.getBoundingClientRect()
      // console.clear()
      // log.info('iframe windowRect:', windowRect)
      // log.info('iframe targetRect:', targetRect)
      // log.info('iframe selectionRect: ', selectionRect)
      // log.info('iframe iframeSelectionString: ', iframeSelectionString)
      // log.info('iframe screen', window.screenLeft, window.screenTop)
      let iframeSelectionRect: IRangyRect | null = null
      console.log(iframeId, iframeSelectionString)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const minLeft = Math.max(targetRect.left, 0)
        const minTop = Math.max(targetRect.top, 0)
        const maxWidth =
          (document.documentElement.clientWidth ||
            document.body.clientWidth ||
            document.body.offsetWidth) - minLeft
        const maxHeight =
          document.documentElement.clientHeight ||
          document.body.clientHeight ||
          document.body.offsetHeight
        const left = Math.max(targetRect.left, 0)
        const x = Math.max(targetRect.left, 0)
        const top = Math.min(minTop, maxHeight)
        const y = Math.min(minTop, maxHeight)
        // 宽度计算需要考虑是否在视窗内
        const width = Math.min(
          targetRect.left > 0
            ? targetRect.width
            : targetRect.width + targetRect.left,
          maxWidth,
        )
        // 高度计算需要考虑是否在视窗内
        const height = Math.min(
          targetRect.top > 0
            ? targetRect.height
            : targetRect.height + targetRect.top,
          maxHeight,
        )
        iframeSelectionRect = {
          left,
          x,
          top,
          y,
          width,
          height,
          right: Math.max(Math.min(targetRect.width, maxWidth), maxWidth),
          bottom: Math.min(targetRect.bottom, maxHeight),
        }
        // 这里有点特殊，高度应该是iframe高度减去top的值和元素实际的高度做比较
        iframeSelectionRect.height = Math.min(
          maxHeight - iframeSelectionRect.top,
          iframeSelectionRect.height,
        )
      } else if (selectionRect) {
        const minLeft = Math.max(selectionRect.left, 0)
        const minTop = Math.max(selectionRect.top, 0)
        const maxWidth =
          (document.documentElement.clientWidth ||
            document.body.clientWidth ||
            document.body.offsetWidth) - minLeft
        const maxHeight =
          document.documentElement.clientHeight ||
          document.body.clientHeight ||
          document.body.offsetHeight
        const left = Math.max(selectionRect.left, 0)
        const x = Math.max(selectionRect.left, 0)
        const top = Math.min(minTop, maxHeight)
        const y = Math.min(minTop, maxHeight)
        iframeSelectionRect = {
          left,
          x,
          top,
          y,
          width: Math.min(selectionRect.width, maxWidth),
          height: Math.min(selectionRect.height, maxHeight),
          right: Math.max(Math.min(selectionRect.right, maxWidth), maxWidth),
          bottom: Math.min(selectionRect.bottom, maxHeight),
        }
        // 这里有点特殊，高度应该是iframe高度减去top的值和元素实际的高度做比较
        iframeSelectionRect.height = Math.min(
          maxHeight - iframeSelectionRect.top,
          iframeSelectionRect.height,
        )
      }
      const iframePosition = [
        positions[0] - window.screenLeft,
        positions[1] - window.screenTop,
      ]
      // console.log('iframe currentRect', currentRect, iframePosition)
      // if (currentRect) {
      //   // draw box
      //   const old = document.getElementById('a')
      //   old && old.remove()
      //   const div = document.createElement('div')
      //   div.id = 'a'
      //   div.style.position = 'fixed'
      //   div.style.top = currentRect.top + 'px'
      //   div.style.left = currentRect.left + 'px'
      //   div.style.width = currentRect.width - 2 + 'px'
      //   div.style.height = currentRect.height - 2 + 'px'
      //   div.style.border = '1px solid red'
      //   div.style.pointerEvents = 'none'
      //   document.body.appendChild(div)
      // }
      // 发送iframeId和markerId给父级
      window.parent.postMessage(
        {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          type: 'iframeSelection',
          data: {
            virtual: true,
            iframeId,
            tagName: target.tagName,
            id: target.id,
            className: target.className,
            windowRect,
            targetRect,
            selectionRect,
            iframeSelectionRect,
            iframePosition,
            selectionText: iframeSelectionString || '',
            selectionHTML: iframeSelectionString || '',
            editableElementSelectionText: editableElementSelectionString,
            eventType: event instanceof MouseEvent ? 'mouseup' : 'keyup',
            isEmbedPage,
            isEditableElement,
            caretOffset,
            startMarkerId,
            endMarkerId,
          } as IVirtualIframeSelectionElement,
        },
        '*',
      )
    } catch (e) {
      log.error(e)
    }
  }
  // 鼠标按下事件
  const handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLInputElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      mouseDownElement = target
    }
    positions = [event.screenX, event.screenY]
  }
  document.addEventListener('mousedown', handleMouseDown)
  // 注入点击事件并且透传到父页面
  document.addEventListener('mouseup', handleClickOrKeyUp)
  // 注入keyup事件并且透传到父页面
  document.addEventListener('keyup', handleClickOrKeyUp)
  // embed页面初始化
  if (window.location.href.indexOf('usechatgpt.ai/embed') > -1) {
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
    // inVisibleDiv.innerText = `usechatgpt init success`
    document.body.appendChild(inVisibleDiv)
    isEmbedPage = true
  }
  Browser.runtime.onMessage.addListener((message, sender) => {
    if (sender.id === Browser.runtime.id) {
      if (message.event === 'Client_listenUpdateIframeInput') {
        const data = message.data
        console.log(iframeId, 'Client_listenUpdateIframeInput', data)
        if (data.startMarkerId && data.endMarkerId) {
          replaceMarkerContent(
            data.startMarkerId,
            data.endMarkerId,
            data.value,
            data.type,
          )
        }
      }
    }
  })
}

type IframeMessageType = (event: IVirtualIframeSelectionElement) => void

export const listenIframeMessage = (onMessage?: IframeMessageType) => {
  const listener = (event: MessageEvent) => {
    const { id, type, data } = event.data
    if (id === CHROME_EXTENSION_POST_MESSAGE_ID) {
      if (type === 'iframeSelection') {
        const { selectionText, iframeSelectionRect, iframePosition } =
          data as IVirtualIframeSelectionElement
        if (isInIframe()) {
          // TODO
          // 如果是iframe，需要继续透传
        } else {
          if (!onMessage) {
            return
          }
          // bookmark height
          const bookmarkHeight = window.outerHeight - window.innerHeight
          // log.info('bookmarkHeight', bookmarkHeight)
          const currentPosition = [
            iframePosition[0],
            Math.max(iframePosition[1] - bookmarkHeight, 0),
          ]
          const pageIframes = document.querySelectorAll('iframe')
          let senderIframeTop = 0
          let senderIframeLeft = 0
          const senderIframe = Array.from(pageIframes).find((iframe) => {
            const iframeRect = iframe.getBoundingClientRect()
            if (iframeRect) {
              const { left, top, width, height } = iframeRect
              if (
                currentPosition[0] >= left &&
                currentPosition[0] <= left + width
              ) {
                if (
                  currentPosition[1] >= top &&
                  currentPosition[1] <= top + height
                ) {
                  senderIframeTop = top
                  senderIframeLeft = left
                  return true
                }
              }
            }
            return false
          })
          if (senderIframe) {
            const currentSelectionRect = cloneRect(iframeSelectionRect)
            currentSelectionRect.top += senderIframeTop
            currentSelectionRect.y = senderIframeTop
            currentSelectionRect.left += senderIframeLeft
            currentSelectionRect.x += senderIframeLeft
            log.info(
              'currentSelection',
              senderIframe,
              selectionText,
              currentPosition,
              currentSelectionRect,
            )
            if (currentSelectionRect) {
              if (selectionText && !isProduction) {
                // draw box
                const old = document.getElementById('a')
                old && old.remove()
                const div = document.createElement('div')
                div.id = 'a'
                div.style.position = 'fixed'
                div.style.top = currentSelectionRect.top + 'px'
                div.style.left = currentSelectionRect.left + 'px'
                div.style.width = currentSelectionRect.width + 'px'
                div.style.height = currentSelectionRect.height + 'px'
                div.style.border = '1px solid red'
                div.style.pointerEvents = 'none'
                document.body.appendChild(div)
              }
              onMessage({
                ...data,
                iframeSelectionRect: currentSelectionRect,
                iframePosition: currentPosition,
                isEmbedPage:
                  event.origin.indexOf('usechatgpt.ai') > -1 &&
                  data.isEmbedPage,
              })
            }
          }
        }
      }
    }
  }
  window.addEventListener('message', listener)
  return () => {
    window.removeEventListener('message', listener)
  }
}

initIframe()
