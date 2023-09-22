import { getCurrentDomainHost } from '@/utils'

export const findSelectorParent = (
  selector: string,
  startElement: HTMLElement,
  maxDeep = 20,
) => {
  let parent: HTMLElement = startElement
  let deep = 0
  while (deep < maxDeep && !parent.querySelector(selector)) {
    parent = parent?.parentElement as HTMLElement
    deep++
  }
  return (parent.querySelector(selector) as HTMLElement) || null
}

export const getTwitterInputAssistantButtonRootContainer = (
  inputAssistantButton: HTMLElement,
) => {
  const progressElements = Array.from(
    document.querySelectorAll('div[role="progressbar"]'),
  ) as HTMLProgressElement[]
  let rootContainer: HTMLElement | null = null
  for (let i = 0; i < progressElements.length; i++) {
    const progressElement = progressElements[i]
    if (progressElement.parentElement?.contains(inputAssistantButton)) {
      rootContainer = progressElement.parentElement as HTMLElement
      break
    }
  }
  return rootContainer
}

export const getSocialMediaPostContent = (
  inputAssistantButtonElementSelector: string,
) => {
  const inputAssistantButton = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement
  if (!inputAssistantButton) {
    return ''
  }
  const host = getCurrentDomainHost()
  if (host === 'twitter.com') {
    const tweetRoot = findSelectorParent(
      'article[data-testid="tweet"]',
      inputAssistantButton,
    )
    if (tweetRoot) {
      const userInfo = tweetRoot.querySelector(
        'div[data-testid="User-Name"]',
      ) as HTMLDivElement
      const [nickName, userName] = Array.from(
        userInfo?.querySelectorAll('span'),
      )
        .map((element) => element.textContent || '')
        .filter((textContent) => textContent && textContent !== '·')
      const date = tweetRoot?.querySelector('time')?.dateTime || ''
      console.log(nickName, userName, date)
      const tweetText = (tweetRoot.querySelector(
        'div[data-testid="tweetText"]',
      ) as HTMLDivElement).innerText
      return `Nickname: ${nickName}\nUsername: @${userName}\nDate: ${date}\nPost/message: \n${tweetText}`
    }
  }
  return ''
}

export const getSocialMediaPostContentOrDraft = (
  inputAssistantButtonElementSelector: string,
) => {
  const host = getCurrentDomainHost()
  const inputAssistantButton = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement
  if (!inputAssistantButton) {
    return ''
  }
  if (host === 'twitter.com') {
    const twitterDraftEditor = findSelectorParent(
      'div.DraftEditor-editorContainer',
      inputAssistantButton,
      30,
    )
    return (twitterDraftEditor as HTMLDivElement)?.innerText || ''
  }
  return ''
}
