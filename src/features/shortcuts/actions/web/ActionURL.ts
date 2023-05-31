import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
export class ActionURL extends Action {
  static type = 'URL'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'URL', parameters, autoExecute)
  }
  async execute(params: ActionParameters, engine: any) {
    try {
      this.output =
        this.parameters.URLActionURL || this.parameters.LAST_ACTION_OUTPUT
      if (!this.output) {
        this.output = ''
        this.error = 'No input url'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}