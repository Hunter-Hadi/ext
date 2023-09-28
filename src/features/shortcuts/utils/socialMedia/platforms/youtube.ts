import {
  GetSocialMediaPostContentFunction,
  GetSocialMediaPostDraftFunction,
} from '@/features/shortcuts/utils/socialMedia/platforms/types'
import SocialMediaPostContext, {
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'
import {
  delayAndScrollToInputAssistantButton,
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'

const getYouTubeCommentContent = async (
  ytdCommentBox: HTMLElement,
): Promise<ICommentData> => {
  const author =
    (ytdCommentBox.querySelector(
      '#header-author #author-text > span',
    ) as HTMLSpanElement)?.innerText || ''
  const date =
    (ytdCommentBox.querySelector(
      '#header-author > yt-formatted-string',
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
    author,
    date,
    content: commentText,
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
        2048,
      )
      const youTubeVideoMetaData = document.querySelector('ytd-watch-metadata')
      const title =
        (youTubeVideoMetaData?.querySelector(
          '#title > h1',
        ) as HTMLHeadingElement).innerText || document.title
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
        ) as HTMLSpanElement).innerText || ''
      let content =
        (youTubeVideoMetaData?.querySelector(
          '#description ytd-text-inline-expander yt-attributed-string',
        ) as HTMLDivElement)?.innerText || ''
      if (youTubeTranscriptText) {
        content += `\n\n[Transcript]:\n${youTubeTranscriptText}`
      }
      youTubeSocialMediaPostContext = new SocialMediaPostContext(
        {
          title,
          author: `${userName}(${account})`,
          date,
          content,
        },
        {
          postTagName: '[YouTube Video Post]',
        },
      )
    } else if (
      window.location.href.startsWith('https://www.youtube.com/shorts')
    ) {
      // 短视频
      const ytdReelPlayerHeader = document.querySelector(
        'ytd-reel-player-header-renderer',
      )
      if (ytdReelPlayerHeader) {
        const title = ''
        const content =
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
            content,
          },
          {
            postTagName: '[YouTube Shorts Post]',
          },
        )
      }
    }
    if (ytdCommentBox && youTubeSocialMediaPostContext) {
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
      return youTubeSocialMediaPostContext.data
    }
  } catch (e) {
    console.error(e)
  }
  return SocialMediaPostContext.emptyData
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
