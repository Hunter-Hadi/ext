import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IChatMessage } from '@/features/chatgpt/types'

export class ActionWebGPTAskChatGPT extends Action {
  static type = 'WEBGPT_ASK_CHATGPT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'WEBGPT_ASK_CHATGPT', parameters, autoExecute)
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
        this.parameters.AskChatGPTActionType || 'ASK_CHAT_GPT'
      this.question = params.LAST_ACTION_OUTPUT
      const isReplacement = askChatGPTType === 'ASK_CHAT_GPT_REPLACEMENT'
      let replaceMessage: IChatMessage | undefined
      if (isReplacement) {
        engine.getShortCutsEngine()?.actions.find((action: any) => {
          if (action.message?.messageId) {
            replaceMessage = (action as any).message
            return true
          }
          return false
        })
      }
      const { success, answer, message } = (await engine
        .getChartGPT()
        ?.sendQuestion(
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
            replaceMessage,
          },
        )) || { success: false, answer: '' }
      if (success) {
        this.output = answer
        this.message = message
      } else {
        this.output = ''
        this.error = answer || 'ask chatgpt error'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  reset() {
    super.reset()
    this.question = ''
    this.message = undefined
    console.log(this.question)
    console.log(this.message)
  }
}