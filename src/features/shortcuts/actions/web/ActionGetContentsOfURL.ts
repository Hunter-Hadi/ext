import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'
import { v4 as uuidV4 } from 'uuid'

export class ActionGetContentsOfURL extends Action {
  static type = 'GET_CONTENTS_OF_URL'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'GET_CONTENTS_OF_URL', parameters, autoExecute)
  }
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(params: ActionParameters, engine: any) {
    try {
      const currentUrl =
        this.parameters.URLActionURL ||
        params.URLActionURL ||
        params.LAST_ACTION_OUTPUT
      const backgroundConversation = engine.getBackgroundConversation()
      if (currentUrl && backgroundConversation) {
        this.pushMessageToChat(
          {
            type: 'system',
            text: `MaxAI.me extension is crawling this page: ${currentUrl}. Note that if the crawled text is too long, it'll be trimmed to the first 7,000 characters to fit the context limit.`,
            messageId: uuidV4(),
            extra: {
              status: 'info',
            },
          },
          engine,
        )
        const response = await backgroundConversation.postMessage({
          event: 'ShortCuts_getContentOfURL' as IShortCutsSendEvent,
          data: {
            URL: currentUrl,
          },
        })
        // NOTE: webgpt的代码是错误和成功都会返回data，所以这里也要这样写
        if (response.success) {
          this.output = response?.data?.body || ''
        } else {
          this.error = response?.data?.body || ''
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
    }
  }
}
