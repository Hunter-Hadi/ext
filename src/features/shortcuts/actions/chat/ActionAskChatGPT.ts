import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  parametersParserDecorator,
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

  @parametersParserDecorator()
  @templateParserDecorator()
  @clearUserInput(false)
  async execute(params: ActionParameters, engine: any) {
    try {
      const askChatGPTType =
        this.parameters.AskChatGPTActionType || 'ask_chatgpt'
      const askChatGPTProvider = this.parameters.AskChatGPTProvider
      const includeHistory = this.parameters.AskChatGPTWithHistory || false
      if (askChatGPTProvider) {
        // 设置了单独的Provider和model，实例化一个chatSystem
        // const chatSystemInstance = this.createChatSystemInstance(
        //   askChatGPTProvider.provider,
        // )
        // TODO
      }
      if (
        askChatGPTType === 'ASK_CHAT_GPT_WITH_PREFIX' &&
        this.parameters.AskChatGPTActionMeta?.contextMenu
      ) {
        this.parameters.AskChatGPTActionMeta.contextMenu.text =
          getContextMenuNamePrefixWithHost() +
          this.parameters.AskChatGPTActionMeta.contextMenu.text
      }
      this.question =
        this.parameters?.compliedTemplate || params.LAST_ACTION_OUTPUT
      const {
        success,
        answer,
        message,
        error,
      } = (await engine.getChartGPT()?.sendQuestion(
        {
          messageId: '',
          question: this.question,
          parentMessageId: '',
        },
        {
          includeHistory,
          regenerate: false,
          meta: {
            ...this.parameters.AskChatGPTActionMeta,
            deleteMessageCount:
              askChatGPTType === 'ASK_CHAT_GPT_HIDDEN_QUESTION' ? 1 : 0,
          },
        },
      )) || { success: false, answer: '', error: '' }
      if (success) {
        // 因为是隐藏答案或者隐藏问题，所以需要运行完成后再删除消息
        if (askChatGPTType === 'ASK_CHAT_GPT_HIDDEN') {
          await this.deleteMessageFromChat(2, engine)
        } else if (askChatGPTType === 'ASK_CHAT_GPT_HIDDEN_ANSWER') {
          await this.deleteMessageFromChat(1, engine)
        }
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
