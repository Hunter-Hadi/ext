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
    const commentRoot = findSelectorParent(
      '.comments-comment-box',
      inputAssistantButton,
    )
    const articleRoot = findSelectorParent(
      '.social-details-social-activity',
      commentRoot,
    )
    if (commentRoot) {
      // `**Author:** [Author Name] | **Date:** [Date]
      //
      // Post content...
      //
      // ---
      //
      // **Comments**
      //
      // > **Author:** [Commenter 1] | **Date:** [Date]
      //
      // > Comment 1...
      //
      // >> **Reply from [Replier 1.1] | Date: [Date]**
      //
      // >> Reply to Comment 1...
      //
      // >>> **Reply form Me | Date: Now**
      // >>> Reply to Comment 2...
      // `
      let comment = ''
      const getLinkedInCommentDetail = async (root: HTMLElement) => {
        const commentAuthor =
          (root.querySelector(
            'span.comments-post-meta__name span:not(.visually-hidden)',
          ) as HTMLSpanElement)?.innerText || ''
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
          commentAuthor,
          commentDate,
          commentContent,
        }
      }
      // 文章底下的评论
      if (
        commentRoot.parentElement?.classList.contains(
          'comments-comment-item__nested-items',
        )
      ) {
        const commentRoot = findSelectorParent(
          'article.comments-comments-list__comment-item',
          inputAssistantButton,
        ) as HTMLDivElement
        const inputRoot = commentRoot?.querySelector(
          'div.editor-content div[contenteditable="true"]',
        ) as HTMLDivElement
        const inputValue = inputRoot?.innerText || ''
        const rootCommentDetail = await getLinkedInCommentDetail(commentRoot)
        comment += `\n\n---\n\n**Comments**\n\n> **Author:** ${rootCommentDetail.commentAuthor} | **Date:** ${rootCommentDetail.commentDate}\n\n> ${rootCommentDetail.commentContent}`
        let replyComment = ''
        if (inputValue) {
          // 可能要回复评论的评论
          const nestedArticles = Array.from(
            commentRoot.querySelectorAll('article'),
          ) as HTMLDivElement[]
          for (let i = 0; i < nestedArticles.length; i++) {
            const nestedArticle = nestedArticles[i]
            const nestedCommentDetail = await getLinkedInCommentDetail(
              nestedArticle,
            )
            if (inputValue.startsWith(nestedCommentDetail.commentAuthor)) {
              replyComment += `\n\n>> **Reply from ${nestedCommentDetail.commentAuthor} | Date: ${nestedCommentDetail.commentDate}**\n\n>> ${nestedCommentDetail.commentContent}`
              break
            }
          }
          comment += replyComment
        }
      }
      if (articleRoot) {
        //文章
        const articleContent = findSelectorParent(
          '.feed-shared-update-v2__description-wrapper',
          commentRoot,
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
        // **Author:** [Author Name] | **Date:** [Date]
        return (
          `Author: ${account}\nDate: ${date}\nPost/message:\n${articleContentText}` +
          comment
        )
      }
    }
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
