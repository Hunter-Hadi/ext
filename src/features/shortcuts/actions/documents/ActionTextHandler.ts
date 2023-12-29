import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { textHandler } from '@/features/shortcuts/utils/textHelper'

export class ActionTextHandler extends Action {
  static type: ActionIdentifier = 'TEXT_HANDLER'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  // @pushOutputToChat({
  //   onlyError: true,
  // })
  async execute(params: ActionParameters, engine: any) {
    try {
      const text = params.LAST_ACTION_OUTPUT || this.parameters.template || ''
      if (text) {
        this.output = textHandler(
          text,
          this.parameters.ActionTextHandleParameters,
        )
        this.error = ''
      } else {
        this.output = ''
        this.error = 'error: no text for handle'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
