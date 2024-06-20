// import { compileTemplate } from '../utils'
import lodashSet from 'lodash-es/set'
import { v4 as uuidV4 } from 'uuid'

import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { getInputMediator, InputMediatorName } from '@/store/InputMediator'
import { getAllPathsAndValues } from '@/utils/dataHelper/arrayHelper'

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
            val = typeof val[prop] === 'string' ? val[prop] : String(val[prop])
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
export function parametersParserDecorator(filterPath?: string[]) {
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
        if (filterPath?.includes(path[0])) {
          return
        }
        if (typeof value === 'string') {
          // console.log('parametersParserDecorator path', path, value)
          // 有且只有一个变量: {{LAST_ACTION_OUTPUT}}
          const renderValue = shortcutsRenderTemplate(value, parameters).data
          if (
            value.startsWith('{{') &&
            value.endsWith('}}') &&
            (renderValue.includes(`[object Object]`) ||
              renderValue.includes(`[object Array]`))
          ) {
            // 如果是[object Object]或者[object Array]，看看Variable是否有对应的
            const variableName = value.slice(2, -2)
            const variableData = parameters[variableName]
            if (
              variableData instanceof Array ||
              variableData instanceof Object
            ) {
              lodashSet(actionInstance.parameters, path, variableData)
              return
            }
          }
          try {
            // 看看是不是json
            const data = JSON.parse(renderValue)
            if (data instanceof Array || data instanceof Object) {
              lodashSet(actionInstance.parameters, path, data)
            } else {
              lodashSet(actionInstance.parameters, path, renderValue)
            }
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
      const { clientConversationEngine } =
        engine as IShortcutEngineExternalEngine
      const conversationId =
        clientConversationEngine?.currentConversationIdRef.current
      if (conversationId) {
        if (actionInstance.error && !onlySuccess) {
          await clientConversationEngine.pushMessage(
            {
              type: 'system',
              text: actionInstance.error,
              messageId: uuidV4(),
              meta: {
                status: 'error',
              },
            },
            conversationId,
          )
        } else if (actionInstance.output && !onlyError) {
          await clientConversationEngine.pushMessage(
            {
              type: 'system',
              text: actionInstance.output,
              messageId: uuidV4(),
              meta: {
                status: 'success',
              },
            },
            conversationId,
          )
        }
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
      const externalEngine = engine as IShortcutEngineExternalEngine
      externalEngine?.clientConversationEngine?.showConversationLoading(
        externalEngine.shortcutsEngine?.conversationId,
      )
      const value = await oldFunc.apply(this, args)
      externalEngine?.clientConversationEngine?.hideConversationLoading(
        externalEngine.shortcutsEngine?.conversationId,
      )
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

/**
 * 在stop的时候，结束最后一条AI message
 */
export function completeLastAIMessageOnStop() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (params: {
      engine: IShortcutEngineExternalEngine
    }) {
      const { clientConversationEngine } = params?.engine || {}
      // 结束最后一条AI message
      if (clientConversationEngine?.currentConversationIdRef.current) {
        const currentConversation =
          await clientConversationEngine.getCurrentConversation()
        if (currentConversation) {
          const lastMessage =
            await ClientConversationMessageManager.getMessageByTimeFrame(
              currentConversation.id,
              'latest',
            )
          if (lastMessage && isAIMessage(lastMessage)) {
            if (lastMessage.originalMessage) {
              await ClientConversationMessageManager.updateMessagesWithChanges(
                currentConversation.id,
                [
                  {
                    key: lastMessage.messageId,
                    changes: {
                      'originalMessage.metadata.sources.status': 'complete',
                      'originalMessage.metadata.isComplete': true,
                    } as any,
                  },
                ],
              )
            }
          }
        }
      }
      const value = await oldFunc.apply(this, [params])
      return value
    }
  }
}

/**
 * 在error的时候，结束最后一条AI message
 */
export function completeLastAIMessageOnError() {
  return function (
    target: Action,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFunc = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const value = await oldFunc.apply(this, args)
      const actionInstance: Action = this as any
      if (actionInstance.error) {
        const [, engine] = args
        const { clientConversationEngine } =
          (engine as IShortcutEngineExternalEngine) || {}
        // 结束最后一条AI message
        if (clientConversationEngine?.currentConversationIdRef.current) {
          const currentConversation =
            await clientConversationEngine.getCurrentConversation()
          if (currentConversation) {
            const lastMessage =
              await ClientConversationMessageManager.getMessageByTimeFrame(
                currentConversation.id,
                'latest',
              )
            if (lastMessage && isAIMessage(lastMessage)) {
              if (lastMessage.originalMessage) {
                await ClientConversationMessageManager.updateMessagesWithChanges(
                  currentConversation.id,
                  [
                    {
                      key: lastMessage.messageId,
                      changes: {
                        'originalMessage.metadata.sources.status': 'complete',
                        'originalMessage.metadata.isComplete': true,
                      } as any,
                    },
                  ],
                )
              }
            }
          }
        }
      }
      return value
    }
  }
}
