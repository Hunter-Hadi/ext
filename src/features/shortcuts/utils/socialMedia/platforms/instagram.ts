import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'

// 获取Instagram评论的作者，日期，内容
const getInstagramCommentDetail = async (
  root: HTMLElement,
): Promise<ICommentData> => {
  const commentAuthor =
    (Array.from(root.querySelectorAll('a')) as HTMLAnchorElement[]).find(
      (element) => element.innerText.trim() !== '',
    )?.innerText || ''
  const commentDateElement = root.querySelector('time')
  let commentContent = ''
  let commentDate = ''
  // 日期的下一行就是内容
  if (commentDateElement) {
    commentDate = commentDateElement?.dateTime || ''
    const commentContentElement = findParentEqualSelector(
      'div',
      commentDateElement,
    )?.nextElementSibling as HTMLDivElement
    commentContent = commentContentElement?.innerText || ''
  }
  // 如果没获取到，尝试获取用户名的下一行
  if (!commentContent) {
    commentContent =
      ((root.querySelector('h3') || root.querySelector('h2'))
        ?.nextElementSibling as HTMLDivElement)?.innerText || ''
  }
  return {
    content: commentContent,
    author: commentAuthor.startsWith('@')
      ? commentAuthor
      : `${commentAuthor ? `@${commentAuthor}` : ''}`,
    date: commentDate,
  }
}

export const instagramGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  // 回复框所在的section
  const textareaSection = findParentEqualSelector(
    'section',
    inputAssistantButton,
  )
  const userInputDraft =
    (textareaSection?.querySelector('textarea') as HTMLTextAreaElement)
      ?.value || ''
  const instagramRootReplyBox = textareaSection?.parentElement
    ?.parentElement as HTMLDivElement
  if (instagramRootReplyBox) {
    const replyMessageThread = instagramRootReplyBox.querySelector('hr')
      ? (Array.from(
          instagramRootReplyBox?.querySelectorAll('hr + div > div > div > div'),
        ) as HTMLDivElement[])
      : (Array.from(
          instagramRootReplyBox?.querySelectorAll('section + div > ul > *'),
        ) as HTMLDivElement[])
    const [postContent, ...comments] = replyMessageThread
    const postData = await getInstagramCommentDetail(postContent)
    const socialMediaPostContext = new SocialMediaPostContext({
      author: postData.author,
      content: postData.content,
      title: '',
      date: postData.date,
    })
    // 说明是回复别人
    if (userInputDraft.startsWith('@')) {
      const userName = userInputDraft.split(' ')?.[0]
      const commandList: ICommentData[] = []
      for (let j = 0; j < comments.length; j++) {
        let hasFound = false
        const commentData = await getInstagramCommentDetail(comments[j])
        if (userName.startsWith(commentData.author)) {
          commandList.push(commentData)
          hasFound = true
        }
        const subComments = Array.from(
          comments[j + 1]?.querySelectorAll('ul > div'),
        ) as HTMLDivElement[]
        if (subComments.length > 0) {
          for (let k = 0; k < subComments.length; k++) {
            const subCommentData = await getInstagramCommentDetail(
              subComments[k],
            )
            if (userName.startsWith(subCommentData.author)) {
              commandList.push(commentData)
              commandList.push(subCommentData)
              hasFound = true
              break
            }
          }
        }
        if (hasFound) {
          break
        }
      }
      socialMediaPostContext.addCommentList(commandList)
    } else {
      // 说明是回复帖子, 不需要添加comment
    }
    return socialMediaPostContext.data
  }
  return SocialMediaPostContext.emptyData
}
export const instagramGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  const instagramDraftEditor = findSelectorParent(
    'div[contenteditable="true"]',
    inputAssistantButton,
    20,
  )
  if (!instagramDraftEditor) {
    const textareaDraft = findSelectorParent(
      'form textarea',
      inputAssistantButton,
      20,
    ) as HTMLTextAreaElement
    return textareaDraft?.value
  }
  return (instagramDraftEditor as HTMLDivElement)?.innerText || ''
}