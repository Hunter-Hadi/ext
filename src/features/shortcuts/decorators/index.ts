import { compileTemplate } from '@/features/shortcuts/utils'
import { Action } from '@/features/shortcuts'

export function templateParserDecorator() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const [parameters] = args
      const actionInstance: Action = this as any
      if (actionInstance.parameters?.template) {
        const result = await compileTemplate(
          actionInstance.parameters?.template || '',
          parameters,
        )
        if (result.error) {
          actionInstance.error = result.error
          actionInstance.parameters.compliedTemplate = ''
        } else {
          actionInstance.parameters.compliedTemplate = result.data
        }
      }
      await oldFunc.apply(this, args)
    }
  }
}
export function pushOutputToChat() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const [, engine] = args
      const actionInstance: Action = this as any
      const value = await oldFunc.apply(this, args)
      if (actionInstance.error) {
        engine
          .getChartGPT()
          ?.pushMessage(
            'system',
            `Action [${actionInstance.type}]: ${actionInstance.error}`,
            'error',
          )
      } else if (actionInstance.output) {
        engine
          .getChartGPT()
          ?.pushMessage(
            'third',
            `Action [${actionInstance.type}]: ${actionInstance.output}`,
            'success',
          )
      }
      return value
    }
  }
}
export function clearUserInput() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const [, engine] = args
      const value = await oldFunc.apply(this, args)
      engine.getChartGPT()?.forceUpdateInputValue('')
      return value
    }
  }
}
