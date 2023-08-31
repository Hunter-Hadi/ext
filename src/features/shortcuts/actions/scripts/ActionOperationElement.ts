import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'

export class ActionOperationElement extends Action {
  static type: ActionIdentifier = 'OPERATION_ELEMENT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(params: ActionParameters, engine: any) {
    try {
      const port = engine.getBackgroundConversation()
      if (!port) {
        this.error = 'Action cannot execute!'
        return
      }
      const result = await port.postMessage({
        event: 'ShortCuts_OperationPageElement',
        data: {
          OperationElementConfig:
            this.parameters.OperationElementConfig ||
            params.OperationElementConfig ||
            {},
        },
      })
      if (result.success) {
        this.output = result.data
      } else {
        this.error = result.message
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
