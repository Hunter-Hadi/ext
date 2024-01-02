import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { chromeExtensionClientClosePage } from '@/utils'
export class ActionCloseURLS extends Action {
  static type: ActionIdentifier = 'CLOSE_URLS'
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
      const tabId =
        params.OperationElementTabID || this.parameters.OperationElementTabID
      const tabUrl =
        params.URLActionURL ||
        this.parameters.URLActionURL ||
        params.LAST_ACTION_OUTPUT ||
        ''
      const result = await chromeExtensionClientClosePage({
        tabId,
        url: tabUrl,
      })
      if (!result?.success) {
        this.error = result?.message
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
