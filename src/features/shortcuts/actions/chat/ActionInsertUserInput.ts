import { autoFocusWithAllWebsite } from '@/components/AutoHeightTextarea'
import {
  MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID,
  MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID,
} from '@/features/common/constants'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getInputMediator } from '@/store/InputMediator'
import { getAppContextMenuRootElement, promiseRetry } from '@/utils'

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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const inputValue =
        this.parameters?.compliedTemplate || params?.LAST_ACTION_OUTPUT || ''
      const AskChatGPTMetaData = this.parameters.AskChatGPTActionQuestion?.meta
      const isInsertToFloatingMenuInput = isFloatingContextMenuVisible()
      const chatBoxInput = await promiseRetry<HTMLTextAreaElement>(
        () => {
          let input: HTMLTextAreaElement | null = null
          if (isInsertToFloatingMenuInput) {
            input = getAppContextMenuRootElement()?.querySelector(
              `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
            ) as HTMLTextAreaElement
          } else {
            input = getMaxAISidebarRootElement()?.querySelector(
              `#${MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID}`,
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
