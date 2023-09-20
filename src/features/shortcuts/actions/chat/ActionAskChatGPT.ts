import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IChatMessage } from '@/features/chatgpt/types'
import { chatGPTCommonErrorInterceptor } from '@/features/shortcuts/utils'
import getContextMenuNamePrefixWithHost from '@/features/shortcuts/utils/getContextMenuNamePrefixWithHost'

export class ActionAskChatGPT extends Action {
  static type: ActionIdentifier = 'ASK_CHATGPT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private question?: string
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private message?: IChatMessage
  @templateParserDecorator()
  @clearUserInput(false)
  async execute(params: ActionParameters, engine: any) {
    try {
      const askChatGPTType =
        this.parameters.AskChatGPTActionType || 'ask_chatgpt'
      if (
        askChatGPTType === 'ASK_CHAT_GPT_WITH_PREFIX' &&
        this.parameters.AskChatGPTActionMeta?.contextMenu
      ) {
        this.parameters.AskChatGPTActionMeta.contextMenu.text =
          getContextMenuNamePrefixWithHost() +
          this.parameters.AskChatGPTActionMeta.contextMenu.text
      }
      this.question = params.LAST_ACTION_OUTPUT
      const {
        success,
        answer,
        message,
        error,
      } = (await engine.getChartGPT()?.sendQuestion(
        {
          messageId: '',
          question:
            this.parameters?.compliedTemplate || params.LAST_ACTION_OUTPUT,
          parentMessageId: '',
        },
        {
          includeHistory: false,
          regenerate: false,
          hiddenInChat: askChatGPTType === 'ASK_CHAT_GPT_HIDDEN',
          meta: {
            ...this.parameters.AskChatGPTActionMeta,
          },
        },
      )) || { success: false, answer: '', error: '' }
      if (success) {
        this.output = answer
        this.message = message
      } else {
        this.output = ''
        this.error = this.error = chatGPTCommonErrorInterceptor(
          error || answer || 'ask chatgpt error',
        )
      }
    } catch (e) {
      this.error = chatGPTCommonErrorInterceptor((e as any).toString())
    }
  }
  reset() {
    console.log('reset')
    super.reset()
    this.question = ''
    this.message = undefined
    console.log(this.question)
    console.log(this.message)
  }
}
