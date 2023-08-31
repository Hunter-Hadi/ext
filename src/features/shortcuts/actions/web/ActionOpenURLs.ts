import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { chromeExtensionClientOpenPage } from '@/utils'
export class ActionOpenURLs extends Action {
  static type = 'OPEN_URLS'
  private openTabId: number | undefined = undefined

  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'OPEN_URLS', parameters, autoExecute)
  }

  async execute(params: ActionParameters, engine: any) {
    try {
      const url =
        params.URLActionURL ||
        this.parameters.URLActionURL ||
        params.LAST_ACTION_OUTPUT ||
        ''
      if (!url) {
        this.error = 'No open url'
        return
      }
      this.openTabId =
        (await chromeExtensionClientOpenPage({ url })) || undefined
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  get tabId() {
    return this.openTabId
  }
}
