import dayjs from 'dayjs'

import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionDateFormat extends Action {
  static type: ActionIdentifier = 'DATE_FORMAT'
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
      const formatStyle =
        typeof this.parameters.DateFormatStyle === 'string'
          ? this.parameters.DateFormatStyle
          : 'YYYY-MM-DD'
      const date = params.LAST_ACTION_OUTPUT || dayjs().format()
      this.output = dayjs(date).format(formatStyle)
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
