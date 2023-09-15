import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import { getInputMediator } from '@/store/InputMediator'
import {
  getAppContextMenuRootElement,
  getAppRootElement,
  promiseRetry,
} from '@/utils'
import { ROOT_CHAT_BOX_INPUT_ID, ROOT_FLOATING_INPUT_ID } from '@/constants'
import { autoFocusWithAllWebsite } from '@/components/AutoHeightTextarea'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'

export class ActionInsertUserInput extends Action {
  static type: ActionIdentifier = 'INSERT_USER_INPUT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @clearUserInput()
  async execute(params: ActionParameters, engine: any) {
    try {
      const inputValue =
        this.parameters?.compliedTemplate || params?.LAST_ACTION_OUTPUT || ''
      const AskChatGPTMetaData = this.parameters.AskChatGPTActionMeta
      const isInsertToFloatingMenuInput = isFloatingContextMenuVisible()
      const chatBoxInput = await promiseRetry<HTMLTextAreaElement>(
        () => {
          let input: HTMLTextAreaElement | null = null
          if (isInsertToFloatingMenuInput) {
            input = getAppContextMenuRootElement()?.querySelector(
              `#${ROOT_FLOATING_INPUT_ID}`,
            ) as HTMLTextAreaElement
          } else {
            input = getAppRootElement()?.querySelector(
              `#${ROOT_CHAT_BOX_INPUT_ID}`,
            ) as HTMLTextAreaElement
          }
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
        if (isInsertToFloatingMenuInput) {
          getInputMediator('floatingMenuInputMediator').updateInputValue(
            '``NO_HISTORY_&#``\n' + inputValue,
            AskChatGPTMetaData,
          )
          // focus on input
          autoFocusWithAllWebsite(chatBoxInput, 0)
        } else {
          getInputMediator('chatBoxInputMediator').updateInputValue(
            '``NO_HISTORY_&#``\n' + inputValue,
            AskChatGPTMetaData,
          )
          // focus on input
          autoFocusWithAllWebsite(chatBoxInput, 44.5)
        }
      }
      // chatBoxInput不一定存在，FloatingMenu因为会进入到loading状态
      if (chatBoxInput || isInsertToFloatingMenuInput) {
        this.output = inputValue
      } else {
        this.error = ``
      }
    } catch (e) {
      console.log('ActionInsertUserInput.execute', e)
    }
  }
}