import { Action } from '@/features/shortcut/core/Action'
import { IShortcutEngineVariableType } from '@/features/shortcut'

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))
export class PromptAction extends Action {
  constructor(name: string) {
    super(name, 'prompt')
  }
  async execute(
    params: any,
    setVariable: (
      key: IShortcutEngineVariableType,
      value: any,
      overwrite: boolean,
    ) => void,
  ) {
    await delay(6000)
    this.output = '66666666'
    this.status = 'complete'
  }
}
