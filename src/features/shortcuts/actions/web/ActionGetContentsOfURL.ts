import { v4 as uuidV4 } from 'uuid'

import {
  completeLastAIMessageOnError,
  completeLastAIMessageOnStop,
  IShortcutEngineExternalEngine,
} from '@/features/shortcuts'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import {
  parametersParserDecorator,
  pushOutputToChat,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientAbortFetchAPI } from '@/features/shortcuts/utils'
import clientGetContentOfURL from '@/features/shortcuts/utils/web/clientGetContentOfURL'

export class ActionGetContentsOfURL extends Action {
  static type: ActionIdentifier = 'GET_CONTENTS_OF_URL'
  private taskId: string = ''
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @withLoadingDecorators()
  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @completeLastAIMessageOnError()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const currentUrl =
        this.parameters.URLActionURL ||
        params.URLActionURL ||
        params.LAST_ACTION_OUTPUT
      const { shortcutsMessageChannelEngine, clientConversationEngine } = engine

      if (
        currentUrl &&
        shortcutsMessageChannelEngine &&
        clientConversationEngine
      ) {
        await clientConversationEngine.pushMessage({
          type: 'system',
          text: `MaxAI.me extension is crawling this page: ${currentUrl}. Note that if the crawled text is too long, it'll be trimmed to the first 7,000 characters to fit the context limit.`,
          messageId: uuidV4(),
          meta: {
            status: 'info',
          },
        })
        this.taskId = uuidV4()
        const youtubeVideoId = YoutubeTranscript.retrieveVideoId(currentUrl)
        // NOTE: 如果是youtube的视频，直接获取transcript和页面信息
        if (youtubeVideoId) {
          const postContextData =
            await YoutubeTranscript.fetchYoutubePageContentWithoutDocument(
              youtubeVideoId,
              this.taskId,
            )
          if (postContextData.post?.content) {
            this.output = postContextData.SOCIAL_MEDIA_PAGE_CONTENT
            return
          }
        }
        const response = await clientGetContentOfURL(
          currentUrl,
          10000,
          this.taskId,
        )
        // NOTE: webgpt的代码是错误和成功都会返回data，所以这里也要这样写
        if (response.success) {
          this.output = response?.readabilityText || ''
        } else {
          this.error = response?.readabilityText || ''
        }
      } else {
        this.error = 'Could not fetch the page.\nMake sure the URL is correct.'
      }
      if (!this.output) {
        this.output = ''
        this.error = 'Could not fetch the page.\nMake sure the URL is correct.'
      }
    } catch (e) {
      this.error = (e as any).toString()
    } finally {
      this.taskId = ''
    }
  }

  @completeLastAIMessageOnStop()
  async stop() {
    return (await clientAbortFetchAPI(this.taskId)).success
  }
}
