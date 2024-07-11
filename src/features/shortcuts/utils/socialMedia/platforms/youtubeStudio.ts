import { HTMLDivElement } from 'linkedom'
import { v4 as uuidV4 } from 'uuid'

import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
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
import { getInstantReplyDataHelper } from '@/utils/dataHelper/instantReplyHelper'

const getYouTubeStudioCommentContent = async (
  ytcpCommentBox: HTMLElement,
): Promise<ICommentData> => {
  const author =
    (ytcpCommentBox.querySelector('#badge-name') as HTMLSpanElement)
      ?.innerText ||
    (ytcpCommentBox.querySelector('#name') as HTMLSpanElement)?.innerText ||
    ''
  const date =
    (
      ytcpCommentBox.querySelector(
        'yt-formatted-string.published-time-text',
      ) as any as HTMLDivElement
    )?.innerText || ''
  const expandButton = ytcpCommentBox?.querySelector(
    'ytcp-button#more',
  ) as HTMLButtonElement
  if (expandButton) {
    expandButton.click()
    await delayAndScrollToInputAssistantButton(100)
  }
  let commentText = ''

  ytcpCommentBox
    .querySelector<HTMLElement>('#content-text')
    ?.childNodes.forEach((node) => {
      if ((node as HTMLElement).tagName === 'IMG') {
        const emoji = (node as HTMLElement).getAttribute('alt') || ''
        commentText += emoji
      } else {
        commentText += node.textContent
      }
    })

  return {
    author: author.replace(/\n/g, '').trim(),
    date,
    content: commentText,
  }
}

export const youTubeStudioGetPostContent: GetSocialMediaPostContentFunction =
  async (inputAssistantButton) => {
    try {
      // 优化：将上次获取的 context 缓存起来，然后判断
      //// - 1. 如果点的是和上次点的同一个 button
      //// - 2. 或者还是在同一个 context window 里进行操作
      // 那么通过直接返回上次缓存的 context 即可
      const instantReplyDataHelper = getInstantReplyDataHelper()
      const instantReplyButtonId =
        inputAssistantButton.getAttribute('maxai-input-assistant-button-id') ||
        ''
      if (instantReplyButtonId) {
        if (
          instantReplyDataHelper.getAttribute('aria-operation-selector-id') ===
          instantReplyButtonId
        ) {
          const fullContextCache = instantReplyDataHelper.getAttribute(
            'data-full-context-cache',
          )
          const targetContextCache = instantReplyDataHelper.getAttribute(
            'data-target-context-cache',
          )
          if (targetContextCache) {
            return {
              postText: fullContextCache || targetContextCache,
              SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: targetContextCache,
              SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT:
                fullContextCache || targetContextCache,
              SOCIAL_MEDIA_PAGE_CONTENT: '',
            }
          }
        }
        instantReplyDataHelper.setAttribute(
          'aria-operation-selector-id',
          instantReplyButtonId,
        )
      }

      // comment box
      const ytcpCommentBox = findParentEqualSelector(
        'ytcp-comment',
        inputAssistantButton,
      )
      if (ytcpCommentBox) {
        const commentBoxRoot = findParentEqualSelector(
          'ytcp-comment-thread',
          ytcpCommentBox,
        )
        // const sourceVideoLink = commentBoxRoot?.querySelector(
        //   'ytcp-comment-button > a[href]',
        // ) as HTMLAnchorElement
        // const sourceVideoHref = sourceVideoLink?.href
        // youtube studio更改了link存储的方式
        const sourceVideoLink = commentBoxRoot?.querySelector(
          'ytcp-comment-button#view-comment-button',
        ) as HTMLElement
        const sourceVideoHref =
          sourceVideoLink.getAttribute('data-ytb-url') || ''
        const youTubeVideoId = YoutubeTranscript.retrieveVideoId(
          sourceVideoHref || '',
        )
        if (youTubeVideoId) {
          let title = '',
            author = '',
            date = '',
            transcriptText = ''
          if (
            instantReplyDataHelper.getAttribute('aria-youtube-video-id') ===
            youTubeVideoId
          ) {
            title =
              instantReplyDataHelper.getAttribute(
                'data-youtube-video-title-cache',
              ) || ''
            author =
              instantReplyDataHelper.getAttribute(
                'data-youtube-video-author-cache',
              ) || ''
            date =
              instantReplyDataHelper.getAttribute(
                'data-youtube-video-date-cache',
              ) || ''
            transcriptText =
              instantReplyDataHelper.getAttribute(
                'data-youtube-transcript-cache',
              ) || ''
          }
          instantReplyDataHelper.setAttribute(
            'aria-youtube-video-id',
            youTubeVideoId,
          )

          if (!transcriptText) {
            const youTubeVideoInfo =
              await YoutubeTranscript.fetchYouTubeVideoInfo(
                youTubeVideoId,
                uuidV4(),
              )
            title = youTubeVideoInfo?.title || ''
            author = youTubeVideoInfo?.author || ''
            date = youTubeVideoInfo?.date || ''
            transcriptText = youTubeVideoInfo?.transcriptText || ''
          }

          if (!title) {
            title =
              (document.querySelector('#back-button')
                ? document.querySelector<HTMLElement>('#entity-name')
                : commentBoxRoot?.querySelector<HTMLHeadingElement>(
                    '#video-title > yt-formatted-string',
                  )
              )?.innerText || ''
          }
          if (!author) {
            author =
              (!document.querySelector('#back-button') &&
                document.querySelector<HTMLElement>('#entity-name')
                  ?.innerText) ||
              ''
          }

          instantReplyDataHelper.setAttribute(
            'data-youtube-video-title-cache',
            title,
          )

          instantReplyDataHelper.setAttribute(
            'data-youtube-video-author-cache',
            author,
          )

          instantReplyDataHelper.setAttribute(
            'data-youtube-video-date-cache',
            date,
          )
          instantReplyDataHelper.setAttribute(
            'data-youtube-transcript-cache',
            transcriptText,
          )

          // 上下文
          const youTubeSocialMediaPostContext = new SocialMediaPostContext(
            {
              title,
              author,
              date,
              content: '',
            },
            {
              postTitle: 'Video post',
              meta: {
                'Post video transcript': transcriptText,
              },
            },
          )
          if (ytcpCommentBox) {
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
            if (instantReplyButtonId) {
              instantReplyDataHelper.setAttribute(
                'data-full-context-cache',
                youTubeSocialMediaPostContext.data
                  .SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT,
              )
              instantReplyDataHelper.setAttribute(
                'data-target-context-cache',
                youTubeSocialMediaPostContext.data
                  .SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
              )
            }
            return youTubeSocialMediaPostContext.data
          }
        }
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
  return (
    youTubeDraftEditor?.innerText ||
    (youTubeDraftEditor as HTMLTextAreaElement)?.value ||
    ''
  )
}
