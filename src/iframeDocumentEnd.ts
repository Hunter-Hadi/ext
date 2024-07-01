import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import debounce from 'lodash-es/debounce'
import { v4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { createClientMessageListener } from '@/background/utils'
import {
  isProduction,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import {
  IRangyRect,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
import {
  getOfficeWordEditElement,
  getOfficeWordSelectedElements,
  getOfficeWordSelectionRect,
  isOfficeWordEditing,
  isOfficeWordEditorFrame,
} from '@/features/contextMenu/utils/microsoftWordHelper'
import {
  computedSelectionString,
  createSelectionMarker,
  getCaretCharacterOffsetWithin,
  getEditableElement,
  replaceMarkerContent,
} from '@/features/contextMenu/utils/selectionHelper'
import Log from '@/utils/Log'
dayjs.extend(utc)

const iframeId = v4()

const log = new Log('Iframe')

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

const isBlockUrlList = () => {
  if (window.frameElement?.classList.contains('docs-texteventtarget-iframe')) {
    // google doc的inputElement元素所在的iframe下禁止发送message
    return true
  }
  return [
    // github的react-code-view的pdf reader会响应插件发送的message并认为是异常
    'https://viewscreen.githubusercontent.com/view/pdf',
    'https://notebooks.githubusercontent.com/view',
  ].find((matchUrl) => window.location.href.startsWith(matchUrl))
}

const initIframe = async () => {
  if (!isInIframe()) {
    return
  }
  if (isBlockUrlList()) {
    log.info('block list', window.location.href)
    return
  }
  log.info('Init iframe')
  listenerClientMessage()
  let mouseDownElement: null | HTMLInputElement | HTMLTextAreaElement = null
  let positions: number[] = []
  let isEmbedPage = false
  // 鼠标点击事件和键盘事件
  const handleClickOrKeyUp = (event: MouseEvent | KeyboardEvent, times = 0) => {
    try {
      const target = mouseDownElement || (event.target as HTMLElement)
      let selectionText = computedSelectionString()
      let editableElementSelectionString = ''
      const { isEditableElement, editableElement } = getEditableElement(target)
      let startMarkerId = ''
      let endMarkerId = ''
      let caretOffset = 0
      if (isEditableElement && editableElement) {
        caretOffset = getCaretCharacterOffsetWithin(editableElement)
        const selectionMarker = createSelectionMarker(editableElement)
        startMarkerId = selectionMarker.startMarkerId
        endMarkerId = selectionMarker.endMarkerId
        selectionText = selectionMarker.selectionText
        editableElementSelectionString =
          selectionMarker.editableElementSelectionText
      }
      if (!selectionText && isEmbedPage) {
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
      let selectionRect = window
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
      if (isOfficeWordEditorFrame() && isOfficeWordEditing()) {
        // office docs 从上往下选择时，位置获取错误整体往下偏移，此处以selected元素为准
        selectionRect =
          (getOfficeWordSelectionRect() as DOMRect) || selectionRect
      }
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
      // if (selectionRect) {
      //   // draw box
      //   const old = document.getElementById('a')
      //   old && old.remove()
      //   const div = document.createElement('div')
      //   div.id = 'a'
      //   div.style.position = 'fixed'
      //   div.style.top = selectionRect.top + 'px'
      //   div.style.left = selectionRect.left + 'px'
      //   div.style.width = selectionRect.width - 2 + 'px'
      //   div.style.height = selectionRect.height - 2 + 'px'
      //   div.style.border = '1px solid red'
      //   div.style.pointerEvents = 'none'
      //   document.body.appendChild(div)
      // }
      // 发送iframeId和markerId给父级
      window.parent.postMessage(
        {
          id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
            selectionText: selectionText || '',
            selectionHTML: selectionText || '',
            editableElementSelectionText: editableElementSelectionString,
            editableElementSelectionHTML: editableElementSelectionString,
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
  if (window.location.href.indexOf('maxai.me/embed') > -1) {
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
  // office docs页面初始化
  if (isOfficeWordEditorFrame()) {
    const editPanel = document.querySelector('#WACViewPanel') as HTMLDivElement
    const editElement = getOfficeWordEditElement()
    editElement?.addEventListener('focus', (event) => {
      // 获取到焦点
      handleClickOrKeyUp({
        target: event.target,
      } as KeyboardEvent)
    })
    editPanel?.addEventListener('mousedown', (event) => {
      handleMouseDown(event)
      // mousedown的时候hide menu
      const rect = document.body.getBoundingClientRect().toJSON()
      window.parent.postMessage(
        {
          id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
          type: 'iframeSelection',
          data: {
            virtual: true,
            iframeId,
            tagName: '',
            id: '',
            className: '',
            windowRect: rect,
            targetRect: rect,
            selectionRect: rect,
            iframeSelectionRect: rect,
            iframePosition: [0, 0],
            selectionText: '',
            selectionHTML: '',
            editableElementSelectionText: '',
            editableElementSelectionHTML: '',
            eventType: event instanceof MouseEvent ? 'mouseup' : 'keyup',
            isEmbedPage: false,
            isEditableElement: true,
            caretOffset: 0,
            startMarkerId: '',
            endMarkerId: '',
          } as IVirtualIframeSelectionElement,
        },
        '*',
      )
    })
    editPanel?.addEventListener('mouseup', (event) => {
      const target = event.target as HTMLDivElement
      const rect = target.getBoundingClientRect()

      setTimeout(() => {
        if (isOfficeWordEditing()) {
          if (getOfficeWordSelectedElements().length) {
            // 有选区
            handleClickOrKeyUp({
              ...event,
              target: document.activeElement,
            })
          } else {
            // 无选区，切换光标，获取当前坐标的元素
            handleClickOrKeyUp({
              ...event,
              target: document.elementFromPoint(rect.x, rect.y),
            })
          }
        }
      }, 50)
    })
    editPanel?.addEventListener(
      'scroll',
      debounce((event) => {
        if (isOfficeWordEditing()) {
          if (getOfficeWordSelectedElements().length) {
            // 有选区，重置下位置
            handleClickOrKeyUp({
              ...event,
              target: document.activeElement,
            })
          }
        }
      }, 200),
    )
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

export const listenerClientMessage = () => {
  // TODO 获取iframe中的内容
  const doc = document.documentElement
  const iframeCurrentUrl =
    typeof window !== 'undefined' ? window.location.href : ''
  console.log('init iframePageContentHelper', iframeCurrentUrl)
  if (!iframeCurrentUrl) {
    return
  }
  createClientMessageListener(async (event, data, sender) => {
    switch (event) {
      case 'Iframe_ListenGetPageContent': {
        const { taskId } = data
        let pageContent = ''
        // Microsoft office docs
        // https://word-edit.officeapps.live.com/we/wordeditorframe.aspx
        if (
          iframeCurrentUrl.includes(
            'word-edit.officeapps.live.com/we/wordeditorframe.aspx',
          )
        ) {
          const editElement = doc.querySelector(
            '#WACViewPanel_EditingElement_WrappingDiv',
          ) as HTMLDivElement
          const hiddenParagraph = doc.querySelector(
            '#PagesContainer .HiddenParagraph',
          ) as HTMLDivElement
          const beforeDisplay = editElement?.style.display
          if (editElement) {
            editElement.style.display = 'none'
          }
          if (hiddenParagraph) {
            hiddenParagraph.classList.remove('HiddenParagraph')
          }
          pageContent =
            (doc.querySelector('#PageContentContainer') as HTMLDivElement)
              ?.innerText || ''
          if (editElement) {
            editElement.style.display = beforeDisplay
          }
          if (hiddenParagraph) {
            hiddenParagraph.classList.add('HiddenParagraph')
          }
        }
        // iCloud mail
        // https://www-mail.icloud-sandbox.com/applications/mail2-message/current/zh-cn/index.html
        if (
          iframeCurrentUrl.includes(
            'icloud-sandbox.com/applications/mail2-message',
          )
        ) {
          pageContent =
            (doc.querySelector('.mail-message-defaults') as HTMLDivElement)
              ?.innerText || ''
        }
        // mail.com
        // https://3c-lxa.mail.com/mail/client/mailbody
        if (iframeCurrentUrl.includes('mail.com/mail/client/mailbody')) {
          pageContent = doc?.ownerDocument?.body?.innerText || ''
        }
        pageContent = pageContent.trim()
        if (!pageContent) {
          return {
            success: false,
            data: '',
            message: 'no page content',
          }
        }
        console.log(taskId, pageContent, 'iframeListenGetPageContent')
        const port = new ContentScriptConnectionV2()
        await port.postMessage({
          event: 'Iframe_sendPageContent',
          data: {
            taskId,
            pageContent,
          },
        })
        return {
          success: true,
          data: '',
          message: '',
        }
      }
    }
    return undefined
  })
}

export const listenIframeMessage = (onMessage?: IframeMessageType) => {
  const listener = (event: MessageEvent) => {
    const { id, type, data } = event.data
    if (id === MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID) {
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
                selectionRect: currentSelectionRect,
                iframePosition: currentPosition,
                isEmbedPage:
                  event.origin.indexOf('maxai.me') > -1 && data.isEmbedPage,
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
