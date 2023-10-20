import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  parametersParserDecorator,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import { chatGPTCommonErrorInterceptor } from '@/features/shortcuts/utils'
import getContextMenuNamePrefixWithHost from '@/features/shortcuts/utils/getContextMenuNamePrefixWithHost'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

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
      // 用于像search with ai持续更新的message
      const insertMessageId = this.parameters.AskChatGPTInsertMessageId || ''
      if (askChatGPTProvider) {
        // 设置了单独的Provider和model，实例化一个chatSystem
        // const chatSystemInstance = this.createChatSystemInstance(
        //   askChatGPTProvider.provider,
        // )
        // TODO
      }
      const conversationId = this.getCurrentConversationId(engine)
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
          },
          aiMessageVisible:
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_ANSWER',
          userMessageVisible:
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_QUESTION',
        },
        {
          onProcess: async (message: IChatMessage) => {
            if (insertMessageId && conversationId) {
              message.messageId = insertMessageId
              await clientChatConversationModifyChatMessages(
                'update',
                conversationId,
                0,
                [message],
              )
            }
          },
          onEnd: async (isSuccess: boolean, message: IAIResponseMessage) => {
            if (insertMessageId && conversationId) {
              if (message) {
                message.messageId = insertMessageId
                await clientChatConversationModifyChatMessages(
                  'update',
                  conversationId,
                  0,
                  [
                    mergeWithObject([
                      message,
                      {
                        originalMessage: {
                          metadata: {
                            isComplete: true,
                          },
                        },
                      },
                    ]),
                  ],
                )
              }
            }
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
