import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * @deprecated - 这个action已经被废弃了，因为这个action的功能已经被ActionRenderTemplate取代了
 * @since 2023-03-03
 * @description 渲染模板，最基础的prompt，取名的时候没想好，就叫这个了
 * @see src/features/shortcuts/actions/common/ActionRenderTemplate.ts
 *
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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    this.output = this.parameters?.compliedTemplate || ''
  }
}
