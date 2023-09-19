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
  const needRemoveElements: Element[] = []
  const host = getCurrentDomainHost()
  if (host === 'mail.google.com') {
    // remove gmail quote
    needRemoveElements.push(
      ...Array.from(cloneElement.querySelectorAll('.adL')),
    )
    needRemoveElements.push(
      ...Array.from(cloneElement.querySelectorAll('.gmail_quote')),
    )
  }
  cloneElement.querySelectorAll('div[id]').forEach((div) => {
    // lark quote - id="m_-2663600298541720984lark-mail-quote-169502630"
    if (div.id.includes('mail-quote')) {
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
