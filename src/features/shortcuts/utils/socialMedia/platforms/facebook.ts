import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'
import {
  delayAndScrollToInputAssistantButton,
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'

// 获取Facebook评论的作者，日期，内容
const getFacebookCommentDetail = async (
  root: HTMLElement,
): Promise<ICommentData> => {
  const commentAuthor =
    (root?.querySelector('a > span > span') as HTMLSpanElement)?.innerText || ''
  const commentContent =
    (root?.querySelector('span[lang][dir]') as HTMLSpanElement)?.innerText || ''
  const links = Array.from(
    root?.querySelectorAll('a > span'),
  ) as HTMLSpanElement[]
  const commentDate = links[links.length - 1]?.innerText || ''
  return {
    content: commentContent,
    author: commentAuthor,
    date: commentDate,
  }
}

export const facebookGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  const facebookReplyForm = findSelectorParent(
    'form[role="presentation"]',
    inputAssistantButton,
  )
  const facebookPostContentCard = findSelectorParent(
    'div[data-ad-preview="message"]',
    facebookReplyForm,
    30,
  )
  const h3AuthorElement = findSelectorParent(
    'span:has(h3 > span)',
    facebookReplyForm,
    30,
  )
  const facebookPostAuthorElement =
    h3AuthorElement ||
    findSelectorParent('span:has(h4 > div)', facebookReplyForm, 30)
  const facebookPostAuthor = facebookPostAuthorElement?.innerText || ''
  const facebookPostDate = h3AuthorElement
    ? (facebookPostAuthorElement?.nextElementSibling?.querySelector(
        'a',
      ) as HTMLAnchorElement)?.innerText
    : facebookPostAuthorElement?.parentElement?.nextElementSibling?.querySelectorAll(
        'a',
      )?.[1]?.innerText || ''
  const facebookExpandButton = facebookPostContentCard?.querySelector(
    'div[dir] > div[role="button"]',
  ) as HTMLDivElement
  if (facebookExpandButton) {
    facebookExpandButton.click()
    await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
  }
  const facebookPostContent = facebookPostContentCard?.innerText || ''
  const facebookPostComments: ICommentData[] = []
  const facebookSocialMediaPostContext = new SocialMediaPostContext({
    author: facebookPostAuthor,
    date: facebookPostDate,
    content: facebookPostContent,
    title: '',
  })
  if (facebookReplyForm) {
    const replyInput = facebookReplyForm.querySelector(
      'div[contenteditable="true"][role="textbox"]',
    ) as HTMLDivElement
    const replyContent = replyInput?.innerText || ''
    let parentLiElement: HTMLElement | null = findParentEqualSelector(
      'li',
      facebookReplyForm,
      10,
    )
    while (parentLiElement) {
      const commentElement = parentLiElement.childNodes[0] as HTMLDivElement
      if (commentElement) {
        const facebookCommentData = await getFacebookCommentDetail(
          commentElement,
        )
        // 这是Facebook回复列表的某个回复, 某个回复下的一堆回复，用户点击了其中一个 input就会有用户名，类似linkedin
        if (
          facebookPostComments.length === 0 &&
          !replyContent.startsWith(facebookCommentData.author)
        ) {
          if (parentLiElement && replyContent) {
            const listItems = Array.from(
              parentLiElement.querySelectorAll('& > div > ul li > div'),
            ) as HTMLDivElement[]
            for (let i = 0; i < listItems.length; i++) {
              const listItem = listItems[i]
              const commentDetail = await getFacebookCommentDetail(listItem)
              if (replyContent.startsWith(commentDetail.author)) {
                facebookPostComments.push(commentDetail)
                break
              }
            }
          }
        }
        facebookPostComments.splice(0, 0, facebookCommentData)
        if (parentLiElement?.parentElement) {
          parentLiElement = findParentEqualSelector(
            'li',
            parentLiElement.parentElement,
            10,
          )
          continue
        }
      }
      break
    }
    if (replyContent.replace('\n', '') && !facebookPostComments.length) {
      const homePagePostCommentBox = findSelectorParent(
        'div[role="article"]',
        facebookReplyForm,
      )
      const commentData = await getFacebookCommentDetail(
        homePagePostCommentBox as HTMLElement,
      )
      if (replyContent.startsWith(commentData.author)) {
        // 确定是主页的评论回复
        facebookPostComments.push(commentData)
      }
    }
    facebookSocialMediaPostContext.addCommentList(facebookPostComments)
  }
  return facebookSocialMediaPostContext.data
}
export const facebookGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  const facebookDraftEditor = findSelectorParent(
    'div[contenteditable="true"]',
    inputAssistantButton,
    30,
  )
  return (facebookDraftEditor as HTMLDivElement)?.innerText || ''
}
