import { IActionType } from '../types'
import { Action } from '../core'
import { templateParserDecorator } from '../decorators'

export class ActionInsertUserInput extends Action {
  static type = 'INSERT_USER_INPUT'
  constructor(
    id: string,
    type: IActionType,
    parameters: any,
    autoExecute: boolean,
  ) {
    super(id, 'INSERT_USER_INPUT', parameters, autoExecute)
  }
  @templateParserDecorator()
  async execute(params: any, engine: any) {
    try {
      const inputValue =
        this.parameters?.compliedTemplate || params?.LAST_ACTION_OUTPUT || ''
      const bodyElement = engine
      engine.getChartGPT().setInputValue(inputValue)
      if (bodyElement) {
        this.output = inputValue
      } else {
        this.error = ``
      }
    } catch (e) {
      console.log('ActionInsertUserInput.execute', e)
    }
  }
}