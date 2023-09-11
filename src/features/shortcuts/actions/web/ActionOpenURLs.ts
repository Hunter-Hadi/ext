import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { chromeExtensionClientOpenPage } from '@/utils'
export class ActionOpenURLs extends Action {
  static type: ActionIdentifier = 'OPEN_URLS'

  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  async execute(params: ActionParameters, engine: any) {
    try {
      const url =
        params.URLActionURL ||
        this.parameters.URLActionURL ||
        params.LAST_ACTION_OUTPUT ||
        ''
      const active =
        params.URLActionActiveTab || this.parameters.URLActionActiveTab
      if (!url) {
        this.error = 'No open url'
        return
      }
      if (url === 'current_page') {
        this.output =
          (await chromeExtensionClientOpenPage({ key: 'current_page' })) ||
          undefined
      } else {
        this.output =
          (await chromeExtensionClientOpenPage({ url, active })) || undefined
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
