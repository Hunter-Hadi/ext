import { IActionType } from '@/features/shortcuts/types'
import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import { getMediator } from '@/store/mediator'
import { getAppRootElement, promiseRetry } from '@/utils'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/types'
import { autoFocusWithAllWebsite } from '@/components/AutoHeightTextarea'

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
  @clearUserInput()
  async execute(params: any, engine: any) {
    try {
      const inputValue =
        this.parameters?.compliedTemplate || params?.LAST_ACTION_OUTPUT || ''
      const bodyElement = engine
      const chatBoxInput = await promiseRetry<HTMLTextAreaElement>(
        () => {
          const input = getAppRootElement()?.querySelector(
            `#${ROOT_CHAT_BOX_INPUT_ID}`,
          ) as HTMLTextAreaElement
          if (input) {
            return Promise.resolve(input)
          }
          return Promise.reject('not found')
        },
        30,
        100,
      )
      if (chatBoxInput) {
        getMediator('chatBoxInputMediator').updateInputValue(inputValue)
        // focus on input
        autoFocusWithAllWebsite(chatBoxInput, 52.5)
      }
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
