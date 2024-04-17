import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import {
  delayAndScrollToInputAssistantButton,
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

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
  // 找到展开按钮
  const expandButton = root.querySelector(
    'div[role="button"][tabindex="0"]:has(> span[dir])',
  ) as HTMLButtonElement
  if (expandButton) {
    expandButton.click()
    await delayAndScrollToInputAssistantButton(500)
  }
  // 日期的下一行就是内容
  if (commentDateElement) {
    commentDate = commentDateElement?.dateTime || ''
    let commentContentElement = findParentEqualSelector(
      'div',
      commentDateElement,
    )?.nextElementSibling as HTMLDivElement
    // 如果没获取到，说明在主页
    if (!commentContentElement) {
      commentContentElement = root.querySelector<HTMLDivElement>(
        'section + div > span[dir]',
      )!
    }
    commentContent = commentContentElement?.innerText || ''
  }
  // 如果没获取到，尝试获取用户名的下一行
  if (!commentContent) {
    commentContent =
      (
        (root.querySelector('h3') || root.querySelector('h2'))
          ?.nextElementSibling as HTMLDivElement
      )?.innerText || ''
  }
  // 如果没获取到，尝试获取嵌套的span[dir]
  if (!commentContent) {
    commentContent =
      (root.querySelector('span[dir] > span[dir]') as HTMLSpanElement)
        ?.innerText || ''
  }
  return {
    content: commentContent,
    author: commentAuthor.startsWith('@')
      ? commentAuthor
      : `${commentAuthor ? `@${commentAuthor}` : ''}`,
    date: commentDate,
  }
}

export const instagramGetPostContent: GetSocialMediaPostContentFunction =
  async (inputAssistantButton) => {
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
      // 查找comment 列表
      const replyMessageThread = instagramRootReplyBox.querySelector('hr')
        ? Array.from(
            instagramRootReplyBox?.querySelectorAll<HTMLElement>(
              'hr + div > div > div > div',
            ),
          )
        : Array.from(
            instagramRootReplyBox?.querySelectorAll<HTMLElement>(
              'section + div > ul > *',
            ),
          )
      const [postContent, ...commentRootList] = replyMessageThread
      if (!postContent) {
        // 说明可能在Home或者其他页面
        let homePostContent = instagramRootReplyBox.querySelector(
          'div:has( > span[dir] > span[dir])',
        ) as HTMLSpanElement
        // 说明可能是在Home的纯图片Post,没有文字说明
        if (!homePostContent) {
          homePostContent = findParentEqualSelector(
            'article',
            instagramRootReplyBox,
            10,
          ) as HTMLElement
        }
        if (homePostContent) {
          const homePagePostData = await getInstagramCommentDetail(
            homePostContent,
          )
          // 因为首页的只有post，没有回复，所以不用管comment
          const socialMediaPostContext = new SocialMediaPostContext({
            author: homePagePostData.author,
            content: homePagePostData.content,
            title: '',
            date: homePagePostData.date,
          })
          return socialMediaPostContext.data
        } else {
          return SocialMediaPostContext.emptyData
        }
      }
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
        let comments: HTMLElement[] = []
        // 主页获取comments的方式
        commentRootList.map((commentRoot) => {
          commentRoot
            ?.querySelectorAll('& > div > div > div:has(> ul)')
            ?.forEach((node) => {
              comments.push(node as HTMLDivElement)
            })
        })
        // 如果一个都没找到，说明是在帖子详情页
        if (comments.length === 0) {
          comments = commentRootList
        }
        const commandList: ICommentData[] = []
        // 遍历instagram的comment列表
        for (let j = 0; j < comments.length; j++) {
          // 先看是不是第一层的comment
          const commentData = await getInstagramCommentDetail(comments[j])
          if (commentData.author && userName.startsWith(commentData.author)) {
            commandList.push(commentData)
            break
          }
          // 因为主页和详情页的subComment的html有差异，所以要区分处理
          const subComments = Array.from(
            comments[j]?.querySelectorAll('ul > div'),
          ) as HTMLDivElement[]
          if (subComments.length > 0) {
            let isFindSubComment = false
            for (let k = 0; k < subComments.length; k++) {
              const subCommentData = await getInstagramCommentDetail(
                subComments[k],
              )
              if (
                commentData.author &&
                userName.startsWith(subCommentData.author)
              ) {
                isFindSubComment = true
                commandList.push(commentData)
                commandList.push(subCommentData)
                break
              }
            }
            if (isFindSubComment) {
              break
            }
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
