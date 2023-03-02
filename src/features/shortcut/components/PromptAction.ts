import { Action } from '@/features/shortcut/core/Action'

export class PromptAction extends Action {
  constructor(name: string) {
    super(name, 'prompt')
  }
  execute(params: any) {
    console.log('PromptAction.execute')
    this.output = '666666'
  }
}
