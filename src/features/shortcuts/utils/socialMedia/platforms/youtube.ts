import cloneDeep from 'lodash-es/cloneDeep'

import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import SocialMediaPostContext, {
  createCommentListData,
  ICommentData,
  ICreateCommentListData,
  ISocialMediaPostContextData,
} from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import {
  delayAndScrollToInputAssistantButton,
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

const getYouTubeCommentContent = async (
  ytdCommentBox: HTMLElement,
): Promise<ICommentData> => {
  const author =
    ytdCommentBox.querySelector<HTMLElement>('#author-text yt-formatted-string')
      ?.innerText || ''
  const date =
    ytdCommentBox.querySelector<HTMLElement>(
      'yt-formatted-string.published-time-text',
    )?.innerText || ''
  const commentText =
    ytdCommentBox.querySelector<HTMLElement>('#content-text')?.innerText || ''
  const like =
    ytdCommentBox.querySelector<HTMLElement>('#vote-count-middle')?.innerText ||
    ''
  return {
    author,
    date,
    content: commentText,
    like: like.trim(),
  }
}

export const youTubeGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  try {
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
        (
          youTubeVideoMetaData?.querySelector(
            '#title > h1',
          ) as HTMLHeadingElement
        )?.innerText || document.title
      const authorElement = document.querySelector('ytd-video-owner-renderer')
      const userName = authorElement?.querySelector(
        'yt-formatted-string',
      )?.textContent
      const expandButton = youTubeVideoMetaData?.querySelector(
        'tp-yt-paper-button#expand',
      ) as HTMLButtonElement
      if (expandButton && !expandButton.hidden) {
        // 如果点击过该元素隐藏了就跳过，否则会出每次重新执行时滚动条都会跳转到inputAssistantButton元素
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
        (
          youTubeVideoMetaData?.querySelector(
            '#description #info-container yt-formatted-string > span:nth-child(3)',
          ) as HTMLSpanElement
        )?.innerText || ''
      const content =
        (
          youTubeVideoMetaData?.querySelector(
            '#description ytd-text-inline-expander yt-attributed-string',
          ) as HTMLDivElement
        )?.innerText || ''
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
          (
            ytdReelPlayerHeader?.querySelector(
              '.title > yt-formatted-string',
            ) as HTMLDivElement
          )?.innerText || ''
        const author =
          (
            ytdReelPlayerHeader?.querySelector(
              'ytd-channel-name #text-container yt-formatted-string',
            ) as HTMLDivElement
          )?.innerText || ''
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
      // comment box
      const youtubeCommentBoxSelector = '#body.ytd-comment-view-model'
      const ytdCommentBox = findParentEqualSelector(
        youtubeCommentBoxSelector,
        inputAssistantButton,
      )
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
          const commentList: ICommentData[] = []
          const isReplyingOthersExpandingReply = Boolean(
            findParentEqualSelector(
              '#replies.ytd-comment-thread-renderer',
              ytdCommentBox,
              6,
            ),
          )
          if (isReplyingOthersExpandingReply) {
            const ytdRootComment = findParentEqualSelector(
              'ytd-comment-thread-renderer',
              ytdCommentBox,
            )?.querySelector<HTMLElement>(
              `& > ytd-comment-view-model#comment ${youtubeCommentBoxSelector}`,
            )
            commentList.push(await getYouTubeCommentContent(ytdRootComment!))
          }
          commentList.push(await getYouTubeCommentContent(ytdCommentBox))
          youTubeSocialMediaPostContext.addCommentList(commentList)
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
  try {
    const commentsInfo = await youTubeGetPostCommentsInfo()
    if (commentsInfo?.commentsData && commentsInfo.commitList.length > 0) {
      const postText = `${result?.postText}\n[Post commentList]:\n${
        commentsInfo?.commentsData.fullText || 'N/A'
      }`
      const pageContent = `${
        result?.SOCIAL_MEDIA_PAGE_CONTENT
      }\n[Page commentList]:\n${commentsInfo?.commentsData.fullText || 'N/A'}`
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
  } catch (e) {
    console.log(e)
    return null
  }
}

// 设置 youtube 评论窗口定位到屏幕上方左边并隐藏
const setCommentLoadingPosition = () => {
  const selector = document.querySelector(
    '#below ytd-item-section-renderer.style-scope.ytd-comments',
  )
  if (selector instanceof HTMLElement) {
    selector.style.position = 'fixed'
    selector.style.top = '0'
    selector.style.left = '0'
    selector.style.visibility = 'hidden'
  }
}

// 去除youtube 评论窗口定位并显示出来
const resetCommentLoadingPosition = () => {
  const selector = document.querySelector(
    '#below ytd-item-section-renderer.style-scope.ytd-comments',
  )
  if (selector instanceof HTMLElement) {
    selector.style.position = ''
    selector.style.top = ''
    selector.style.left = ''
    selector.style.display = ''
    selector.style.visibility = 'visible'
  }
}
export const youTubeGetPostCommentsInfo: () => Promise<{
  commentsData: ICreateCommentListData | null
  commitList: ICommentData[]
} | null> = async () => {
  try {
    await awaitScrollFun(
      () => {
        const primarySkeleton = document.querySelector('ytd-watch-flexy')
        const domVideoId = primarySkeleton?.getAttribute('video-id')
        const urlObj = new URL(window.location.href)
        const urlVideoId = urlObj.searchParams.get('v')
        return domVideoId === urlVideoId
      },
      500,
      1000 * 60,
    ) //等待videoID变化完成
    if (document?.querySelector('#sections #count')) {
      const commitList = await getCommitList()
      const commentsData = createCommentListData(commitList || [])
      return { commentsData, commitList }
    } else {
      setCommentLoadingPosition() //模拟加载窗口出现了

      if (document.getElementById('content-pages')) {
        //直播页面直接无评论
        resetCommentLoadingPosition() //模拟加载窗口出现了
        return null
      }
      const topCommentsOff = document.querySelector('#message a')
      if (
        topCommentsOff &&
        topCommentsOff
          .getAttribute('href')
          ?.includes('support.google.com/youtube/answer/9706180')
      ) {
        resetCommentLoadingPosition() //模拟加载窗口出现了
        //代表评论关闭 状态
        return null
      }
      console.log('simply 2')
      let scrollIndex = 0
      await awaitScrollFun(
        () => {
          if (scrollIndex > 10) {
            return true
          }
          scrollIndex += 1
          const countDom = document?.querySelector(
            '#sections #count .style-scope.yt-formatted-string',
          )
          return (
            !!countDom && window.getComputedStyle(countDom).display !== 'none' //判断count是否出现了
          )
        },
        300,
        1000 * 10,
      )
      resetCommentLoadingPosition() //去除 模拟加载
      await awaitScrollFun(
        () => {
          //判断用户头像图片是否加载完成则数据完成开始获取
          const avatarView = document.querySelector('#author-thumbnail img')
          if (
            avatarView?.clientWidth &&
            avatarView?.clientHeight &&
            avatarView?.clientWidth > 0 &&
            avatarView?.clientHeight > 0
          ) {
            return true
          } else {
            return false
          }
        },
        500,
        1000 * 5,
      )
      const commitList = await getCommitList()
      const commentsData = createCommentListData(commitList || [])
      return cloneDeep({ commentsData, commitList })
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
        resolve()
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
          commentThreadRenderer as unknown as HTMLElement,
        )
        list.push(data)
      }
    }
    return list
  } catch (e) {
    return []
  }
}
