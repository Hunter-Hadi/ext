import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import dayjs from 'dayjs'

export class ActionDate extends Action {
  static type: ActionIdentifier = 'DATE'
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
      const dateMode = this.parameters.DateActionMode || 'Current Date'
      if (dateMode === 'Specified Date') {
        this.output = dayjs(this.parameters.DateActionDate as string).format()
      } else {
        this.output = dayjs().format()
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
