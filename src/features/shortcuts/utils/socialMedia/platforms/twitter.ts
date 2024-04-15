import uniq from 'lodash-es/uniq'

import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import SocialMediaPostContext, {
  ISocialMediaPost,
} from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

/**
 * 获取Twitter消息详情
 * @param tweetElement
 */
const getTweetDetail = (tweetElement: HTMLElement): ISocialMediaPost => {
  const userInfo = tweetElement.querySelector(
    'div[data-testid="User-Name"]',
  ) as HTMLDivElement
  const [nickName, userName] = uniq(
    Array.from(userInfo?.querySelectorAll('span'))
      .map((element) => element.textContent || '')
      .filter((textContent) => textContent && textContent !== '·'),
  )
  const date = tweetElement.querySelector('time')?.dateTime || ''
  const tweetText =
    (
      tweetElement.querySelector(
        'div[data-testid="tweetText"]',
      ) as HTMLDivElement
    )?.innerText || ''
  return {
    author: `${nickName}(${userName})`,
    date,
    content: tweetText,
    title: '',
  }
}

export const twitterGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  const tweetRoot = findSelectorParent(
    'article[data-testid="tweet"]',
    inputAssistantButton,
  )

  if (tweetRoot) {
    const tweetList: ISocialMediaPost[] = []
    // 尝试获取Twitter消息链条
    let tweetListItem: HTMLElement | null = findParentEqualSelector(
      'div[data-testid="cellInnerDiv"]',
      tweetRoot,
      5,
    )
    while (tweetListItem) {
      if (tweetListItem?.getAttribute('data-testid') === 'cellInnerDiv') {
        const tweet = tweetListItem.querySelector(
          'article[data-testid="tweet"]',
        ) as HTMLElement
        if (tweet) {
          tweetList.splice(0, 0, getTweetDetail(tweet))
        }
      }
      tweetListItem = tweetListItem.previousElementSibling as HTMLElement
    }
    if (tweetList.length > 0) {
      const firstPost = tweetList.shift()
      const twitterSocialMediaPostContext = new SocialMediaPostContext(
        firstPost as ISocialMediaPost,
      )
      twitterSocialMediaPostContext.addCommentList(tweetList)
      return twitterSocialMediaPostContext.data
    } else {
      const twitterSocialMediaPostContext = new SocialMediaPostContext(
        getTweetDetail(tweetRoot),
      )
      return twitterSocialMediaPostContext.data
    }
  }
  return SocialMediaPostContext.emptyData
}
export const twitterGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  const twitterDraftEditor = findSelectorParent(
    'div.DraftEditor-editorContainer',
    inputAssistantButton,
    30,
  )
  return (twitterDraftEditor as HTMLDivElement)?.innerText || ''
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
