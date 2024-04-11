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
  ISocialMediaPost,
} from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'

// 获取Facebook帖子的作者，日期，内容
const getFacebookPostData = async (
  postContainer: HTMLElement | null,
  inputAssistantButton: HTMLElement,
): Promise<ISocialMediaPost | null> => {
  const postDataContainer = postContainer?.querySelector(
    'div[data-visualcompletion="ignore-dynamic"]',
  )?.parentElement?.parentElement as HTMLElement
  if (postDataContainer) {
    const postMetadata = postDataContainer.querySelector<HTMLElement>(
      '& > div:nth-child(2)',
    )
    const postContent =
      postDataContainer.querySelector<HTMLElement>(
        '& > div:nth-child(3) div[id] > div:nth-child(1):not(a) > :not(a) span[dir]',
      ) ||
      postDataContainer.querySelector<HTMLElement>(
        '& > div:nth-child(3):has([id])',
      )
    if (postMetadata) {
      if (postContent) {
        const facebookExpandButton =
          postContent?.querySelector<HTMLElement>('[role="button"]')
        if (facebookExpandButton) {
          facebookExpandButton.click()
          await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
        }
      }
      let postAuthor = (
        postMetadata.querySelector<HTMLElement>('h4[id] [role="link"]') ||
        postMetadata.querySelector<HTMLElement>('h3[id] [role="link"]') ||
        postMetadata.querySelector<HTMLElement>('h2[id] [role="link"]')
      )?.innerText
      // maybe the metadata has recommendation, so it need to find the correct metadata
      const correctMetadata = Array.from(
        postMetadata?.querySelectorAll<HTMLElement>('span[id] [role="link"]') ||
          [],
      )
      if (correctMetadata.length > 1 && correctMetadata[0]?.innerText) {
        postAuthor = correctMetadata[0]?.innerText
      }
      const date = correctMetadata?.pop()?.innerText
      return {
        author: postAuthor || '',
        date: date && date.length <= 30 ? date : '',
        content: postContent?.innerText || '',
        title: '',
      }
    }
  }
  return null
}

// 获取Facebook视频帖子的作者，日期，内容
const getFacebookVideoPostData = async (
  postContainer: HTMLElement | null,
): Promise<ISocialMediaPost | null> => {
  if (postContainer) {
    const postMetadata = postContainer?.firstElementChild?.children?.[1]
    if (postMetadata) {
      const postContent = postContainer?.lastElementChild as HTMLElement
      if (postContent) {
        const facebookExpandButton =
          postContent?.querySelector<HTMLElement>('[role="button"]')
        if (facebookExpandButton) {
          facebookExpandButton.click()
          await delayAndScrollToInputAssistantButton(100)
        }
      }
      const postAuthor =
        postMetadata?.querySelector<HTMLElement>('h2 [role="link"]')?.innerText
      const postDate = (
        postMetadata?.querySelector<HTMLElement>(
          'span > span > span [aria-label][role="link"]',
        ) ||
        postMetadata?.querySelector<HTMLElement>(
          'span > span > span [role="link"] [aria-labelledby]',
        )
      )?.innerText
      return {
        author: postAuthor || '',
        date: postDate && postDate.length <= 30 ? postDate : '',
        content: postContent?.querySelector?.('div')?.innerText || '',
        title:
          document.querySelector<HTMLElement>(
            '#watch_feed > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)',
          )?.innerText || '',
      }
    }
  }
  return null
}

// 获取Facebook Reel帖子的作者，日期，内容
const getFacebookReelPostData = async (
  postContainer: HTMLElement | null,
  inputAssistantButton: HTMLElement,
): Promise<ISocialMediaPost | null> => {
  if (postContainer) {
    const postAuthor =
      postContainer?.firstElementChild?.querySelector<HTMLElement>(
        'h2 [role="link"][aria-label]',
      )?.innerText
    const postContent = postContainer?.children?.[1] as HTMLElement
    if (postContent) {
      // need to fix: when get reel post data again, at that time it becomes a collapse button
      const facebookExpandButton =
        postContent?.querySelector<HTMLElement>('[role="button"]')
      if (facebookExpandButton) {
        facebookExpandButton.click()
        await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
      }
    }

    return {
      author: postAuthor || '',
      date: '',
      content: postContent?.innerText || '',
      title: '',
    }
  }
  return null
}

