import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * @since 2023-03-03
 * @description 渲染模板，最基础的prompt，取名的时候没想好，就叫这个了 2023-09-11
 */
export class ActionRenderChatGPTPrompt extends Action {
  static type = 'RENDER_CHATGPT_PROMPT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'RENDER_CHATGPT_PROMPT', parameters, autoExecute)
  }
  @templateParserDecorator()
  async execute(params: any, engine: any) {
    this.output = this.parameters?.compliedTemplate || ''
  }
}
