// import { compileTemplate } from '../utils'
import Action from '@/features/shortcuts/core/Action'
import { getInputMediator, InputMediatorName } from '@/store/InputMediator'
import { v4 as uuidV4 } from 'uuid'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'

function render(
  template: string,
  params: any,
): {
  data: string
  error: string
} {
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
        const result = render(
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
export function withLoading() {
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
