import { getCurrentDomainHost } from '@/utils'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'

/**
 * 寻找父级元素包含的selector元素
 * @param selector
 * @param startElement
 * @param maxDeep
 */
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
/**
 * 寻找父级元素是selector元素
 * @param selector
 * @param startElement
 * @param maxDeep
 */
export const findParentEqualSelector = (
  selector: string,
  startElement: HTMLElement,
  maxDeep = 20,
) => {
  let parent: HTMLElement = startElement
  let deep = 0
  while (deep < maxDeep && !parent.matches(selector)) {
    parent = parent?.parentElement as HTMLElement
    deep++
  }
  return parent.matches(selector) ? parent : null
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

export const getSocialMediaPostContent = async (
  inputAssistantButtonElementSelector: string,
) => {
  const inputAssistantButton = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement
  const delay = (t: number) =>
    new Promise((resolve) =>
      setTimeout(() => {
        const screen = window.innerHeight
        const toScroll = screen / 10
        inputAssistantButton.scrollIntoView(false)
        window.scrollBy(0, toScroll)
        // scroll into view
        resolve(true)
      }, t),
    )
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
      return `Nickname: ${nickName}\nUsername: @${userName}\nDate: ${date}\nPost/message:\n${tweetText}`
    }
  }
  if (host === 'linkedin.com') {
    // linkedin button所在的地方的回复框
    const linkedInReplyBox = findSelectorParent(
      '.comments-comment-box',
      inputAssistantButton,
    )
    // linkedin button所在的地方的文章的评论根容器
    const linkedInPostCommentRootContainer = findSelectorParent(
      '.social-details-social-activity',
      linkedInReplyBox,
    )
    if (linkedInReplyBox) {
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
          '& > .comments-reply-item-content-body button.see-more',
        ) as HTMLButtonElement
        if (seeMoreButton) {
          seeMoreButton.click()
          await delay(100)
        }
        const commentContent =
          (root.querySelector(
            '& > div.comments-comment-item-content-body',
          ) as HTMLDivElement)?.innerText ||
          (root.querySelector(
            '& > div.comments-reply-item-content-body',
          ) as HTMLDivElement)?.innerText
        return {
          author: commentAuthor || '',
          date: commentDate || '',
          content: commentContent || '',
        }
      }
      // 获取文章本身的内容
      if (linkedInPostCommentRootContainer) {
        //文章
        const articleContent = findSelectorParent(
          '.feed-shared-update-v2__description-wrapper',
          linkedInReplyBox,
        )
        if (!articleContent) {
          return ''
        }
        const articleRoot = articleContent?.parentElement as HTMLDivElement
        console.log(articleRoot)
        // see more button - button[role="button"].see-more
        const seeMoreButton = articleRoot?.querySelector(
          'button[role="button"].see-more',
        ) as HTMLButtonElement
        if (seeMoreButton) {
          seeMoreButton.click()
          await delay(100)
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
          const linkedInFirstComment = findSelectorParent(
            'article.comments-comments-list__comment-item',
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
          socialMediaPostContext.addCommentList(linkedInPostComments)
        }
        return socialMediaPostContext.generateMarkdownText()
      }
    }
  }
  if (host === 'facebook.com') {
    const facebookReplyForm = findSelectorParent(
      'form[role="presentation"]',
      inputAssistantButton,
    )
    const facebookPostContentCard = findSelectorParent(
      'div[data-ad-preview="message"]',
      facebookReplyForm,
      30,
    )
    const facebookPostAuthorElement = findSelectorParent(
      'span:has(h3 > span)',
      facebookReplyForm,
      30,
    )
    const facebookPostAuthor = facebookPostAuthorElement?.innerText || ''
    const facebookPostDate =
      (facebookPostAuthorElement?.nextElementSibling?.querySelector(
        'a',
      ) as HTMLAnchorElement)?.innerText || ''
    const facebookPostContent = facebookPostContentCard?.innerText || ''
    const facebookPostComments: ICommentData[] = []
    const facebookSocialMediaPostContext = new SocialMediaPostContext({
      author: facebookPostAuthor,
      date: facebookPostDate,
      content: facebookPostContent,
      title: '',
    })
    const getFacebookCommentDetail = async (
      root: HTMLElement,
    ): Promise<ICommentData> => {
      const commentAuthor =
        (root?.querySelector('a > span > span') as HTMLSpanElement)
          ?.innerText || ''
      const commentContent =
        (root?.querySelector('span[lang][dir]') as HTMLSpanElement)
          ?.innerText || ''
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
      facebookSocialMediaPostContext.addCommentList(facebookPostComments)
    }
    return facebookSocialMediaPostContext.generateMarkdownText()
  }
  return ''
}

export const getSocialMediaPostDraft = async (
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
  if (host === 'linkedin.com') {
    const linkedinDraftEditor = findSelectorParent(
      'div.ql-editor',
      inputAssistantButton,
      30,
    )
    return (linkedinDraftEditor as HTMLDivElement)?.innerText || ''
  }
  return ''
}
