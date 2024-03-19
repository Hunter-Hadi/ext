import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

import { stopActionMessage } from '../../common'

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
      console.log('simply ', this.parameters.VariableName)
      const currentUrl = window.location.href.includes('youtube.com')
        ? window.location.href
        : ''
      const youtubeLinkURL = this.parameters.URLActionURL || currentUrl || ''
      if (!youtubeLinkURL) {
        this.error = 'Youtube URL is empty.'
        return
      }
      console.log('youtubeLinkURL', youtubeLinkURL)
      const transcripts = await YoutubeTranscript.fetchTranscript(
        youtubeLinkURL,
      )
      if (this.parameters.VariableName === 'GET_LIST_DATA') {
        this.output = transcripts
        return
      }
      const isEmptyTranscriptText =
        transcripts.length <= 10
          ? transcripts
              .map((item) => item.text)
              .join('')
              .trim() === ''
          : false
      console.log(
        'usePageUrlChange default youtube transcripts',
        transcripts,
        isEmptyTranscriptText ? '空的' : '非空',
      )
      if (transcripts.length > 0 && !isEmptyTranscriptText) {
        const transcriptText = await YoutubeTranscript.transcriptFormat(
          transcripts,
        )
        this.output = transcriptText
      } else {
        // TODO echo error， 但是网页有基础的总结内容，所以不用停止了
        // this.error = 'No transcript found.'
        this.output = ''
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessage(params)
    return true
  }
}
