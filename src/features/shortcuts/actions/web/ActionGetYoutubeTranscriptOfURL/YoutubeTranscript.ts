import { clientProxyFetchAPI } from '@/features/shortcuts/utils'
import SocialMediaPostContext, {
  ISocialMediaPostContextData,
} from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'

const RE_YOUTUBE =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i // eslint-disable-line

export interface TranscriptResponse {
  start: string
  duration: string
  text: string
  children?: TranscriptResponse[]
  status?: string
  id?: string
}

export interface IYoutubeCaptionTrack {
  baseUrl: string
  languageCode: string
  name: { simpleText: string }
}

/**
 * Class to retrieve transcript if exist
 */
export class YoutubeTranscript {
  /**
   * 从caption url获取并解析transcript
   * @param url
   */
  public static async fetchTranscriptByCaptionUrl(url: string) {
    const xmlResult = await clientProxyFetchAPI(url, {
      method: 'GET',
      parse: 'text',
    })
    if (xmlResult.success) {
      const xml = xmlResult.data
      return this.parseXml(xml)
    }
    return []
  }

  /**
   * 从caption tracks里获取并解析transcript
   * @param captionTracks
   */
  public static async fetchTranscriptByCaptionTracks(
    captionTracks: IYoutubeCaptionTrack[],
  ) {
    // TODO 这里的language code可以基于用户浏览器或者插件设置优先
    const primaryLanguageCode = 'en'
    // 基于语言排序，如果和languageCode相同，排在前面，如果包含languageCode，排在后面，如果都不是，排在最后
    const sorted = [...captionTracks].sort((prev, next) => {
      if (prev.languageCode === primaryLanguageCode) {
        return -1
      }
      if (next.languageCode === primaryLanguageCode) {
        return 1
      }
      if (prev.languageCode.includes(primaryLanguageCode)) {
        return 1
      }
      if (next.languageCode.includes(primaryLanguageCode)) {
        return -1
      }
      return 0
    })
    // 按顺序fetch
    for (let i = 0; i < sorted.length; i++) {
      const { baseUrl } = sorted[i]
      const result = await this.fetchTranscriptByCaptionUrl(baseUrl)
      if (result.length) {
        return result
      }
    }
    return []
  }

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
        const pageHTMLResult = await clientProxyFetchAPI(
          'https://www.youtube.com/watch?v=' + identifier,
          {
            method: 'GET',
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
      return this.fetchTranscriptByCaptionTracks(captionTracks)
    } catch (e) {
      return []
    }
  }

  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   * @param abortTaskId Abort task id
   */
  public static async fetchYouTubeVideoInfo(
    videoId: string,
    abortTaskId?: string,
  ) {
    let youTubeVideoInfo = null
    const pageContent = await clientProxyFetchAPI(
      'https://www.youtube.com/watch?v=' + videoId,
      {
        method: 'GET',
        parse: 'text',
      },
      abortTaskId,
    )
    if (pageContent.success) {
      youTubeVideoInfo = {
        title: '',
        author: '',
        account: '',
        date: '',
        content: '',
        transcriptText: '',
      }
      // youTube transcript
      youTubeVideoInfo.transcriptText =
        await YoutubeTranscript.transcriptFormat(
          await YoutubeTranscript.fetchTranscript(videoId, pageContent.data),
        )
      const doc = new DOMParser().parseFromString(pageContent.data, 'text/html')
      youTubeVideoInfo.title =
        doc.querySelector('meta[itemprop="name"]')?.getAttribute('content') ||
        ''
      youTubeVideoInfo.author =
        doc
          .querySelector('span[itemprop="author"] link[itemprop="name"]')
          ?.getAttribute('content') || ''
      youTubeVideoInfo.account =
        doc
          .querySelector('span[itemprop="author"] link[itemprop="url"]')
          ?.getAttribute('href')
          ?.split('@')?.[1] || ''
      youTubeVideoInfo.date =
        doc
          .querySelector('meta[itemprop="datePublished"]')
          ?.getAttribute('content') || ''
      youTubeVideoInfo.content =
        doc
          .querySelector('meta[itemprop="description"]')
          ?.getAttribute('content') || ''

      try {
        if (doc.body.innerHTML) {
          const json = doc.body.innerHTML
            .split('"videoDetails":')?.[1]
            ?.split(',"thumbnail":')?.[0]
          if (json) {
            // channelId
            // isCrawlable
            // isOwnerViewing
            // keywords
            // lengthSeconds
            // shortDescription
            // title
            // videoId
            const videoDetail = JSON.parse(json + '}')
            if (videoDetail.title) {
              youTubeVideoInfo.title = videoDetail.title
            }
            if (videoDetail.shortDescription) {
              youTubeVideoInfo.content = videoDetail.shortDescription
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
    return youTubeVideoInfo
  }

  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   * @param abortTaskId Abort task id
   */
  public static async fetchYoutubePageContentWithoutDocument(
    videoId: string,
    abortTaskId?: string,
  ): Promise<ISocialMediaPostContextData> {
    try {
      const youTubeVideoInfo = await YoutubeTranscript.fetchYouTubeVideoInfo(
        videoId,
        abortTaskId,
      )
      if (youTubeVideoInfo) {
        const { title, author, account, date, content, transcriptText } =
          youTubeVideoInfo
        const youtubePostContent = new SocialMediaPostContext(
          {
            title,
            author: `${author}(@${account})`,
            date,
            content,
          },
          {
            postTitle: 'Video post',
            meta: {
              'Video transcript': transcriptText,
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
    sliceTokens?: number,
  ) {
    const transcriptText = `${transcripts
      .map((transcript) => {
        return `${transcript.start} ${transcript.text}\n`
      })
      .join('')}`
    if (sliceTokens) {
      return (await sliceTextByTokens(transcriptText, sliceTokens)).text
    } else {
      return transcriptText
    }
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
