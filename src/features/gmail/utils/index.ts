export const findParentElementWithAttribute = (
  element: HTMLElement,
  attributeName: string,
) => {
  let parentElement = element.parentElement

  let maxLoop = 10
  while (parentElement && maxLoop > 0) {
    const findElement = parentElement.querySelector(`div[${attributeName}]`)
    if (findElement) {
      if (parentElement?.tagName === 'BODY') {
        return null
      }
      return findElement
    }
    parentElement = parentElement.parentElement
    maxLoop--
  }
  return null
}
export const getComposeViewMessageId = (composeViewElement: HTMLElement) => {
  return (
    findParentElementWithAttribute(
      composeViewElement,
      'data-legacy-message-id',
    )?.getAttribute('data-legacy-message-id') || ''
  )
}

/**
 * 因为gmail的邮件内容是动态加载的，所以需要递归查找
 * @param element
 * @return {HTMLElement}
 */
export const deepFindGmailMessageElement = (
  element: HTMLElement,
): HTMLElement => {
  while (element && element.querySelector('div[dir]')) {
    element = element.querySelector('div[dir]') as HTMLElement
  }
  return element
}

const FILTER_GMAIL_QUOTE_CLASS = ['gmail_quote']
const FILTER_GMAIL_QUOTE_ID = ['mail-quote']
export const deepCloneGmailMessageElement = (
  element: HTMLElement,
  filterQuoteElement = true,
) => {
  let quoteInnerHTML = ''
  const cloneElement = element.cloneNode(true) as HTMLElement
  const cloneElementChildren = cloneElement.querySelectorAll('*')
  const elementChildren = element.querySelectorAll('*')
  for (let i = 0; i < cloneElementChildren.length; i++) {
    const cloneElementChild = cloneElementChildren[i]
    if (cloneElementChild.tagName === 'DIV' && filterQuoteElement) {
      if (
        FILTER_GMAIL_QUOTE_CLASS.some((className) =>
          cloneElementChild.classList.contains(className),
        )
      ) {
        // console.log('find gmail quote tag')
        if (!quoteInnerHTML) {
          quoteInnerHTML = (cloneElementChild as HTMLElement).innerHTML
        }
        cloneElementChild.remove()
        continue
      }
      if (
        FILTER_GMAIL_QUOTE_ID.some(
          (id) => cloneElementChild.id.indexOf(id) > -1,
        )
      ) {
        // console.log('find third party quote tag')
        if (!quoteInnerHTML) {
          quoteInnerHTML = (cloneElementChild as HTMLElement).innerHTML
        }
        cloneElementChild.remove()
        continue
      }
    }
    const elementChild = elementChildren[i]
    if (elementChild) {
      const attributes = elementChild.attributes
      for (let j = 0; j < attributes.length; j++) {
        const attribute = attributes[j]
        cloneElementChild.setAttribute(attribute.name, attribute.value)
      }
    }
  }
  return {
    cloneElement,
    quoteInnerHTML,
  }
}

export const gmailReplyBoxInsertText = (
  gmailReplyBoxElement: HTMLElement,
  text: string,
) => {
  const bodyFirstElement = gmailReplyBoxElement.firstElementChild
  const newBodyHTML = // eslint-disable-next-line no-control-regex
    text.replace(new RegExp('\r?\n', 'g'), '<br />') + '<br />'
  if (bodyFirstElement && bodyFirstElement.tagName === 'DIV') {
    bodyFirstElement.innerHTML = newBodyHTML
  } else if (bodyFirstElement && bodyFirstElement.tagName === 'BR') {
    const div = document.createElement('div')
    div.style.direction = gmailReplyBoxElement.style.direction
    div.innerHTML = `${newBodyHTML}<br>`
    gmailReplyBoxElement.insertBefore(div, bodyFirstElement)
  } else {
    const div = document.createElement('div')
    div.style.direction = gmailReplyBoxElement.style.direction
    div.innerHTML = `${newBodyHTML}<br>`
    gmailReplyBoxElement.insertBefore(div, bodyFirstElement)
  }
}
