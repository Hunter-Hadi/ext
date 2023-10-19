// import { compileTemplate } from '../utils'
import Action from '@/features/shortcuts/core/Action'
import { getInputMediator, InputMediatorName } from '@/store/InputMediator'
import { v4 as uuidV4 } from 'uuid'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'
import { getAllPathsAndValues } from '@/utils/dataHelper/arrayHelper'
import lodashSet from 'lodash-es/set'

/**
 * 渲染template
 * @param template
 * @param params
 */
export const shortcutsRenderTemplate = (
  template: string,
  params: any,
): {
  data: string
  error: string
} => {
  try {
    const data = template.replace(
      /\{\{(.+?)\}\}/g,
      (match: string, p1: string) => {
        const parts: string[] = p1.trim().split('.')
        let val: any = params
        while (parts.length) {
          const prop: string = parts.shift()!
          if (Object.prototype.hasOwnProperty.call(val, prop)) {
            val = val[prop]
          } else {
            val = ''
            break
          }
        }
        return val
      },
    )
    return {
      data,
      error: '',
    }
  } catch (e) {
    return {
      data: '',
      error: 'parse template error',
    }
  }
}

/**
 * 模板渲染装饰器
 */
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
        // 现在的业务场景不需要复杂的
        // const result = await compileTemplate(
        //   actionInstance.parameters?.template || '',
        //   parameters,
        // )
        const result = shortcutsRenderTemplate(
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

/**
 * Action的parameters渲染的装饰器
 */
export function parametersParserDecorator() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const [parameters] = args
      const actionInstance: Action = this as any
      getAllPathsAndValues(actionInstance.parameters, (path, value) => {
        if (typeof value === 'string') {
          const renderValue = shortcutsRenderTemplate(value, parameters).data
          try {
            // 看看是不是json
            const data = JSON.parse(renderValue)
            lodashSet(actionInstance.parameters, path, data)
          } catch (e) {
            lodashSet(actionInstance.parameters, path, renderValue)
          }
        }
      })
      await oldFunc.apply(this, args)
    }
  }
}

export function pushOutputToChat(
  {
    onlySuccess,
    onlyError,
  }: {
    onlySuccess?: boolean
    onlyError?: boolean
  } = {
    onlySuccess: false,
    onlyError: false,
  },
) {
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
      // NOTE: Action还没有对外暴露，所以不能显示Action的名称和类型
      const conversationId = engine.getChartGPT()?.getSidebarRef()
        ?.currentConversationIdRef?.current
      if (actionInstance.error && !onlySuccess) {
        engine.getChartGPT()?.pushMessage({
          type: 'system',
          text: actionInstance.error,
          messageId: uuidV4(),
          extra: {
            status: 'error',
          },
          conversationId,
        })
      } else if (actionInstance.output && !onlyError) {
        engine.getChartGPT()?.pushMessage(
          {
            type: 'system',
            text: actionInstance.output,
            messageId: uuidV4(),
            extra: {
              status: 'success',
            },
          },
          conversationId,
        )
      }
      return value
    }
  }
}

/**
 * Action运行的期间都loading
 */
export function withLoadingDecorators() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const [, engine] = args
      engine.getChartGPT()?.showLoading()
      const value = await oldFunc.apply(this, args)
      engine.getChartGPT()?.hideLoading()
      return value
    }
  }
}

/**
 * 清空用户的输入框
 * @param beforeExecute
 */
export function clearUserInput(beforeExecute = true) {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const isInsertToFloatingMenuInput = isFloatingContextMenuVisible()
      let chatBoxInputMediator: InputMediatorName = 'chatBoxInputMediator'
      if (isInsertToFloatingMenuInput) {
        chatBoxInputMediator = 'floatingMenuInputMediator'
      }
      if (beforeExecute) {
        getInputMediator(chatBoxInputMediator).updateInputValue('')
        const value = await oldFunc.apply(this, args)
        return value
      } else {
        const value = await oldFunc.apply(this, args)
        getInputMediator(chatBoxInputMediator).updateInputValue('')
        return value
      }
    }
  }
}
