import { clientGetContextMenuRunActions } from '@/features/contextMenu/utils/clientButtonSettings'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { IAction } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
export class ActionFetchActions extends Action {
  static type: ActionIdentifier = 'FETCH_ACTIONS'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const needHistory = this.parameters.ActionFetchActionsWithHistory || false
      let actions = await clientGetContextMenuRunActions(
        this.parameters.template || '',
      )
      if (needHistory) {
        // 如果需要history，那么需要处理contextMenu默认清除上下文的情况
        actions = actions.map((action: IAction) => {
          if (action.type === 'ASK_CHATGPT') {
            if (action.parameters.AskChatGPTActionQuestion?.meta) {
              action.parameters.AskChatGPTActionQuestion.meta.includeHistory =
                true
              action.parameters.AskChatGPTActionQuestion.meta.historyMessages =
                []
            }
          }
          return action
        })
      }
      engine.shortcutsEngine?.pushActions(actions, 'after')
      this.output = params.LAST_AI_OUTPUT || ''
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
