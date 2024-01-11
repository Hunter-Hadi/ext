import {
  IShortcutEngineExternalEngine,
  shortcutsRenderTemplate,
} from '@/features/shortcuts'
import { IAction } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import Log from '@/utils/Log'

class Action implements IAction {
  id: string
  type: ActionIdentifier
  status: 'idle' | 'running' | 'complete' | 'stop'
  error?: string
  output?: any
  parameters: ActionParameters
  autoExecute: boolean
  log: Log
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    this.id = id
    this.type = type
    this.status = 'idle'
    this.parameters = Object.assign({}, parameters) || {}
    this.autoExecute = autoExecute
    this.log = new Log(`Action/${type}`)
  }
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
  async parseTemplate(template: string, params: ActionParameters) {
    return shortcutsRenderTemplate(template, params)
  }
  async stop() {
    this.reset()
    return false
  }
  reset() {
    this.status = 'idle'
    this.error = ''
    this.output = ''
  }
}
export default Action
