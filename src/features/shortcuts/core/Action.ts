import { IAction } from '@/features/shortcuts'

class Action implements IAction {
  id: string
  type: 'prompt' | 'openURL'
  status: 'notRunning' | 'running' | 'complete'
  error?: string
  output?: any
  parameters?: {
    [key: string]: any
  }
  constructor(id: string, type: 'prompt' | 'openURL', parameters?: any) {
    this.id = id
    this.type = type
    this.status = 'notRunning'
    this.parameters = parameters
  }

  async execute(params: any) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
}
export { Action }
