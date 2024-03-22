import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'

/**
 * 用于处理MaxAI shortcuts运行时的内置变量
 * @since 2024-03-22
 *
 */
export class ActionMaxAIProcessBuiltInParameters extends Action {
  static type: ActionIdentifier = 'MAXAI_PROCESS_BUILT_IN_PARAMETERS'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const start = new Date().getTime()
      const { clientConversationEngine, shortcutsEngine } = engine
      if (clientConversationEngine && shortcutsEngine) {
        if (params.SELECTED_TEXT?.trim()) {
          // 把selected text减少至tokens上限
          const conversation =
            await clientConversationEngine.getCurrentConversation()
          const maxTokens = conversation?.meta.maxTokens || 4096
          const sliceTextResult = await sliceTextByTokens(
            params.SELECTED_TEXT,
            maxTokens,
            {
              thread: 4,
            },
          )
          shortcutsEngine.setVariable({
            isBuiltIn: true,
            key: 'SELECTED_TEXT',
            label: 'Selected text',
            value: sliceTextResult.text,
            overwrite: true,
          })
          const usage = new Date().getTime() - start
          this.log.info(
            `process build-in parameters usage: \t${(usage / 1000).toFixed(
              3,
            )}s. Max tokens: ${maxTokens}`,
          )
        }
      }
    } catch (e) {
      // todo
    } finally {
      this.output = params.LAST_ACTION_OUTPUT
    }
  }
}
