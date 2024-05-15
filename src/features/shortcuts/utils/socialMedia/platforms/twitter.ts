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
import { getInstantReplyDataHelper } from '@/utils/dataHelper/instantReplyHelper'

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
  // 优化：将上次获取的 context 缓存起来，然后判断
  //// - 1. 如果点的是和上次点的同一个 button
  //// - 2. 或者还是在同一个 context window 里进行操作
  // 那么通过直接返回上次缓存的 context 即可
  const instantReplyDataHelper = getInstantReplyDataHelper()
  const instantReplyButtonId =
    inputAssistantButton.getAttribute('maxai-input-assistant-button-id') || ''
  if (instantReplyButtonId) {
    if (
      instantReplyDataHelper.getAttribute('aria-operation-selector-id') ===
      instantReplyButtonId
    ) {
      const fullContextCache = instantReplyDataHelper.getAttribute(
        'data-full-context-cache',
      )
      const targetContextCache = instantReplyDataHelper.getAttribute(
        'data-target-context-cache',
      )
      if (targetContextCache) {
        return {
          postText: fullContextCache || targetContextCache,
          SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: targetContextCache,
          SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT:
            fullContextCache || targetContextCache,
          SOCIAL_MEDIA_PAGE_CONTENT: '',
        }
      }
    }
    instantReplyDataHelper.setAttribute(
      'aria-operation-selector-id',
      instantReplyButtonId,
    )
  }

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
      instantReplyDataHelper.setAttribute(
        'data-full-context-cache',
        twitterSocialMediaPostContext.data.SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT,
      )
      instantReplyDataHelper.setAttribute(
        'data-target-context-cache',
        twitterSocialMediaPostContext.data.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
      )
      return twitterSocialMediaPostContext.data
    } else {
      const twitterSocialMediaPostContext = new SocialMediaPostContext(
        getTweetDetail(tweetRoot),
      )
      instantReplyDataHelper.setAttribute(
        'data-full-context-cache',
        twitterSocialMediaPostContext.data.SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT,
      )
      instantReplyDataHelper.setAttribute(
        'data-target-context-cache',
        twitterSocialMediaPostContext.data.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
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
