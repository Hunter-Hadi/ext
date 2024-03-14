import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
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
  createCommentListData,
  ICommentData,
  ICreateCommentListData,
  ISocialMediaPostContextData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'

const getYouTubeCommentContent = async (
  ytdCommentBox: HTMLElement,
): Promise<ICommentData> => {
  const author =
    (ytdCommentBox.querySelector(
      '#header-author #author-text > span',
    ) as HTMLSpanElement)?.innerText || ''
  const commentAuthor =
    (ytdCommentBox.querySelector(
      '#header-author #author-text > yt-formatted-string',
    ) as HTMLSpanElement)?.innerText || ''
  const date =
    (ytdCommentBox.querySelector(
      '#header-author > yt-formatted-string',
    ) as HTMLDivElement)?.innerText || ''
  const like =
    (ytdCommentBox.querySelector(
      '#toolbar > #vote-count-left',
    ) as HTMLDivElement)?.innerText || ''
  const expandButton = ytdCommentBox?.querySelector(
    'tp-yt-paper-button#expand',
  ) as HTMLButtonElement
  if (expandButton) {
    expandButton.click()
    await delayAndScrollToInputAssistantButton(100)
  }
  const commentText =
    (ytdCommentBox.querySelector('#content-text') as HTMLDivElement)
      ?.innerText || ''
  return {
    author: (author || commentAuthor).replace(/\n/g, '').trim(),
    date,
    content: commentText,
    like: like.replace(/\n/g, '').trim(),
  }
}

