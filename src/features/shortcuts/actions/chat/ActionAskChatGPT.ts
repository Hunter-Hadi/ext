import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { textGetLanguageName } from '@/features/common/utils/nlp'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import generatePromptAdditionalText from '@/features/shortcuts/actions/chat/ActionAskChatGPT/generatePromptAdditionalText'
import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  parametersParserDecorator,
  shortcutsRenderTemplate,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { chatGPTCommonErrorInterceptor } from '@/features/shortcuts/utils'
import getContextMenuNamePrefixWithHost from '@/features/shortcuts/utils/getContextMenuNamePrefixWithHost'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

/**
 * @deprecated
 */
class ActionAskChatGPT extends Action {
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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const askChatGPTType =
        this.parameters.AskChatGPTActionType || 'ASK_CHAT_GPT'
      const isOpenAIResponseLanguage =
        this.parameters.AskChatGPTWithAIResponseLanguage !== false
      const includeHistory = this.parameters.AskChatGPTWithHistory || false
      // 用于像search with ai持续更新的message
      const insertMessageId = this.parameters.AskChatGPTInsertMessageId || ''
      const conversationId = this.getCurrentConversationId(engine)
      this.question =
        this.parameters?.compliedTemplate || params.LAST_ACTION_OUTPUT
      // 末尾加上的和AI response language有关的信息，比如说写作风格，语气等需要隐藏，所以要设置messageVisibleText
      let messageVisibleText = this.question
      if (isOpenAIResponseLanguage) {
        // this.question += await this.generateAdditionalText(params)
        const {
          data: additionalText,
          addPosition,
        } = await generatePromptAdditionalText(params)
        if (additionalText) {
          if (
            this.question?.startsWith('Ignore all previous instructions. ') &&
            addPosition === 'start'
          ) {
            this.question = this.question.replace(
              'Ignore all previous instructions. ',
              'Ignore all previous instructions.\n' + additionalText + '\n\n',
            )
          } else {
            if (addPosition === 'start') {
              this.question = additionalText + '\n\n' + this.question
            } else {
              this.question += '\n\n' + additionalText
            }
          }
        }
      }
      // 如果用的是contextMenu，则直接使用contextMenu的名字
      if (this.parameters.AskChatGPTActionMeta?.contextMenu?.text) {
        if (askChatGPTType === 'ASK_CHAT_GPT_WITH_PREFIX') {
          const contextMenuNameWithPrefix =
            getContextMenuNamePrefixWithHost() +
            this.parameters.AskChatGPTActionMeta.contextMenu.text
          this.parameters.AskChatGPTActionMeta.contextMenu.text = contextMenuNameWithPrefix
          messageVisibleText = contextMenuNameWithPrefix
        } else {
          messageVisibleText = this.parameters.AskChatGPTActionMeta.contextMenu
            .text
        }
      }
      this.log.info('question', this.question)
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
            messageVisibleText,
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
              if (isAIMessage(message)) {
                if (message.originalMessage) {
                  if (!message.originalMessage.content) {
                    message.originalMessage.content = {
                      text: message.text,
                      contentType: 'text',
                    }
                  }
                }
              }
              await clientChatConversationModifyChatMessages(
                'update',
                conversationId,
                0,
                isAIMessage(message)
                  ? [
                      mergeWithObject([
                        message,
                        {
                          originalMessage: {
                            content: {
                              contentType:
                                message?.originalMessage?.content
                                  ?.contentType || 'text',
                              text: message.text,
                            },
                          },
                        } as IAIResponseMessage,
                      ]),
                    ]
                  : [message],
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
                    isAIMessage(message)
                      ? mergeWithObject([
                          message,
                          {
                            originalMessage: {
                              status: 'complete',
                              metadata: {
                                isComplete: true,
                              },
                            },
                          } as IAIResponseMessage,
                        ])
                      : [message],
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
  static async generateAdditionalText(
    params: ActionParameters & {
      AI_RESPONSE_TONE?: string
      AI_RESPONSE_WRITING_STYLE?: string
      // web search的上下文
      WEB_SEARCH_RESULTS?: string
      PAGE_CONTENT?: string
      // summary的上下文
      READABILITY_CONTENTS?: string
      // quick reply的上下文
      EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT?: string
      EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT?: string
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT?: string
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT?: string
      EMAIL_DRAFT?: string
      POST_DRAFT?: string
    },
  ) {
    const addPosition = 'end'
    let systemVariablesTemplate = ''
    // 根据CONTEXT和 是否为Auto会有四个场景:
    //  - Auto, 有CONTEXT -> 回复和CONTEXT相同的语言加在最后面
    //  - Auto, 没有CONTEXT -> 不处理
    //  - 非Auto, 有CONTEXT -> Respond in "用户选择的"
    //  - 非Auto,没有CONTEXT -> 不处理
    const isAuto =
      params.AI_RESPONSE_LANGUAGE === DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
    const CONTEXT =
      params.READABILITY_CONTENTS || //总结的上下文
      params.WEB_SEARCH_RESULTS || // 搜索的上下文
      params.PAGE_CONTENT || // 搜索的上下文
      params.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT || // quick reply的上下文
      params.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT || // quick reply的上下文
      params.EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT || // quick reply的上下文
      params.EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT || // quick reply的上下文
      params.EMAIL_DRAFT || // quick reply的上下文
      params.POST_DRAFT || // quick reply的上下文
      params.SELECTED_TEXT || // 选中的内容
      ''
    // 如果是Auto，且有CONTEXT，那么就回复和CONTEXT相同的语言
    if (isAuto) {
      if (CONTEXT) {
        const language = textGetLanguageName(CONTEXT)
        systemVariablesTemplate = `Please write in ${language}`
      }
      // 没有SELECTED_TEXT, 不处理
    } else {
      if (
        params.AI_RESPONSE_WRITING_STYLE &&
        params.AI_RESPONSE_TONE &&
        params.AI_RESPONSE_TONE !== 'Default' &&
        params.AI_RESPONSE_WRITING_STYLE !== 'Default'
      ) {
        systemVariablesTemplate =
          'Please write in {{AI_RESPONSE_TONE}} tone, {{AI_RESPONSE_WRITING_STYLE}} writing style, using {{AI_RESPONSE_LANGUAGE}}.'
      } else if (
        params.AI_RESPONSE_TONE &&
        params.AI_RESPONSE_TONE !== 'Default'
      ) {
        systemVariablesTemplate =
          'Please write in {{AI_RESPONSE_TONE}} tone, using {{AI_RESPONSE_LANGUAGE}}.'
      } else if (
        params.AI_RESPONSE_WRITING_STYLE &&
        params.AI_RESPONSE_WRITING_STYLE !== 'Default'
      ) {
        systemVariablesTemplate =
          'Please write in {{AI_RESPONSE_WRITING_STYLE}} writing style, using {{AI_RESPONSE_LANGUAGE}}.'
      } else {
        systemVariablesTemplate = `Please write in {{AI_RESPONSE_LANGUAGE}}`
      }
    }
    const result = shortcutsRenderTemplate(systemVariablesTemplate, params)
    if (result.error || !systemVariablesTemplate) {
      return {
        data: '',
        addPosition,
      }
    }
    return {
      data: result.data,
      addPosition,
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
