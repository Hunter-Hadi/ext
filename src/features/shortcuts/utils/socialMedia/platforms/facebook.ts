import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import {
  delayAndScrollToInputAssistantButton,
  findParentEqualSelector,
  findSelectorParent,
  findSelectorParentStrict,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'

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
  const facebookPostContentCard =
    findSelectorParent(
      'div > div:not(:first-child) > blockquote > span > div',
      facebookReplyForm,
      30,
    ) ||
    findSelectorParent('div[data-ad-preview="message"]', facebookReplyForm, 30)
  debugger
  const hTagAuthorElement =
    findSelectorParent('span:has(h3 > span)', facebookReplyForm, 30) ||
    findSelectorParent('span:has(h2 > span)', facebookReplyForm, 30)
  const facebookPostAuthorElement =
    hTagAuthorElement ||
    findSelectorParent('span:has(h4 > div)', facebookReplyForm, 30)
  const facebookPostAuthor = facebookPostAuthorElement?.innerText || ''
  const facebookPostDate = hTagAuthorElement
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
    if (!facebookPostComments.length) {
      // update - 2024-01-04 - 2.0版本
      const inputValue = replyContent.replace('\n', '')
      // 回复框所在的根级Comment，不一定是最顶层，有可能还是被嵌套的3、4级
      const facebookReplyFormRootElement = findSelectorParent(
        'div[class]:has( > div[class] > div[class] > div[class] > div[class] > div[class] > div[class] > div[class] form)',
        facebookReplyForm,
      )
      if (facebookReplyFormRootElement) {
        // NOTE: Facebook的层级是这样:
        // 1.先找到Form的Root
        // 2.再找到对应的"Form的根级Comment"
        // 3.再找是不是回复"Form的根级Comment"的子级的Comment
        // 4.再找"Form的根级Comment"的父级Comment
        const facebookReplyFormRootArticle = facebookReplyFormRootElement
          ?.parentElement?.parentElement
          ?.previousElementSibling as HTMLDivElement
        if (facebookReplyFormRootArticle) {
          const facebookReplyFormRootArticleComment = await getFacebookCommentDetail(
            facebookReplyFormRootArticle,
          )
          if (!facebookReplyFormRootArticleComment.author) {
            return facebookSocialMediaPostContext.data
          }
          const childComments = facebookReplyFormRootArticle.nextElementSibling
            ? (Array.from(
                facebookReplyFormRootArticle.nextElementSibling.querySelectorAll(
                  'div[role="article"]',
                ),
              ) as HTMLDivElement[])
            : []
          if (childComments && inputValue) {
            for (let i = 0; i < childComments.length; i++) {
              const commentData = await getFacebookCommentDetail(
                childComments[i],
              )
              if (
                commentData.author &&
                inputValue.startsWith(commentData.author)
              ) {
                facebookPostComments.push(commentData)
              }
            }
          }
          facebookPostComments.unshift(facebookReplyFormRootArticleComment)
          // 到这一步，回复框所在的父级comment和子级comment就处理完成了
          // 还需要递归处理父级comment的父级comment
          let parentComment = findSelectorParentStrict(
            'div > div[class] > div[class]:has( > div[role="article"])',
            facebookReplyFormRootArticle,
          )
          let prevComment: HTMLElement = facebookReplyFormRootArticle
          while (parentComment) {
            if (
              prevComment?.parentElement?.parentElement?.parentElement?.isSameNode(
                parentComment?.parentElement?.parentElement?.parentElement ||
                  null,
              )
            ) {
              break
            }
            const commentData = await getFacebookCommentDetail(parentComment)
            if (commentData.author === '') {
              break
            }
            if (facebookPostComments[0].content === commentData.content) {
              // 说明重复了
              break
            }
            facebookPostComments.unshift(commentData)
            prevComment = parentComment
            parentComment = findSelectorParentStrict(
              'div > div[class] > div[class]:has( > div[role="article"])',
              parentComment,
            )
          }
        }
      } else {
        // since - 2023-09-26 - 1.0版本
        // 更新了一下判断是回复人还是回复帖子
        const homePagePostReplyFormRoot = findSelectorParent(
          '& > div:has(div[role="article"]) + div:has(form)',
          facebookReplyForm,
          15,
        )
        if (homePagePostReplyFormRoot?.parentElement?.getAttribute('class')) {
          // 说明是回复帖子
          // 不做处理
        } else {
          // 在主页回复的comment的容器
          const homePagePostReplyCommentRoot = homePagePostReplyFormRoot?.previousElementSibling?.querySelector(
            'div[role="article"]',
          ) as HTMLDivElement
          if (homePagePostReplyCommentRoot) {
            const commentData = await getFacebookCommentDetail(
              homePagePostReplyCommentRoot,
            )
            facebookPostComments.push(commentData)
          }
        }
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
