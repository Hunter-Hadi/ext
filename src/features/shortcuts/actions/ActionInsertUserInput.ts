import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import { getMediator } from '@/store/mediator'
import { getAppRootElement, promiseRetry } from '@/utils'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/constants'
import { autoFocusWithAllWebsite } from '@/components/AutoHeightTextarea'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionInsertUserInput extends Action {
  static type = 'INSERT_USER_INPUT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'INSERT_USER_INPUT', parameters, autoExecute)
  }
  @templateParserDecorator()
  @clearUserInput()
  async execute(params: ActionParameters, engine: any) {
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
        // HACK: 为了标记是shortcut运行的，而不是用户输入的，会加上一个前缀"``NO_HISTORY_&#``\n"
        // 让input监测到这个特殊的前缀，替换成系统常量的CHAT_GPT_PROMPT_PREFIX
        getMediator('chatBoxInputMediator').updateInputValue(
          '``NO_HISTORY_&#``\n' + inputValue,
        )
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
