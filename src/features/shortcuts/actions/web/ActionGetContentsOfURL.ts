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
        currentUrl.startsWith('http') &&
        shortcutsMessageChannelEngine &&
        clientConversationEngine
      ) {
        await clientConversationEngine.pushMessage({
          type: 'system',
          text: `MaxAI.me extension is crawling this page: ${currentUrl}.\nNote that if the crawled text is too long, it'll be trimmed to the first 7,000 characters to fit the context limit.`,
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
          if (response.readabilityText.trim() === '') {
            this.error = `Provided URL content is empty or inaccessible.\n\n
Troubleshooting Steps:
- verify the target webpage URL you provided.
- check if the target website restricts direct web access.
- visit the URL directly in your browser to confirm content availability.`
          } else {
            this.output = response?.readabilityText || ''
          }
        } else {
          // 判断是不是404/403/401
          if (response.status === 404) {
            this.error =
              'Could not fetch the page.\nMake sure the URL is correct.'
          } else if (response.status === 403) {
            this.error =
              'Could not fetch the page.\nThe URL is forbidden to access.'
          } else if (response.status === 401) {
            this.error =
              'Could not fetch the page.\nThe URL is unauthorized to access.'
          } else {
            this.error = `Unable to fetch the provided URL due to network issues or website restrictions.\n\nTroubleshooting Steps:
- disable VPN if in use, and ensure your internet connection is active and stable.
- visit the URL directly in your browser, activate the MaxAI Sidebar on the same web page, and use the prompt on the page.`
          }
        }
      } else {
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