// 获取Facebook评论的作者，日期，内容
const getFacebookCommentDetail = async (
  root: HTMLElement,
): Promise<ICommentData> => {
  const commentAuthor =
    (root?.querySelector('a > span > span') as HTMLSpanElement)?.innerText || ''
  const commentContent = root?.querySelector(
    'span[lang][dir]',
  ) as HTMLSpanElement
  if (commentContent) {
    const expandButton =
      commentContent.querySelector<HTMLElement>('[role="button"]')
    if (expandButton) {
      expandButton.click()
      await delayAndScrollToInputAssistantButton(100)
    }
  }
  const links = Array.from(
    root?.querySelectorAll('a > span'),
  ) as HTMLSpanElement[]
  const commentDate = links[links.length - 1]?.innerText
  return {
    content: commentContent?.innerText || '',
    author: commentAuthor,
    date: commentDate && commentDate.length <= 30 ? commentDate : '',
  }
}

// get the previous level comment
// temp redundant code, need to optimize:
const getCommentsBox = (commentElement: HTMLElement, needFurther = false) => {
  let commentsBox =
    commentElement?.parentElement?.parentElement?.parentElement?.parentElement
      ?.parentElement
  if (needFurther) commentsBox = commentsBox?.parentElement
  return commentsBox
}

