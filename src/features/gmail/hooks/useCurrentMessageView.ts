import { useRecoilValue } from 'recoil'
import { useEffect, useRef, useState } from 'react'
import { InboxEditState, InboxThreadViewState } from '@/features/gmail/store'
import { deepCloneGmailMessageElement } from '@/features/gmail/utils'
import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { MessageView } from '@inboxsdk/core'

const useCurrentMessageView = () => {
  const { resetConversation } = useMessageWithChatGPT()
  const { currentMessageId } = useRecoilValue(InboxEditState)
  const inboxThreadView = useRecoilValue(InboxThreadViewState)
  const currentMessageViewRef = useRef<MessageView | null>(null)
  const [currentMessageView, setCurrentMessageView] = useState<
    MessageView | undefined
  >(undefined)
  const [messageViewText, setMessageViewText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const getMessageViewText = (messageViewElement?: HTMLElement) => {
    const bodyElement =
      messageViewElement || currentMessageViewRef.current?.getBodyElement()
    if (!bodyElement) {
      return ''
    }
    // 解析邮件正文
    // 目前发现两种格式：
    //    1. gmail的来回邮件
    //    2. 第三方的来回邮件
    // 去掉quote的元素
    const { cloneElement, quoteInnerHTML }: any =
      deepCloneGmailMessageElement(bodyElement)
    if (cloneElement || quoteInnerHTML) {
      let innerText = ((cloneElement as HTMLElement)?.innerHTML || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?div[^>]*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\u00ad/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\n{3,}/g, `\n`)
        // .replace(/\t+/g, '	')
        // .replace(/[\n\t]+/g, ``)
        // .replace(/[\t\n]+/g, ``)
        .trim()
      if (innerText === '' && quoteInnerHTML) {
        innerText = quoteInnerHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/?div[^>]*>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/\u00ad/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/\n{3,}/g, `\n`)
          // .replace(/\t+/g, '	')
          // .replace(/[\n\t]+/g, ``)
          // .replace(/[\t\n]+/g, ``)
          .trim()
      }
      // console.log(innerText)
      // 附件
      // attachment
      const attachmentFiles =
        (
          currentMessageViewRef.current || (currentMessageView as any)
        )?.getFileAttachmentCardViews() || []
      if (attachmentFiles.length > 0) {
        innerText += `\n${attachmentFiles.length} attachment${
          attachmentFiles.length > 1 ? 's' : ''
        }`
        attachmentFiles.forEach((attachmentFile: any) => {
          try {
            const filename = attachmentFile.getTitle()
            innerText += `\n- ${filename}`
          } catch (e) {
            console.error('get attachmentFile name error:\t', e)
          }
        })
      }
      return innerText
      // console.log('match message innerText', innerText)
    }
    return ''
  }
  useEffect(() => {
    if (currentMessageId) {
      if (inboxThreadView.getInstance) {
        const inboxThreadViewInstance = inboxThreadView.getInstance()
        for (const messageView of inboxThreadViewInstance.getMessageViews()) {
          messageView.getMessageIDAsync().then((messageId: any) => {
            if (messageId && messageId === currentMessageId) {
              setCurrentMessageView(messageView)
              currentMessageViewRef.current = messageView
            }
          })
        }
      }
    } else {
      currentMessageViewRef.current = null
      setCurrentMessageView(undefined)
      setMessageViewText('')
    }
  }, [currentMessageId, inboxThreadView])
  const prevMessageId = useRef(currentMessageId)
  useEffect(() => {
    if (currentMessageId) {
      if (prevMessageId.current !== currentMessageId) {
        resetConversation()
      }
      prevMessageId.current = currentMessageId
      try {
        setLoading(true)
        const innerText = getMessageViewText(
          currentMessageView?.getBodyElement(),
        )
        if (innerText === '') {
          // TODO: 把匹配不到message的html发送到后台
          // alert('没有匹配到message!')
          setMessageViewText('')
        } else {
          setMessageViewText(innerText)
        }
      } catch (e) {
        console.error('parse gmail message error: \t', e)
      } finally {
        setLoading(false)
      }
    } else {
      setMessageViewText('')
    }
  }, [currentMessageView, currentMessageId])

  return {
    currentMessageView,
    loading: !currentMessageId || loading,
    getMessageViewText,
    currentMessageViewRef,
    messageViewText,
    currentMessageId,
  }
}
export { useCurrentMessageView }