export const youTubeGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  try {
    // comment box
    const ytdCommentBox = findParentEqualSelector(
      'ytd-commentbox',
      inputAssistantButton,
    )
    const youTubeVideoId = YoutubeTranscript.retrieveVideoId(
      window.location.href,
    )
    // 上下文
    let youTubeSocialMediaPostContext: SocialMediaPostContext | null = null
    if (youTubeVideoId) {
      // youTube transcript
      const youTubeTranscriptText = await YoutubeTranscript.transcriptFormat(
        await YoutubeTranscript.fetchTranscript(window.location.href),
      )
      const youTubeVideoMetaData = document.querySelector('ytd-watch-metadata')
      const title =
        (youTubeVideoMetaData?.querySelector(
          '#title > h1',
        ) as HTMLHeadingElement)?.innerText || document.title
      const authorElement = document.querySelector('ytd-video-owner-renderer')
      const userName = authorElement?.querySelector('yt-formatted-string')
        ?.textContent
      const expandButton = youTubeVideoMetaData?.querySelector(
        'tp-yt-paper-button#expand',
      ) as HTMLButtonElement
      if (expandButton) {
        expandButton.click()
        await delayAndScrollToInputAssistantButton(100, inputAssistantButton)
      }
      const account =
        authorElement
          ?.querySelector('a')
          ?.getAttribute('href')
          ?.includes('@') &&
        authorElement?.querySelector('a')?.getAttribute('href')?.split('/')[1]
      const date =
        (youTubeVideoMetaData?.querySelector(
          '#description #info-container yt-formatted-string > span:nth-child(3)',
        ) as HTMLSpanElement)?.innerText || ''
      const content =
        (youTubeVideoMetaData?.querySelector(
          '#description ytd-text-inline-expander yt-attributed-string',
        ) as HTMLDivElement)?.innerText || ''
      youTubeSocialMediaPostContext = new SocialMediaPostContext(
        {
          title,
          author: `${userName}(${account})`,
          date,
          content,
        },
        {
          postTitle: 'Video post',
          meta: {
            'Post video transcript': youTubeTranscriptText,
          },
        },
      )
    } else if (
      window.location.href.startsWith('https://www.youtube.com/shorts')
    ) {
      // 短视频
      const rootContainer = findParentEqualSelector(
        'ytd-reel-video-renderer',
        inputAssistantButton,
        50,
      ) as HTMLDivElement
      const ytdReelPlayerHeader = rootContainer?.querySelector(
        'ytd-reel-player-header-renderer',
      )
      if (ytdReelPlayerHeader) {
        const title =
          (ytdReelPlayerHeader?.querySelector(
            '.title > yt-formatted-string',
          ) as HTMLDivElement)?.innerText || ''
        const author =
          (ytdReelPlayerHeader?.querySelector(
            'ytd-channel-name #text-container yt-formatted-string',
          ) as HTMLDivElement)?.innerText || ''
        youTubeSocialMediaPostContext = new SocialMediaPostContext(
          {
            title,
            author,
            date: '',
            content: '',
          },
          {
            postTitle: 'Video post',
          },
        )
      }
    }
    if (youTubeSocialMediaPostContext) {
      if (ytdCommentBox) {
        // 视频底下的评论
        if (
          findParentEqualSelector(
            'ytd-comment-simplebox-renderer',
            ytdCommentBox,
            5,
          )
        ) {
          // Nothing
        } else {
          const ytdRootComment = findParentEqualSelector(
            'ytd-comment-thread-renderer',
            ytdCommentBox,
          )?.querySelector('& > ytd-comment-renderer' as any) as HTMLElement
          // 第一层评论
          if (ytdRootComment) {
            const currenYtdCommentBox = findParentEqualSelector(
              'ytd-comment-renderer',
              ytdCommentBox,
            )
            if (currenYtdCommentBox) {
              // 判断是不是回复别人的评论
              const ytdCommentRepliesRenderer = findSelectorParent(
                'ytd-comment-replies-renderer',
                currenYtdCommentBox,
                5,
              )
              // youtube只有两层评论
              if (
                ytdCommentRepliesRenderer?.contains(currenYtdCommentBox) &&
                !currenYtdCommentBox.isSameNode(ytdRootComment)
              ) {
                youTubeSocialMediaPostContext.addCommentList([
                  await getYouTubeCommentContent(ytdRootComment),
                  await getYouTubeCommentContent(currenYtdCommentBox),
                ])
              } else {
                // 只有一层评论
                youTubeSocialMediaPostContext.addCommentList([
                  await getYouTubeCommentContent(ytdRootComment),
                ])
              }
            }
          }
        }
      }
      return youTubeSocialMediaPostContext.data
    }
  } catch (e) {
    console.error(e)
  }
  return SocialMediaPostContext.emptyData
}
export const getYouTubeSocialMediaPostCommentsContent: (
  result: ISocialMediaPostContextData,
) => Promise<ISocialMediaPostContextData | null> = async (result) => {
  //获取所有评论,判断是否是youtube视频页面
  const chromeExtensionData = await getChromeExtensionLocalStorage()
  const summaryNavKey =
    chromeExtensionData.sidebarSettings?.summary?.currentNavType?.[
      'YOUTUBE_VIDEO_SUMMARY'
    ]
  if (summaryNavKey !== 'commit') {
    return null
  }
  const delTranscriptPostText = result?.postText.substring(
    0,
    result?.postText.indexOf('**Post video transcript:**') +
      '**Post video transcript:**'.length,
  )
  const delTranscriptContentText = result?.SOCIAL_MEDIA_PAGE_CONTENT.substring(
    0,
    result?.SOCIAL_MEDIA_PAGE_CONTENT.indexOf('**Post video transcript:**') +
      '**Post video transcript:**'.length,
  )

  const commentsInfo = await youTubeGetPostCommentsInfo()
  if (commentsInfo?.commentsData && commentsInfo.commitList.length > 0) {
    const postText = `${delTranscriptPostText}\n[Post commentList]:\n${
      commentsInfo?.commentsData.fullText || 'N/A'
    }`
    const pageContent = `${delTranscriptContentText}\n[Page commentList]:\n${
      commentsInfo?.commentsData.fullText || 'N/A'
    }`
    return {
      ...result,
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: postText,
      SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: postText,
      postText,
      previousComments: commentsInfo.commitList || [],
      previousCommentsText: commentsInfo?.commentsData?.previousText,
      SOCIAL_MEDIA_PAGE_CONTENT: pageContent,
    }
  } else {
    return null
  }
}
export const youTubeGetPostCommentsInfo: () => Promise<{
  commentsData: ICreateCommentListData | null
  commitList: ICommentData[]
} | null> = async () => {
  try {
    if (document?.querySelector('#sections #count')) {
      const commitList = await getCommitList()
      const commentsData = createCommentListData(commitList || [])
      return { commentsData, commitList }
    } else {
      await awaitScrollFun(
        () =>
          !!document?.querySelector(
            '#columns #below #above-the-fold #description #info-container',
          ),
        500,
        1000 * 5,
      ) //等待信息的出现
      const commentsOff = document.querySelector('#message a')
      if (
        commentsOff &&
        commentsOff
          .getAttribute('href')
          ?.includes('support.google.com/youtube/answer/9706180')
      ) {
        //代表评论关闭 状态
        return null
      }
      //没有则滚动到当前主div的最下面
      const items = document.querySelector(
        '#columns.style-scope.ytd-watch-flexy #primary-inner',
      )
      if (items) {
        window.scrollTo({
          top: items?.scrollHeight,
        })
      }
      await awaitScrollFun(
        () =>
          !!document?.querySelector(
            '#sections #count .style-scope.yt-formatted-string',
          ),
        300,
        1000 * 5,
      ) //等待#count出现
      window.scrollTo({ top: 0 })
      const commitList = await getCommitList()
      const commentsData = createCommentListData(commitList || [])

      return { commentsData, commitList }
    }
  } catch (e) {
    console.error(e)
    return null
  }
}
export const youTubeGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  const youTubeDraftEditor = findSelectorParent(
    'div#contenteditable-root[contenteditable="true"]',
    inputAssistantButton,
    30,
  )
  return (youTubeDraftEditor as HTMLDivElement)?.innerText || ''
}

const awaitScrollFun = async (
  condition: () => boolean,
  time?: number,
  timeout?: number,
) => {
  return new Promise<void>((resolve) => {
    const countInterval = setInterval(async () => {
      if (condition && condition()) {
        if (time) {
          setTimeout(() => {
            resolve()
          }, time)
        } else {
          resolve()
        }

        clearInterval(countInterval)
      }
    }, 200)
    if (timeout) {
      setTimeout(() => {
        countInterval && clearInterval(countInterval)
      }, timeout)
    }
  })
}
const getCommitList = async () => {
  try {
    const commentThreadRenderers = document?.getElementsByTagName(
      'ytd-comment-thread-renderer',
    )
    const list = []
    if (commentThreadRenderers) {
      for (let i = 0; i < commentThreadRenderers.length; i++) {
        const commentThreadRenderer = commentThreadRenderers[i]
        const data = await getYouTubeCommentContent(
          (commentThreadRenderer as unknown) as HTMLElement,
        )
        list.push(data)
      }
    }
    return list
  } catch (e) {
    return []
  }
}
