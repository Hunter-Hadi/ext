import { IActionType } from '@/features/shortcuts/types'
import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
export class ActionAskChatGPT extends Action {
  static type = 'ASK_CHATGPT'
  constructor(
    id: string,
    type: IActionType,
    parameters: any,
    autoExecute: boolean,
  ) {
    super(id, 'ASK_CHATGPT', parameters, autoExecute)
  }
  @templateParserDecorator()
  @clearUserInput(false)
  async execute(params: any, engine: any) {
    try {
      const { success, answer } = await engine.getChartGPT()?.sendQuestion(
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
      )
      if (success) {
        this.output = answer
      } else {
        this.output = ''
        this.error = 'ask chatgpt error'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
