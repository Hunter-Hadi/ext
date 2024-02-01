import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

// NOTE: 这里本来以为是获取网页内容，其实是用script获取网页内容，并不使用url的方式，所以在script而不是web文件夹
export class ActionGetContentsOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_CONTENTS_OF_WEBPAGE'
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
      this.output = await getPageContentWithMozillaReadability()
      if (!this.output) {
        this.output = ''
        this.error = 'No webpage contents'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
