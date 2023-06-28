import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
export const SLICE_MAX_CHARACTERS = 6000

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
      if (!needSplitText) {
        this.error = 'No text to split'
        return
      }
      if (this.parameters.SliceTextActionType === 'TOKENS') {
        this.output = await sliceTextByTokens(
          needSplitText,
          this.parameters.SliceTextActionTokens,
        )
      } else {
        const sliceLength =
          this.parameters.SliceTextActionLength || SLICE_MAX_CHARACTERS
        this.output = needSplitText.slice(0, sliceLength)
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
