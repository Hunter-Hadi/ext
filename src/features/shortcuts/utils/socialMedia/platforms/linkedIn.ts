import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import {
  delayAndScrollToInputAssistantButton,
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'

// 获取linkedin评论的作者，日期，内容
const getLinkedInCommentDetail = async (
  root: HTMLElement,
): Promise<ICommentData> => {
  const commentAuthor = (
    (root.querySelector(
      'span.comments-post-meta__name span:not(.visually-hidden)',
    ) as HTMLSpanElement)?.innerText || ''
  ).split('\n')[0]
  const commentDate =
    (root.querySelector('time') as HTMLTimeElement)?.innerText || ''
  const seeMoreButton = root.querySelector(
    '& > .comments-reply-item-content-body button.see-more' as any,
  ) as HTMLButtonElement
  if (seeMoreButton) {
    seeMoreButton.click()
    await delayAndScrollToInputAssistantButton(100)
  }
  const commentContent =
    (root.querySelector(
      '& > div.comments-comment-item-content-body' as any,
    ) as HTMLDivElement)?.innerText ||
    (root.querySelector(
      '& > div.comments-reply-item-content-body' as any,
    ) as HTMLDivElement)?.innerText
  return {
    author: commentAuthor || '',
    date: commentDate || '',
    content: commentContent || '',
  }
}

export const linkedInGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  // linkedin button所在的地方的回复框
  const linkedInReplyBox = findSelectorParent(
    '.comments-comment-box',
    inputAssistantButton,
  )
  // linkedin button所在的地方的文章的评论根容器
  const linkedInPostCommentRootContainer =
    findSelectorParent('.social-details-social-activity', linkedInReplyBox) ||
    findSelectorParent(
      '.feed-shared-update-v2__comments-container',
      linkedInReplyBox,
    )
  if (linkedInReplyBox) {
    // 获取文章本身的内容
    if (linkedInPostCommentRootContainer) {
      //文章
      const articleContent = findSelectorParent(
        '.feed-shared-update-v2__description-wrapper',
        linkedInReplyBox,
      )
      if (articleContent) {
        const articleRoot = articleContent?.parentElement as HTMLDivElement
        console.log(articleRoot)
        // see more button - button[role="button"].see-more
        const seeMoreButton = articleRoot?.querySelector(
          'button[role="button"].see-more',
        ) as HTMLButtonElement
        if (seeMoreButton) {
          seeMoreButton.click()
          await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
        }
        const account =
          articleRoot?.querySelector(
            '.update-components-actor__name span:not(.visually-hidden)',
          )?.textContent || ''
        const articleContentText = articleContent?.innerText || ''
        // ml4 mt2 text-body-xsmall
        const date = (
          (articleRoot?.querySelector(
            'div.ml4.mt2.text-body-xsmall',
          ) as HTMLDivElement)?.innerText || ''
        ).split('•')?.[0]
        const socialMediaPostContext = new SocialMediaPostContext({
          author: account,
          content: articleContentText,
          title: '',
          date,
        })
        // 如果replyBox中有评论的容器，那么就是回复评论/回复评论的评论
        // 文章底下的评论
        if (
          linkedInReplyBox.parentElement?.classList.contains(
            'comments-comment-item__nested-items',
          )
        ) {
          const linkedInPostComments: ICommentData[] = []
          const linkedInFirstComment = findParentEqualSelector(
            'article.comments-comment-item',
            inputAssistantButton,
          ) as HTMLDivElement
          const inputRoot = linkedInFirstComment?.querySelector(
            'div.editor-content div[contenteditable="true"]',
          ) as HTMLDivElement
          const inputValue = inputRoot?.innerText || ''
          linkedInPostComments.push(
            await getLinkedInCommentDetail(linkedInFirstComment),
          )
          if (inputValue) {
            // 可能要回复评论的评论
            const nestedArticles = Array.from(
              linkedInFirstComment.querySelectorAll('article'),
            ) as HTMLDivElement[]
            for (let i = 0; i < nestedArticles.length; i++) {
              const nestedArticle = nestedArticles[i]
              const nestedCommentDetail = await getLinkedInCommentDetail(
                nestedArticle,
              )
              if (inputValue.startsWith(nestedCommentDetail.author)) {
                linkedInPostComments.push(nestedCommentDetail)
                break
              }
            }
          }
          await delayAndScrollToInputAssistantButton(0, inputAssistantButton)
          socialMediaPostContext.addCommentList(linkedInPostComments)
        }
        return socialMediaPostContext.data
      }
    } else if (findSelectorParent('.comments-comment-box', linkedInReplyBox)) {
      // linkedin button所在的地方的文章的评论根容器
      const linkedInSearchPostCommentRootContainer = findSelectorParent(
        '.comments-comment-box',
        linkedInReplyBox,
      )
      const articleRoot = findSelectorParent(
        '.entity-result__content-container',
        linkedInSearchPostCommentRootContainer,
      )
      if (articleRoot) {
        const seeMoreButton =
          (articleRoot?.querySelector(
            '.entity-result__summary button[type="button"]',
          ) as HTMLButtonElement) ||
          (articleRoot?.querySelector(
            '.entity-result__content-summary button[type="button"]',
          ) as HTMLButtonElement)
        if (seeMoreButton) {
          seeMoreButton.click()
          await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
        }
        const account =
          articleRoot?.querySelector(
            '.app-aware-link > span > span:not(.visually-hidden)',
          )?.textContent || ''
        const articleContentText =
          (articleRoot?.querySelector(
            '.entity-result__summary',
          ) as HTMLParagraphElement)?.innerText ||
          (articleRoot?.querySelector(
            '.entity-result__content-summary',
          ) as HTMLParagraphElement)?.innerText ||
          ''
        // ml4 mt2 text-body-xsmall
        const date = (
          (articleRoot?.querySelector(
            'div.ml4.mt2.text-body-xsmall',
          ) as HTMLDivElement)?.innerText || ''
        ).split('•')?.[0]
        const socialMediaPostContext = new SocialMediaPostContext({
          author: account,
          content: articleContentText,
          title: '',
          date,
        })
        // 如果replyBox中有评论的容器，那么就是回复评论/回复评论的评论
        // 文章底下的评论
        if (
          linkedInReplyBox.parentElement?.classList.contains(
            'comments-comment-item__nested-items',
          )
        ) {
          const linkedInPostComments: ICommentData[] = []
          const linkedInFirstComment = findParentEqualSelector(
            'article.comments-comment-item',
            inputAssistantButton,
          ) as HTMLDivElement
          const inputRoot = linkedInFirstComment?.querySelector(
            'div.editor-content div[contenteditable="true"]',
          ) as HTMLDivElement
          const inputValue = inputRoot?.innerText || ''
          linkedInPostComments.push(
            await getLinkedInCommentDetail(linkedInFirstComment),
          )
          if (inputValue) {
            // 可能要回复评论的评论
            const nestedArticles = Array.from(
              linkedInFirstComment.querySelectorAll('article'),
            ) as HTMLDivElement[]
            for (let i = 0; i < nestedArticles.length; i++) {
              const nestedArticle = nestedArticles[i]
              const nestedCommentDetail = await getLinkedInCommentDetail(
                nestedArticle,
              )
              if (inputValue.startsWith(nestedCommentDetail.author)) {
                linkedInPostComments.push(nestedCommentDetail)
                break
              }
            }
          }
          await delayAndScrollToInputAssistantButton(0, inputAssistantButton)
          socialMediaPostContext.addCommentList(linkedInPostComments)
        }
        return socialMediaPostContext.data
      }
    }
  }
  return SocialMediaPostContext.emptyData
}
export const linkedInGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  const linkedinDraftEditor = findSelectorParent(
    'div.ql-editor',
    inputAssistantButton,
    30,
  )
  return (linkedinDraftEditor as HTMLDivElement)?.innerText || ''
}
