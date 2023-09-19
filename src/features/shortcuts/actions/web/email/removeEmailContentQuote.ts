/**
 * remove email content quote
 * @param emailContentHtmlElement
 */
import { getCurrentDomainHost } from '@/utils'

export const removeEmailContentQuote = (
  emailContentHtmlElement: HTMLElement,
) => {
  if (!emailContentHtmlElement) {
    return ''
  }
  const cloneElement = emailContentHtmlElement.cloneNode(true) as HTMLElement
  // exchange br to '/n'
  Array.from(cloneElement.querySelectorAll('br')).forEach((br) => {
    br.replaceWith('\n\n')
  })
  const needRemoveElements: Element[] = []
  const host = getCurrentDomainHost()
  if (host === 'mail.google.com') {
    // remove gmail quote
    needRemoveElements.push(
      ...Array.from(cloneElement.querySelectorAll('.adL')),
    )
    // remove gmail quote
    needRemoveElements.push(
      ...Array.from(cloneElement.querySelectorAll('.adm')).map(
        (adm) => (adm as HTMLDivElement).parentElement as Element,
      ),
    )
    // remove gmail quote
    needRemoveElements.push(
      ...Array.from(cloneElement.querySelectorAll('.gmail_quote')),
    )
    // remove origin email link
    // [メッセージの一部が表示されています]  メッセージ全体を表示
    // [显示部分消息] 显示整个消息
    needRemoveElements.push(...Array.from(cloneElement.querySelectorAll('.iX')))
  }
  cloneElement.querySelectorAll('div[id]').forEach((div) => {
    // lark quote - id="m_-2663600298541720984lark-mail-quote-169502630"
    if (div.id.includes('mail-quote')) {
      needRemoveElements.push(div)
      return
    }
    // outlook - m_-8603725989121141173divRplyFwdMsg
    if (div.id.includes('RplyFwdMsg')) {
      needRemoveElements.push(div.nextElementSibling as Element)
      needRemoveElements.push(div)
      return
    }
  })
  cloneElement.querySelectorAll('div[class]').forEach((div) => {
    // gmail - x_gmail_quote
    if (div.className.includes('gmail_quote')) {
      needRemoveElements.push(div)
      return
    }
  })
  console.log('removeEmailContentQuote needRemoveElements', needRemoveElements)
  needRemoveElements.forEach((element) => {
    try {
      element.remove()
    } catch (e) {
      console.error(e)
    }
  })
  return cloneElement.innerText
}