export const facebookGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  const videoPagePostBox =
    document.querySelector<HTMLElement>(
      'div:has(> [data-pagelet="WatchPermalinkVideo"]) + div > div',
    ) ||
    document.querySelector<HTMLElement>(
      'div[data-pagelet="TahoeRightRail"] > div > div',
    ) ||
    document.querySelector<HTMLElement>(
      '#watch_feed > div > div:nth-child(1) > div > div > div:nth-child(2) > div:nth-child(1)',
    ) ||
    document.querySelector<HTMLElement>(
      '[role="dialog"][aria-label] div[role="complementary"] > div:nth-child(1) >div >div:nth-child(1) > div > div > div:nth-child(1)',
    )

  const reelPagePostBox =
    document.querySelector<HTMLElement>(
      'div[data-pagelet="ReelsCommentPane"]',
    ) ||
    document.querySelector<HTMLElement>(
      '[role="main"]:not(:has([aria-describedby][aria-labelledby])) + [role="complementary"] > div > div:nth-child(1) > div > div:nth-child(1) > div',
    )

  const postDialog = findParentEqualSelector(
    '[role="dialog"]:not([aria-label])',
    inputAssistantButton,
    50,
  )

  const postBox =
    findParentEqualSelector(
      '[role="article"]:not([aria-label]):not(:has( > [aria-label]))',
      inputAssistantButton,
      30,
    ) ||
    findParentEqualSelector(
      'div[aria-describedby][aria-labelledby]',
      inputAssistantButton,
      30,
    )

  // if dialog exists, then it should get post data from dialog
  //
  // or click on explicit quick reply button, it should get post data from the surface
  const facebookPostData = await (videoPagePostBox
    ? getFacebookVideoPostData(videoPagePostBox)
    : reelPagePostBox
    ? getFacebookReelPostData(reelPagePostBox, inputAssistantButton)
    : getFacebookPostData(
        postDialog ? postDialog : postBox,
        inputAssistantButton,
      ))

  if (facebookPostData) {
    const facebookSocialMediaPostContext = new SocialMediaPostContext(
      facebookPostData,
    )

    const commentSelector = 'div[role="article"][aria-label]'
    const facebookReplyForm = findSelectorParent(
      'form[role="presentation"]',
      inputAssistantButton,
    )
    const isClickingOnButtonOfFormTextarea =
      facebookReplyForm?.contains(inputAssistantButton)

    // if clicking the quick reply button in the surface is only to get the post data
    let shouldGetComment = true
    if (!reelPagePostBox && !postDialog) {
      let facebookReplyFormNodes: HTMLElement[] = []
      if (postBox) {
        const surfaceActionBar =
          findParentEqualSelector(
            'div[role="article"] div[data-visualcompletion="ignore-dynamic"] > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)',
            inputAssistantButton,
          ) ||
          findParentEqualSelector(
            'div[aria-describedby][aria-labelledby] div[data-visualcompletion="ignore-dynamic"] > div > div:nth-child(1) > div:nth-child(1) div:has(>div>div[aria-label][role="button"])',
            inputAssistantButton,
          )
        if (surfaceActionBar?.contains(inputAssistantButton)) {
          shouldGetComment = false
        }
        facebookReplyFormNodes = Array.from(
          postBox?.querySelectorAll<HTMLElement>('form[role="presentation"]') ||
            [],
        )
      } else if (videoPagePostBox && isClickingOnButtonOfFormTextarea) {
        facebookReplyFormNodes = Array.from(
          videoPagePostBox?.parentElement?.querySelectorAll<HTMLElement>(
            'form[role="presentation"]',
          ) || [],
        )
      }
      if (
        shouldGetComment &&
        isClickingOnButtonOfFormTextarea &&
        facebookReplyFormNodes?.at(-1)?.contains(inputAssistantButton)
      ) {
        shouldGetComment = false
      }
    }

    if (shouldGetComment) {
      // if result is extremely wrong, should check it: `highlight` css name had changed
      let currentComment = findSelectorParentStrict(
        `${commentSelector}${
          isClickingOnButtonOfFormTextarea ? ':has(.xfmpgtx)' : ''
        }`,
        inputAssistantButton,
      )
      if (!currentComment && isClickingOnButtonOfFormTextarea) {
        currentComment = findSelectorParentStrict(
          commentSelector,
          inputAssistantButton,
        )
      }
      if (currentComment) {
        let prevLevelComment: HTMLElement | null = null
        let currentCommentDetail = await getFacebookCommentDetail(
          currentComment,
        )

        const facebookPostComments: ICommentData[] = []

        // if click on the quick reply button in form textarea
        if (isClickingOnButtonOfFormTextarea) {
          // it maybe chose the first comment by same level, and it is not the correct comment
          const comments = Array.from(
            getCommentsBox(currentComment)?.querySelectorAll<HTMLElement>(
              commentSelector,
            ) || [],
          )
          prevLevelComment = comments[0]
          // third nesting comments
          if (prevLevelComment === currentComment) {
            comments.shift()
            if (comments.length === 0) {
              prevLevelComment = null
            }
          }

          const mention = facebookReplyForm.querySelector<HTMLElement>(
            'span[spellcheck="false"][data-lexical-text]',
          )

          // need to fix: maybe will cause issues like `linkedinGetPostContent()` did
          if (mention) {
            for (let i = 0; i < comments.length; i++) {
              const formerComment = comments[i]
              const formerCommentDetail = await getFacebookCommentDetail(
                formerComment,
              )
              if (formerCommentDetail.author === mention.innerText) {
                currentComment = formerComment
                currentCommentDetail = formerCommentDetail
                break
              }
            }
          }
        }

        facebookPostComments.push(currentCommentDetail)

        if (!prevLevelComment || prevLevelComment === currentComment) {
          prevLevelComment = findSelectorParentStrict(
            commentSelector,
            getCommentsBox(currentComment, true)!,
          )
        }

        // eslint-disable-next-line no-constant-condition
        while (currentComment && prevLevelComment) {
          // if they are same level comment, then it should get the further parent comment to compare
          if (
            getCommentsBox(prevLevelComment, true) ===
            getCommentsBox(currentComment, true)
          ) {
            const furtherPrevLevelComment = findSelectorParentStrict(
              commentSelector,
              prevLevelComment,
            )
            if (
              !furtherPrevLevelComment ||
              furtherPrevLevelComment.isSameNode(prevLevelComment)
            ) {
              break
            }
            facebookPostComments.unshift(
              await getFacebookCommentDetail(furtherPrevLevelComment),
            )
            currentComment = furtherPrevLevelComment
            prevLevelComment = findSelectorParentStrict(
              commentSelector,
              currentComment,
            )
          } else {
            facebookPostComments.unshift(
              await getFacebookCommentDetail(prevLevelComment),
            )
            currentComment = prevLevelComment
            prevLevelComment = findSelectorParentStrict(
              commentSelector,
              currentComment,
            )
          }
        }
        if (facebookPostComments.length > 0) {
          facebookSocialMediaPostContext.addCommentList(facebookPostComments)
        }
      }
    }
    return facebookSocialMediaPostContext.data
  }

  return SocialMediaPostContext.emptyData

  // const facebookReplyForm = findSelectorParent(
  //   'form[role="presentation"]',
  //   inputAssistantButton,
  // )
  // const facebookPostContentCard =
  //   findSelectorParent(
  //     'div > div:not(:first-child) > blockquote > span > div',
  //     facebookReplyForm,
  //     30,
  //   ) ||
  //   findSelectorParent('div[data-ad-preview="message"]', facebookReplyForm, 30)
  // const hTagAuthorElement =
  //   findSelectorParent('span:has(h3 > span)', facebookReplyForm, 30) ||
  //   findSelectorParent('span:has(h2 > span)', facebookReplyForm, 30)
  // const facebookPostAuthorElement =
  //   hTagAuthorElement ||
  //   findSelectorParent('span:has(h4 > div)', facebookReplyForm, 30)
  // const facebookPostAuthor = facebookPostAuthorElement?.innerText || ''
  // const facebookPostDate = hTagAuthorElement
  //   ? (facebookPostAuthorElement?.nextElementSibling?.querySelector(
  //       'a',
  //     ) as HTMLAnchorElement)?.innerText
  //   : facebookPostAuthorElement?.parentElement?.nextElementSibling?.querySelectorAll(
  //       'a',
  //     )?.[1]?.innerText || ''
  // const facebookExpandButton = facebookPostContentCard?.querySelector(
  //   'div[dir] > div[role="button"]',
  // ) as HTMLDivElement
  // if (facebookExpandButton) {
  //   facebookExpandButton.click()
  //   await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
  // }
  // const facebookPostContent = facebookPostContentCard?.innerText || ''
  // const facebookPostComments: ICommentData[] = []
  // const facebookSocialMediaPostContext = new SocialMediaPostContext({
  //   author: facebookPostAuthor,
  //   date: facebookPostDate,
  //   content: facebookPostContent,
  //   title: '',
  // })
  // if (facebookReplyForm) {
  //   const replyInput = facebookReplyForm.querySelector(
  //     'div[contenteditable="true"][role="textbox"]',
  //   ) as HTMLDivElement
  //   const replyContent = replyInput?.innerText || ''
  //   let parentLiElement: HTMLElement | null = findParentEqualSelector(
  //     'li',
  //     facebookReplyForm,
  //     10,
  //   )
  //   while (parentLiElement) {
  //     const commentElement = parentLiElement.childNodes[0] as HTMLDivElement
  //     if (commentElement) {
  //       const facebookCommentData = await getFacebookCommentDetail(
  //         commentElement,
  //       )
  //       // 这是Facebook回复列表的某个回复, 某个回复下的一堆回复，用户点击了其中一个 input就会有用户名，类似linkedin
  //       if (
  //         facebookPostComments.length === 0 &&
  //         !replyContent.startsWith(facebookCommentData.author)
  //       ) {
  //         if (parentLiElement && replyContent) {
  //           const listItems = Array.from(
  //             parentLiElement.querySelectorAll('& > div > ul li > div'),
  //           ) as HTMLDivElement[]
  //           for (let i = 0; i < listItems.length; i++) {
  //             const listItem = listItems[i]
  //             const commentDetail = await getFacebookCommentDetail(listItem)
  //             if (replyContent.startsWith(commentDetail.author)) {
  //               facebookPostComments.push(commentDetail)
  //               break
  //             }
  //           }
  //         }
  //       }
  //       facebookPostComments.splice(0, 0, facebookCommentData)
  //       if (parentLiElement?.parentElement) {
  //         parentLiElement = findParentEqualSelector(
  //           'li',
  //           parentLiElement.parentElement,
  //           10,
  //         )
  //         continue
  //       }
  //     }
  //     break
  //   }
  //   if (!facebookPostComments.length) {
  //     // update - 2024-01-04 - 2.0版本
  //     const inputValue = replyContent.replace('\n', '')
  //     // 回复框所在的根级Comment，不一定是最顶层，有可能还是被嵌套的3、4级
  //     const facebookReplyFormRootElement = findSelectorParent(
  //       'div[class]:has( > div[class] > div[class] > div[class] > div[class] > div[class] > div[class] > div[class] form)',
  //       facebookReplyForm,
  //     )
  //     if (facebookReplyFormRootElement) {
  //       // NOTE: Facebook的层级是这样:
  //       // 1.先找到Form的Root
  //       // 2.再找到对应的"Form的根级Comment"
  //       // 3.再找是不是回复"Form的根级Comment"的子级的Comment
  //       // 4.再找"Form的根级Comment"的父级Comment
  //       const facebookReplyFormRootArticle = facebookReplyFormRootElement
  //         ?.parentElement?.parentElement
  //         ?.previousElementSibling as HTMLDivElement
  //       if (facebookReplyFormRootArticle) {
  //         const facebookReplyFormRootArticleComment = await getFacebookCommentDetail(
  //           facebookReplyFormRootArticle,
  //         )
  //         if (!facebookReplyFormRootArticleComment.author) {
  //           return facebookSocialMediaPostContext.data
  //         }
  //         const childComments = facebookReplyFormRootArticle.nextElementSibling
  //           ? (Array.from(
  //               facebookReplyFormRootArticle.nextElementSibling.querySelectorAll(
  //                 'div[role="article"]',
  //               ),
  //             ) as HTMLDivElement[])
  //           : []
  //         if (childComments && inputValue) {
  //           for (let i = 0; i < childComments.length; i++) {
  //             const commentData = await getFacebookCommentDetail(
  //               childComments[i],
  //             )
  //             if (
  //               commentData.author &&
  //               inputValue.startsWith(commentData.author)
  //             ) {
  //               facebookPostComments.push(commentData)
  //             }
  //           }
  //         }
  //         facebookPostComments.unshift(facebookReplyFormRootArticleComment)
  //         // 到这一步，回复框所在的父级comment和子级comment就处理完成了
  //         // 还需要递归处理父级comment的父级comment
  //         let parentComment = findSelectorParentStrict(
  //           'div > div[class] > div[class]:has( > div[role="article"])',
  //           facebookReplyFormRootArticle,
  //         )
  //         let prevComment: HTMLElement = facebookReplyFormRootArticle
  //         while (parentComment) {
  //           if (
  //             prevComment?.parentElement?.parentElement?.parentElement?.isSameNode(
  //               parentComment?.parentElement?.parentElement?.parentElement ||
  //                 null,
  //             )
  //           ) {
  //             break
  //           }
  //           const commentData = await getFacebookCommentDetail(parentComment)
  //           if (commentData.author === '') {
  //             break
  //           }
  //           if (facebookPostComments[0].content === commentData.content) {
  //             // 说明重复了
  //             break
  //           }
  //           facebookPostComments.unshift(commentData)
  //           prevComment = parentComment
  //           parentComment = findSelectorParentStrict(
  //             'div > div[class] > div[class]:has( > div[role="article"])',
  //             parentComment,
  //           )
  //         }
  //       }
  //     } else {
  //       // since - 2023-09-26 - 1.0版本
  //       // 更新了一下判断是回复人还是回复帖子
  //       const homePagePostReplyFormRoot = findSelectorParent(
  //         '& > div:has(div[role="article"]) + div:has(form)',
  //         facebookReplyForm,
  //         15,
  //       )
  //       if (homePagePostReplyFormRoot?.parentElement?.getAttribute('class')) {
  //         // 说明是回复帖子
  //         // 不做处理
  //       } else {
  //         // 在主页回复的comment的容器
  //         const homePagePostReplyCommentRoot = homePagePostReplyFormRoot?.previousElementSibling?.querySelector(
  //           'div[role="article"]',
  //         ) as HTMLDivElement
  //         if (homePagePostReplyCommentRoot) {
  //           const commentData = await getFacebookCommentDetail(
  //             homePagePostReplyCommentRoot,
  //           )
  //           facebookPostComments.push(commentData)
  //         }
  //       }
  //     }
  //   }
  //   facebookSocialMediaPostContext.addCommentList(facebookPostComments)
  // }
  // return facebookSocialMediaPostContext.data
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
