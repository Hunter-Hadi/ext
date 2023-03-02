import { IAction } from '@/features/shortcut'

class Action implements IAction {
  name: string
  type: 'prompt' | 'openURL'
  status: 'notRunning' | 'running' | 'complete'
  error?: string
  output?: any

  constructor(name: string, type: 'prompt' | 'openURL') {
    this.name = name
    this.type = type
    this.status = 'notRunning'
  }

  execute(params: any) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
}
export { Action }
