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
import { HTMLDivElement } from 'linkedom'

const getYouTubeStudioCommentContent = async (
  ytcpCommentBox: HTMLElement,
): Promise<ICommentData> => {
  const author =
    (ytcpCommentBox.querySelector('#badge-name') as HTMLSpanElement)
      ?.innerText ||
    (ytcpCommentBox.querySelector('#name') as HTMLSpanElement)?.innerText ||
    ''
  const date =
    ((ytcpCommentBox.querySelector(
      'yt-formatted-string.published-time-text',
    ) as any) as HTMLDivElement)?.innerText || ''
  const expandButton = ytcpCommentBox?.querySelector(
    'ytcp-button#more',
  ) as HTMLButtonElement
  if (expandButton) {
    expandButton.click()
    await delayAndScrollToInputAssistantButton(100)
  }
  const commentText =
    ((ytcpCommentBox.querySelector('#content-text') as any) as HTMLDivElement)
      ?.innerText || ''
  return {
    author,
    date,
    content: commentText,
  }
}

export const youTubeStudioGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
) => {
  try {
    // comment box
    const ytcpCommentBox = findParentEqualSelector(
      'ytcp-commentbox',
      inputAssistantButton,
    )
    if (!ytcpCommentBox) {
      return SocialMediaPostContext.emptyData
    }
    const commentBoxRoot = findParentEqualSelector(
      'ytcp-comment-thread',
      ytcpCommentBox,
    )
    const sourceVideoLink = commentBoxRoot?.querySelector(
      'ytcp-comment-button > a[href]',
    ) as HTMLAnchorElement
    const youTubeVideoId = YoutubeTranscript.retrieveVideoId(
      sourceVideoLink?.href || '',
    )
    // 上下文
    let youTubeSocialMediaPostContext: SocialMediaPostContext | null = null
    if (youTubeVideoId) {
      // youTube transcript
      const youTubeTranscriptText = await YoutubeTranscript.transcriptFormat(
        await YoutubeTranscript.fetchTranscript(window.location.href),
        2048,
      )
      const title =
        (commentBoxRoot?.querySelector(
          '#video-title > yt-formatted-string',
        ) as HTMLHeadingElement)?.innerText || document.title
      const userName = ((document.querySelector(
        '#entity-name',
      ) as any) as HTMLDivElement)?.innerText
      const date = ''
      let content = ''
      if (youTubeTranscriptText) {
        content += `\n\n[Transcript]:\n${youTubeTranscriptText}`
      }
      youTubeSocialMediaPostContext = new SocialMediaPostContext(
        {
          title,
          author: `${userName}`,
          date,
          content,
        },
        {
          postTagName: '[YouTube Video Post]',
        },
      )
    }
    if (ytcpCommentBox && youTubeSocialMediaPostContext) {
      const ytcpRootComment = findParentEqualSelector(
        'ytcp-comment-thread',
        ytcpCommentBox,
      )?.querySelector('& > ytcp-comment' as any) as HTMLElement
      // 第一层评论
      if (ytcpRootComment) {
        const currenYtcpCommentBox = findParentEqualSelector(
          'ytcp-comment',
          ytcpCommentBox,
        )
        if (currenYtcpCommentBox) {
          // 判断是不是回复别人的评论
          const ytdCommentRepliesRenderer = findSelectorParent(
            'ytcp-comment-replies',
            currenYtcpCommentBox,
            5,
          )
          // youtube只有两层评论
          if (
            ytdCommentRepliesRenderer?.contains(currenYtcpCommentBox) &&
            !currenYtcpCommentBox.isSameNode(ytcpRootComment)
          ) {
            youTubeSocialMediaPostContext.addCommentList([
              await getYouTubeStudioCommentContent(ytcpRootComment),
              await getYouTubeStudioCommentContent(currenYtcpCommentBox),
            ])
          } else {
            // 只有一层评论
            youTubeSocialMediaPostContext.addCommentList([
              await getYouTubeStudioCommentContent(ytcpRootComment),
            ])
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
export const youTubeStudioGetDraftContent: GetSocialMediaPostDraftFunction = (
  inputAssistantButton,
) => {
  const youTubeDraftEditor = findSelectorParent(
    'textarea#textarea',
    inputAssistantButton,
    30,
  )
  return youTubeDraftEditor?.innerText || ''
}
