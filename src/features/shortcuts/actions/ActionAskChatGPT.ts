import {
  Action,
  IActionType,
  templateParserDecorator,
} from '@/features/shortcuts'
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
  async execute(params: any, engine: any) {
    try {
      const { success, answer } = await engine
        .getChartGPT()
        ?.sendQuestion(
          this.parameters?.compliedTemplate || params.LAST_ACTION_OUTPUT,
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
