import { Action } from '../core'
import { IActionType } from '../types'
import { clearUserInput, templateParserDecorator } from '../decorators'
export class ActionRenderChatGPTPrompt extends Action {
  static type = 'RENDER_CHATGPT_PROMPT'
  constructor(
    id: string,
    type: IActionType,
    parameters: any,
    autoExecute: boolean,
  ) {
    super(id, 'RENDER_CHATGPT_PROMPT', parameters, autoExecute)
  }
  @templateParserDecorator()
  @clearUserInput()
  async execute(params: any, engine: any) {
    this.output = this.parameters?.compliedTemplate || ''
  }
}
