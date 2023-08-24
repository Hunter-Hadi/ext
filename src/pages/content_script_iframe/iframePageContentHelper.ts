import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { createClientMessageListener } from '@/background/utils'

/**
 * 判断是否需要获取iframe中的内容，在特殊的网站中，iframe中的内容才是我们需要的，例如：
 * outlook\icloud mail
 */
export const isNeedGetIframePageContent = () => {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  if (!url) {
    return false
  }
  return ['onedrive.live.com/edit.aspx', 'icloud.com/mail'].find((website) =>
    url.includes(website),
  )
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
          pageContent =
            (doc.querySelector('#PageContentContainer') as HTMLDivElement)
              ?.innerText || ''
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
        msg.id === CHROME_EXTENSION_POST_MESSAGE_ID &&
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
