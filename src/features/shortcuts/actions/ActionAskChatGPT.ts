import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionAskChatGPT extends Action {
  static type = 'ASK_CHATGPT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'ASK_CHATGPT', parameters, autoExecute)
  }
  @templateParserDecorator()
  @clearUserInput(false)
  async execute(params: ActionParameters, engine: any) {
    try {
      const { success, answer } = (await engine.getChartGPT()?.sendQuestion(
        {
          messageId: '',
          question:
            this.parameters?.compliedTemplate || params.LAST_ACTION_OUTPUT,
          parentMessageId: '',
        },
        {
          includeHistory: false,
          regenerate: false,
        },
      )) || { success: false, answer: '' }
      if (success) {
        this.output = answer
      } else {
        this.output = ''
        this.error = answer || 'ask chatgpt error'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
