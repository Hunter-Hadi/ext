import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/lib'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts'
import { v4 as uuidV4 } from 'uuid'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
export class ActionGetYoutubeTranscriptOfURL extends Action {
  static type = 'GET_YOUTUBE_TRANSCRIPT_OF_URL'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'GET_YOUTUBE_TRANSCRIPT_OF_URL', parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoading()
  async execute(params: ActionParameters, engine: any) {
    try {
      const youtubeLinkURL = this.parameters.URLActionURL || ''
      if (!youtubeLinkURL) {
        this.error = 'Youtube URL is empty.'
        return
      }
      this.pushMessageToChat(
        {
          type: 'system',
          text: `Generating summary...`,
          messageId: uuidV4(),
          extra: {
            status: 'info',
          },
        },
        engine,
      )
      const transcripts = await YoutubeTranscript.fetchTranscript(
        youtubeLinkURL,
      )
      if (transcripts.length > 0) {
        let transcriptText = `${transcripts
          .map((transcript) => {
            return `${transcript.start} ${transcript.text}\n`
          })
          .join('')}`
        transcriptText = await sliceTextByTokens(
          transcriptText,
          this.parameters.SliceTextActionTokens || 4096,
        )
        const { getChartGPT, getShortCutsEngine } = engine
        if (getShortCutsEngine()?.getNextAction?.()?.type === 'ASK_CHATGPT') {
          const conversationId = engine.getChartGPT()?.getSidebarRef()
            ?.currentConversationIdRef?.current
          // 因为是总结, 更新system prompt
          await getChartGPT()?.updateConversation(
            {
              meta: {
                systemPrompt: `The following text delimited by triple backticks is the context text:
\`\`\`
${transcriptText}
\`\`\``,
              },
            },
            conversationId,
          )
        }
        this.output = transcriptText
      } else {
        // TODO echo error， 但是网页有基础的总结内容，所以不用停止了
        // this.error = 'No transcript found.'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
