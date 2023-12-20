import { clientFetchAPI } from '@/features/shortcuts/utils'
import SocialMediaPostContext, {
  ISocialMediaPostContextData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'

const RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i

export interface TranscriptResponse {
  start: string
  duration: string
  text: string
}

/**
 * Class to retrieve transcript if exist
 */
export class YoutubeTranscript {
  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   * @param defaultPageHTML Default page html
   */
  public static async fetchTranscript(
    videoId: string,
    defaultPageHTML?: string,
  ): Promise<TranscriptResponse[]> {
    try {
      let pageHTML: string = defaultPageHTML || ''
      if (!defaultPageHTML) {
        const identifier = this.retrieveVideoId(videoId)
        if (!identifier) {
          return []
        }
        const pageHTMLResult = await clientFetchAPI(
          'https://www.youtube.com/watch?v=' + identifier,
          {
            parse: 'text',
          },
        )
        if (!pageHTMLResult.success) {
          return []
        }
        pageHTML = (pageHTMLResult.data as string) || ''
      }
      const transcriptHtmlText = pageHTML.split('"captions":')
      if (transcriptHtmlText.length < 2) {
        return []
      }
      const captionTracks = JSON.parse(
        transcriptHtmlText[1].split(',"videoDetails')[0].replace(/\n/, ''),
      ).playerCaptionsTracklistRenderer.captionTracks
      const simpleTexts = Array.from(captionTracks).map(
        (l: any) => l.name.simpleText,
      )
      const primaryLanguage = 'English'
      // 基于语言排序，如果和primaryLanguage相同，排在前面，如果包含primaryLanguage，排在后面，如果都不是，排在最后
      const sortedSimpleTexts = Array.from(simpleTexts).sort(
        (prev: any, next: any) => {
          if (prev === primaryLanguage) {
            return -1
          }
          if (next === primaryLanguage) {
            return 1
          }
          if (prev.includes(primaryLanguage)) {
            return 1
          }
          if (next.includes(primaryLanguage)) {
            return -1
          }
          return 0
        },
      )
      const waitFetchLinks = sortedSimpleTexts.map((sortedSimpleText: any) => {
        const link = captionTracks.find(
          (captionTrack: any) =>
            captionTrack.name.simpleText === sortedSimpleText,
        ).baseUrl
        return {
          language: sortedSimpleText,
          link,
        }
      })
      for (let i = 0; i < waitFetchLinks.length; i++) {
        const waitFetchLink = waitFetchLinks[i]
        const xmlResult = await clientFetchAPI(waitFetchLink.link, {
          parse: 'text',
        })
        if (xmlResult.success) {
          const xml = xmlResult.data
          const result = this.parseXml(xml)
          if (result.length) {
            return result
          }
        }
      }
      return []
    } catch (e) {
      return []
    }
  }
  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   */
  public static async fetchYoutubePageContentWithoutDocument(
    videoId: string,
  ): Promise<ISocialMediaPostContextData> {
    try {
      const pageContent = await clientFetchAPI(
        'https://www.youtube.com/watch?v=' + videoId,
        {
          parse: 'text',
        },
      )
      if (pageContent.success) {
        const doc = new DOMParser().parseFromString(
          pageContent.data,
          'text/html',
        )
        // youTube transcript
        const youTubeTranscriptText = await YoutubeTranscript.transcriptFormat(
          await YoutubeTranscript.fetchTranscript(videoId, pageContent.data),
          2048,
        )
        const youTubeVideoMetaData = doc.querySelector('ytd-watch-metadata')
        const title =
          (youTubeVideoMetaData?.querySelector(
            '#title > h1',
          ) as HTMLHeadingElement)?.innerText || doc.title
        const authorElement = doc.querySelector('ytd-video-owner-renderer')
        const userName = authorElement?.querySelector('yt-formatted-string')
          ?.textContent
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
        const content = ''
        const youtubePostContent = new SocialMediaPostContext(
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
        return youtubePostContent.data
      }
      return SocialMediaPostContext.emptyData
    } catch (e) {
      return SocialMediaPostContext.emptyData
    }
  }

  /**
   * Format transcript to string
   * @param transcripts
   * @param sliceTokens
   */
  public static async transcriptFormat(
    transcripts: TranscriptResponse[],
    sliceTokens = 4096,
  ) {
    const transcriptText = `${transcripts
      .map((transcript) => {
        return `${transcript.start} ${transcript.text}\n`
      })
      .join('')}`
    return (await sliceTextByTokens(transcriptText, sliceTokens)).text
  }
  /**
   * Retrieve video id from url or string
   * @param videoId video url or video id
   */
  public static retrieveVideoId(videoId: string) {
    if (videoId.length === 11) {
      return videoId
    }
    const matchId = videoId.match(RE_YOUTUBE)
    if (matchId && matchId.length) {
      return matchId[1]
    }
    return ''
  }
  private static parseXml(xml: string) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    const textNodes = xmlDoc.getElementsByTagName('text')
    const result: TranscriptResponse[] = []
    // <text start="0.36" dur="2.84">Hello, I am Wang Gang. Today I will show you how to make:</text>
    for (let i = 0; i < textNodes.length; i++) {
      const textNode = textNodes[i]
      const start = textNode.getAttribute('start')
      const duration = textNode.getAttribute('dur') || ''
      const text = textNode.textContent
      if (start && text) {
        result.push({
          start,
          duration,
          text,
        })
      }
    }
    return result
  }
}
