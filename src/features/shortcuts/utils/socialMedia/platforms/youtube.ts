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
  ICommentData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'
import { concat } from 'lodash-es'

const getYouTubeCommentContent = async (
  ytdCommentBox: HTMLElement,
): Promise<ICommentData> => {
  const author =
    (ytdCommentBox.querySelector(
      '#header-author #author-text > span',
    ) as HTMLSpanElement)?.innerText || ''
  const commmitAuthor =
    (ytdCommentBox.querySelector(
      '#header-author #author-text > yt-formatted-string',
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
    author: (author || commmitAuthor).replace(/\n/g, '').trim(),
    date,
    content: commentText,
  }
}

export const youTubeGetPostContent: GetSocialMediaPostContentFunction = async (
  inputAssistantButton,
  type
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
      if (type === 'Summary') {
        //获取所有评论
        const contentsElement = document.getElementById('contents');
        console.log('contentsElement', contentsElement)
        let sections = document.getElementById("sections");
        if (sections?.querySelector("#count")) {
          console.log('simply 评论获取 成功 //////', contentsElement)
          const list = await getCommitList()
          console.log('simply commit list 1', list)
          youTubeSocialMediaPostContext.addCommentList(list)
        } else {
          console.log('simply 评论失败 成功 //////', contentsElement)

          // console.log('simply sections', sections)
          // let items = document.getElementById("items");
          // let itemsBottom = items?.getBoundingClientRect().bottom;
          // console.log('simply itemsBottom', items?.getBoundingClientRect(), itemsBottom,items?.offsetTop)

          // window.scrollBy({ top: itemsBottom });
          let items = document.querySelector('#items.style-scope.ytd-watch-next-secondary-results-renderer');
          if (items) {
            let rect = items.getBoundingClientRect();
            let offsetTop = rect.top;
            let offsetBottom = rect.bottom;
            if (offsetTop && offsetTop > 100) {
              // 说明是在简介下方
              window.scrollTo({
                top: offsetBottom + 100
              });
              await awaitScrollFun(() => {
                let sectionsDom = document.getElementById("sections");
                if (sectionsDom) {
                  return sectionsDom?.getBoundingClientRect().top > 0
                } else {
                  return false
                }
              })
              await awaitScrollFun(() => !!(sections && sections.querySelector("#count")))

            } else {
              // 正常情况
              console.log('元素不存在');
              //滑动加载评论
              await awaitScrollFun(() => {
                //判断
                let sectionsDom = document.getElementById("sections");
                if (sectionsDom) {
                  return sectionsDom?.getBoundingClientRect().top > 0
                } else {
                  return false
                }
              })
              let distanceFromTop = sections?.getBoundingClientRect().top;
              window.scrollBy({ top: distanceFromTop });
            }
          }
          await awaitScroll(sections)
          console.log('simply awaitScroll')
          window.scrollTo({ top: 0 });
          const list = await getCommitList()
          console.log('simply commit list 2', list)
          youTubeSocialMediaPostContext?.addCommentList(list)
        }
        return youTubeSocialMediaPostContext.data

      } else {
        // comment box
        const ytdCommentBox = findParentEqualSelector(
          'ytd-commentbox',
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
const awaitScroll = (sections: HTMLElement | null) => {
  return new Promise<void>((resolve) => {
    let countInterval = setInterval(async () => {
      if (sections && sections.querySelector("#count")) {
        resolve()
        clearInterval(countInterval)
      }
    }, 200);
  })
}
const awaitScrollFun = async (condition: () => boolean) => {
  return new Promise<void>((resolve) => {
    let countInterval = setInterval(async () => {
      if (condition && condition()) {
        resolve()
        clearInterval(countInterval)
      }
    }, 200);
  })
}
const getCommitList = async () => {
  const contentsElement = document.getElementById('contents');
  const commentThreadRenderers = contentsElement?.getElementsByTagName('ytd-comment-thread-renderer');
  const list = []
  if (commentThreadRenderers) {
    for (let i = 0; i < commentThreadRenderers.length; i++) {
      const commentThreadRenderer = commentThreadRenderers[i];
      const data = await getYouTubeCommentContent(commentThreadRenderer as unknown as HTMLElement)
      list.push(data)
    }
  }
  return list

}