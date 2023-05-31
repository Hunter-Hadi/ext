import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
export const SLICE_MAX_CHARACTERS = 8000

export class ActionSliceOfText extends Action {
  static type: ActionIdentifier = 'SLICE_OF_TEXT'
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
  async execute(params: ActionParameters, engine: any) {
    try {
      const needSplitText = params.LAST_ACTION_OUTPUT || ''
      const sliceLength =
        this.parameters.SliceTextActionLength || SLICE_MAX_CHARACTERS
      if (!needSplitText) {
        this.error = 'No text to split'
        return
      }
      this.output = needSplitText.slice(0, sliceLength)
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
