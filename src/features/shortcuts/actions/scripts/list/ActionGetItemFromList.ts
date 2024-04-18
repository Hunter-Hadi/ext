import lodashGet from 'lodash-es/get'
import isArray from 'lodash-es/isArray'

import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * 获取列表中的元素
 * @description - 从作为输入传递的列表中返回一个或多个项目。您可以获取第一项、最后一项、随机项、特定索引处的项或索引范围内的项。
 * @example
 * ```
 * {
 *   type: 'SCRIPTS_GET_ITEM_FROM_LIST',
 *   parameters: {
 *     ActionGetItemFromListType: 'last',
 *   },
 * },
 * ```
 * @hasOutput true
 *
 */
export class ActionGetItemFromList extends Action {
  static type: ActionIdentifier = 'SCRIPTS_GET_ITEM_FROM_LIST'

  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const getListType = this.parameters.ActionGetItemFromListType || 'first'
      const getListIndex = this.parameters.ActionGetItemFromListIndex
      const getListRangeStart = this.parameters.ActionGetItemFromListRangeStart
      const getListRangeEnd = this.parameters.ActionGetItemFromListRangeEnd
      const getListMatchKey = this.parameters.ActionGetItemFromMatchKey
      const getListMatchValue = this.parameters.ActionGetItemFromMatchValue
      const list = params.LAST_ACTION_OUTPUT || []
      if (!isArray(list)) {
        throw new Error('List is required')
      }
      if (getListType === 'first') {
        this.output = list[0]
      } else if (getListType === 'last') {
        this.output = list[list.length - 1]
      } else if (getListType === 'index') {
        if (!getListIndex) {
          throw new Error('Index is required')
        }
        this.output = list[getListIndex]
      } else if (getListType === 'range') {
        if (!getListRangeStart) {
          throw new Error('Range start is required')
        }
        if (!getListRangeEnd) {
          throw new Error('Range end is required')
        }
        this.output = list.slice(getListRangeStart, getListRangeEnd)
      } else if (getListType === 'matchEqual') {
        if (!getListMatchKey) {
          throw new Error('Match key is required')
        }
        if (!getListMatchValue) {
          throw new Error('Match value is required')
        }
        this.output = list.find(
          (item: any) => lodashGet(item, getListMatchKey) === getListMatchValue,
        )
      } else if (getListType === 'matchContains') {
        if (!getListMatchKey) {
          throw new Error('Match key is required')
        }
        if (!getListMatchValue) {
          throw new Error('Match value is required')
        }
        this.output = list.find((item: any) =>
          lodashGet(item, getListMatchKey).includes(getListMatchValue),
        )
      } else {
        throw new Error('Invalid list type')
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
