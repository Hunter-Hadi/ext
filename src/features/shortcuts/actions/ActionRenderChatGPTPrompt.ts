import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
export class ActionRenderChatGPTPrompt extends Action {
  static type = 'RENDER_CHATGPT_PROMPT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: any,
    autoExecute: boolean,
  ) {
    super(id, 'RENDER_CHATGPT_PROMPT', parameters, autoExecute)
  }
  @templateParserDecorator()
  async execute(params: any, engine: any) {
    this.output = this.parameters?.compliedTemplate || ''
  }
}
