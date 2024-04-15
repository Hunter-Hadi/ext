import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { createClientMessageListener } from '@/background/utils'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'

/**
 * 判断是否需要获取iframe中的内容，在特殊的网站中，iframe中的内容才是我们需要的，例如：
 * outlook\icloud mail
 */
export const isNeedGetIframePageContent = () => {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  if (!url) {
    return false
  }
  return [
    'onedrive.live.com/edit.aspx',
    'icloud.com/mail',
    'navigator-lxa.mail.com/mail',
  ].find((website) => url.includes(website))
}

export const iframePageContentHelper = () => {
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
          const editElement = doc.querySelector('#WACViewPanel_EditingElement_WrappingDiv') as HTMLDivElement
          const hiddenParagraph = doc.querySelector('#PagesContainer .HiddenParagraph') as HTMLDivElement
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

export const getIframePageContent = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<string>(async (resolve) => {
    const port = new ContentScriptConnectionV2()
    const taskId = uuidV4()
    const result = await port.postMessage({
      event: 'Client_getIframePageContent',
      data: {
        taskId,
      },
    })
    if (!result.success) {
      resolve('')
    }
    let isResolve = false
    const listener = (msg: any) => {
      if (
        msg.id === MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID &&
        msg.event ===
          ('Client_ListenGetIframePageContentResponse' as IChromeExtensionClientListenEvent) &&
        msg.data.taskId === taskId
      ) {
        if (isResolve) {
          return
        }
        isResolve = true
        resolve(msg.data.pageContent)
        Browser.runtime.onMessage.removeListener(listener)
      }
    }
    Browser.runtime.onMessage.addListener(listener)
    // 10s超时
    setTimeout(() => {
      if (isResolve) {
        return
      }
      isResolve = true
      resolve('')
      Browser.runtime.onMessage.removeListener(listener)
    }, 10000)
  })
}
