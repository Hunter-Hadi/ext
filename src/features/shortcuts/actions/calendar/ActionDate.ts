import dayjs from 'dayjs'

import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
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
