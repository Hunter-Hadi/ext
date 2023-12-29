import { isEqual, isObject } from 'lodash-es'

import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionConditional extends Action {
  static type: ActionIdentifier = 'SCRIPTS_CONDITIONAL'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  async execute(params: ActionParameters, engine: any) {
    try {
      let isTrue = false
      const input =
        this.parameters.WFCondition || params.WFCondition || undefined
      const caseSensitive = this.parameters.WFMatchTextCaseSensitive !== false
      let compareValue = this.parameters.WFFormValues?.Value || ''
      let prevActionValue: string = params.LAST_ACTION_OUTPUT || ''
      const ifTrueActions = this.parameters.WFConditionalIfTrueActions || []
      const ifFalseActions = this.parameters.WFConditionalIfFalseActions || []
      if (isObject(compareValue)) {
        prevActionValue = JSON.parse(prevActionValue || '{}')
      } else if (
        !caseSensitive &&
        typeof compareValue === 'string' &&
        typeof prevActionValue === 'string'
      ) {
        compareValue = compareValue.toLocaleLowerCase()
        prevActionValue = prevActionValue.toLocaleLowerCase()
      }
      switch (input) {
        case 'Equals':
          {
            isTrue = isEqual(compareValue, prevActionValue)
          }
          break
        case 'Is Greater Than':
          {
            isTrue = Number(compareValue) > Number(prevActionValue)
          }
          break
        case 'Is Less Than':
          {
            isTrue = Number(compareValue) < Number(prevActionValue)
          }
          break
        case 'Contains':
          {
            isTrue = prevActionValue.includes(String(compareValue))
          }
          break
        case undefined:
          {
            isTrue = !prevActionValue
          }
          break
        default:
          break
      }
      if (engine.getShortCutsEngine()) {
        engine
          .getShortCutsEngine()
          ?.pushActions(isTrue ? ifTrueActions : ifFalseActions, 'after')
      } else {
        this.error = 'no shortCutsEngine'
        return
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
