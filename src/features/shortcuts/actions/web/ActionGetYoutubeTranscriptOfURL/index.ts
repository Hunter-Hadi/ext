import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'

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
  @withLoading()
  async execute(params: ActionParameters, engine: any) {
    try {
      const currentUrl = window.location.href.includes('youtube.com')
        ? window.location.href
        : ''
      const youtubeLinkURL = this.parameters.URLActionURL || currentUrl || ''
      if (!youtubeLinkURL) {
        this.error = 'Youtube URL is empty.'
        return
      }
      console.log('youtubeLinkURL', youtubeLinkURL)
      let transcripts = await YoutubeTranscript.fetchTranscript(youtubeLinkURL)
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
      if (isEmptyTranscriptText) {
        // youtube网站切换网页是不会更新meta和title的，所以这里需要重新获取，这里为了更新效果，要fallback网页content的获取
        if (youtubeLinkURL && youtubeLinkURL.startsWith('https://')) {
          const pageHTMLResult = await clientFetchAPI(youtubeLinkURL, {
            parse: 'text',
          })
          console.log(
            'usePageUrlChange 爬取youtubeLinkURL',
            youtubeLinkURL,
            pageHTMLResult.data,
          )
          if (pageHTMLResult.success && pageHTMLResult.data) {
            const pageContent = await getPageContentWithMozillaReadability()
            transcripts = [
              {
                start: '',
                duration: '',
                text: pageContent,
              },
            ]
          }
        }
        console.log('usePageUrlChange 新的youtube transcripts', transcripts)
      }
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
