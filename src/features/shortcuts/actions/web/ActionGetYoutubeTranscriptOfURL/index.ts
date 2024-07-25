import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import {
  TranscriptResponse,
  YoutubeTranscript,
} from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionGetYoutubeTranscriptOfURL extends Action {
  static type: ActionIdentifier = 'GET_YOUTUBE_TRANSCRIPT_OF_URL'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  async execute() {
    try {
      const currentUrl = window.location.href.includes('youtube.com')
        ? window.location.href
        : ''
      const youtubeLinkURL = this.parameters.URLActionURL || currentUrl || ''
      if (!youtubeLinkURL) {
        this.error = 'Youtube URL is empty.'
        return
      }
      let transcripts: TranscriptResponse[] = []
      if (
        currentUrl === youtubeLinkURL &&
        (window as any).ytInitialPlayerResponse
      ) {
        // 当前url可以直接从window.ytInitialPlayerResponse获取
        const captionTracks =
          (window as any).ytInitialPlayerResponse.captions
            ?.playerCaptionsTracklistRenderer?.captionTracks || []
        transcripts = await YoutubeTranscript.fetchTranscriptByCaptionTracks(
          captionTracks,
        )
      } else {
        transcripts = await YoutubeTranscript.fetchTranscript(youtubeLinkURL)
      }

      if (transcripts.length) {
        this.output = transcripts
      } else {
        this.output = []
      }
      // const transcripts = await YoutubeTranscript.fetchTranscript(
      //   youtubeLinkURL,
      // )
      // const isEmptyTranscriptText =
      //   transcripts.length <= 10
      //     ? transcripts
      //         .map((item) => item.text)
      //         .join('')
      //         .trim() === ''
      //     : false
      // console.log(
      //   'usePageUrlChange default youtube transcripts',
      //   transcripts,
      //   isEmptyTranscriptText ? '空的' : '非空',
      // )
      // if (transcripts.length > 0 && !isEmptyTranscriptText) {
      //   const transcriptText = await YoutubeTranscript.transcriptFormat(
      //     transcripts,
      //   )
      //   this.output = transcriptText
      // } else {
      //   // TODO echo error， 但是网页有基础的总结内容，所以不用停止了
      //   // this.error = 'No transcript found.'
      //   this.output = ''
      // }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessageStatus(params)
    return true
  }
}
