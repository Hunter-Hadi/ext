import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { type IChatMessagesContextData } from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { getChatMessagesContent } from '@/features/shortcuts/utils/chatApp/getChatMessages'
import {
  calculateMaxHistoryQuestionResponseTokens,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
export class ActionGetChatMessagesContentOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE'
  originalChatMessagesContextData: IChatMessagesContextData | null = null
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const OperationElementSelector =
      this.parameters.OperationElementSelector ||
      params.OperationElementSelector ||
      ''
    try {
      const result = await getChatMessagesContent(OperationElementSelector)
      let {
        MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT,
        MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT,
      } = result
      this.output = MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT
      this.originalChatMessagesContextData = result
      const { shortcutsEngine, clientConversationEngine } = engine
      if (shortcutsEngine && clientConversationEngine) {
        // reply with keyPoints的逻辑
        const conversation =
          await clientConversationEngine.getCurrentConversation()
        const AIModelMaxTokens = conversation?.meta?.maxTokens || 4096
        const maxChatMessagesContextTokens =
          AIModelMaxTokens -
          calculateMaxHistoryQuestionResponseTokens(AIModelMaxTokens)
        // 先计算TargetContext的Tokens占用，剩下的再给FullContext
        const {
          isLimit,
          text: sliceOfTargetPostContext,
          tokens: sliceOfTargetPostContextUsingTokens,
        } = await sliceTextByTokens(
          MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT,
          AIModelMaxTokens - maxChatMessagesContextTokens,
        )
        MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT =
          sliceOfTargetPostContext
        if (isLimit) {
          MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT = ''
        } else {
          const { text: sliceOfFullPostContext } = await sliceTextByTokens(
            MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT,
            AIModelMaxTokens - sliceOfTargetPostContextUsingTokens,
          )
          MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT =
            sliceOfFullPostContext
        }
        shortcutsEngine.pushActions(
          [
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap: {
                  MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT: {
                    key: 'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                    value:
                      MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Target message',
                  },
                  MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT: {
                    key: 'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                    value:
                      MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Context',
                  },
                },
              },
            },
            {
              type: 'RENDER_TEMPLATE',
              parameters: {
                template:
                  result.MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT,
              },
            },
          ],
          'after',
        )
      }
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessageStatus(params)
    return true
  }
}
