import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'

// 获取Reddit评论的作者，日期，内容
const getRedditCommentDetail = async (
  root: HTMLElement,
): Promise<ICommentData> => {
  const author =
    root.querySelector('a[data-testid="comment_author_link"]')?.innerHTML || ''
  const content =
    (root.querySelector('div[data-testid="comment"]') as HTMLDivElement)
      ?.innerText ||
    (root.querySelector('div.RichTextJSON-root') as HTMLDivElement)
      ?.innerText ||
    ''
  // NOTE: 因为Reddit的时间是人类阅读时间，不太好给ai
  // data-testid="comment_timestamp"
  // const date =
  //   (root.querySelector(
  //     'a[data-testid="comment_timestamp"]',
  //   ) as HTMLAnchorElement)?.innerText || ''
  return {
    author,
    date: '',
    content,
  }
}

export const redditGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  debugger
  const postContainer = findSelectorParent(
    'div[data-test-id="post-content"]',
    inputAssistantButton,
    50,
  )
  if (postContainer) {
    const postTitle =
      (postContainer.querySelector(
        'div[data-adclicklocation="title"]',
      ) as HTMLDivElement).innerText ||
      postContainer.querySelector('h1')?.innerText ||
      ''
    const author =
      postContainer.querySelector('a[data-testid="post_author_link"]')
        ?.innerHTML || ''
    const content =
      (postContainer.querySelector('.RichTextJSON-root') as HTMLDivElement)
        ?.innerText || ''
    const socialMediaPostContext = new SocialMediaPostContext({
      author: author,
      content: content,
      title: postTitle,
      date: '',
    })
    const commentRoot = (Array.from(
      document.querySelectorAll('div:has( > div[data-scroller-first])'),
    ) as HTMLDivElement[]).find((element) =>
      element.contains(inputAssistantButton),
    )
    // 说明有注释
    if (commentRoot) {
      // 因为reddit的评论是按照padding-left的距离来测算的，首先找到commentRoot这个列表下的根级div
      let currentCommentRoot = inputAssistantButton
      for (let i = 0; i < 100; i++) {
        if (currentCommentRoot?.parentElement?.isSameNode(commentRoot)) {
          break
        }
        if (currentCommentRoot.parentElement) {
          currentCommentRoot = currentCommentRoot.parentElement as HTMLElement
        }
      }
      if (currentCommentRoot) {
        const comments: ICommentData[] = []
        comments.push(await getRedditCommentDetail(currentCommentRoot))
        let paddingLeft =
          Number(
            (currentCommentRoot.querySelector(
              'div[id][style][tabindex]',
            ) as HTMLDivElement)?.style?.paddingLeft?.replace('px', ''),
          ) || 0
        let prevCommentDiv: HTMLElement = currentCommentRoot.previousElementSibling as HTMLDivElement
        // 因为Reddit的评论是按照padding-left的距离来测算的，所以要找到padding-left比当前评论小的评论
        //获取最小paddingLeft
        const minPaddingLeft =
          Number(
            (commentRoot.querySelector(
              'div[data-scroller-first]',
            ) as HTMLDivElement)?.style?.paddingLeft?.replace('px', ''),
          ) || 16
        // 如果当前评论的paddingLeft比最小的还小，那么就不用找了
        while (prevCommentDiv && paddingLeft > minPaddingLeft) {
          // 获取上一个评论的paddingLeft
          const prevCommentPaddingLeft =
            Number(
              (prevCommentDiv.querySelector(
                'div[id][style][tabindex]',
              ) as HTMLDivElement)?.style?.paddingLeft?.replace('px', ''),
            ) || 0
          // 如果上一个评论的paddingLeft比当前评论的paddingLeft小，那么就是当前评论的父级评论
          if (paddingLeft > prevCommentPaddingLeft) {
            // 获取上一个评论的作者，日期，内容
            comments.unshift(await getRedditCommentDetail(prevCommentDiv))
            // 更新paddingLeft
            paddingLeft = prevCommentPaddingLeft
            // 更新当前评论
            if (prevCommentDiv.previousElementSibling) {
              // 如果上一个评论还有上一个评论，那么就继续循环
              prevCommentDiv = prevCommentDiv.previousElementSibling as HTMLDivElement
            } else {
              // 如果上一个评论没有上一个评论，那么就是根级评论了，
              break
            }
          } else if (
            // 如果上一个评论的paddingLeft比当前评论的paddingLeft大，那么就是当前评论的兄弟评论
            paddingLeft > minPaddingLeft &&
            prevCommentDiv.previousElementSibling
          ) {
            // 如果上一个评论还有上一个评论，那么就继续循环
            prevCommentDiv = prevCommentDiv.previousElementSibling as HTMLDivElement
          } else {
            break
          }
        }
        socialMediaPostContext.addCommentList(comments)
      }
    }
    return socialMediaPostContext.data
  }
  return SocialMediaPostContext.emptyData
}
export const redditGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  // contenteditable="true" || textarea[rows="1"]
  const redditDraftEditor = findSelectorParent(
    'div[contenteditable="true"]',
    inputAssistantButton,
    15,
  )
  if (redditDraftEditor) {
    return (redditDraftEditor as HTMLDivElement)?.innerText || ''
  } else {
    return (
      (findSelectorParent(
        'textarea[rows="1"]:has( + span[id])',
        inputAssistantButton,
        15,
      ) as HTMLTextAreaElement)?.value || ''
    )
  }
}
