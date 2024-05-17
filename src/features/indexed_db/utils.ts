import sift from 'sift'

import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ConversationDB } from '@/features/indexed_db/conversations/models/db'
import {
  IndexedDBChainType,
  IndexedDBListener,
  IndexedDBNameType,
} from '@/features/indexed_db/type'

export const clientUseIndexedDB: IndexedDBListener = async (
  type: string,
  data: any,
) => {
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  const result = await port.postMessage({
    event: 'Client_useIndexedDB',
    data: {
      data,
      type,
    },
  })
  return result.data
}

/**
 * 因为postMessage不能传递函数，所以需要用这个函数来创建查询
 * https://github.com/crcn/sift.js
 * $in：在给定的值列表中匹配任何一个值。
 * $nin：不在给定的值列表中匹配任何一个值。
 * $exists：检查字段是否存在。
 * $gte：大于或等于给定值。
 * $gt：大于给定值。
 * $lte：小于或等于给定值。
 * $lt：小于给定值。
 * $eq：等于给定值。
 * $ne：不等于给定值。
 * $mod：使用给定除数和余数对字段进行取模运算。
 * $all：匹配包含给定值列表中所有值的字段。
 * $and：同时满足多个查询条件。
 * $or：满足任一查询条件。
 * $nor：不满足任何查询条件。
 * $not：对查询条件进行逻辑取反。
 * $size：检查数组字段的长度是否等于给定值。
 * $type：检查字段的数据类型。
 * $regex：使用正则表达式进行模式匹配。
 * $where：使用JavaScript表达式进行自定义查询。
 * $elemMatch：对数组字段中的元素进行匹配。
 * @param query
 * @param options
 */
export const dbSift = <T>(
  query: Parameters<typeof sift<T>>[0],
  options?: Parameters<typeof sift<T>>[1],
): any => {
  return {
    type: 'SIFT',
    query: query,
    options: options,
  }
}
/**
 * 获取需要投影的字段列表
 * @param keys 需要投影的字段名列表
 */
export const getProjectionFields = <T>(keys: (keyof T)[]): any => {
  return {
    type: 'PROJECTION_KEYS',
    keys,
  }
}

/**
 * 创建查询的链式调用
 * @example
 * 一定要用await xxx.a.b.c.d.then()的方式调用
 * 或者xxx.a.b.c.d.then(result => void)，因为then不是真正的promise
 * createConversationDBQuery()
 *   .conversations
 *   .where('id')
 *   .equals('1')
 *   .then((result) => {})
 * await createConversationDBQuery()
 *   .conversations.where('id')
 *   .anyOf(remoteConversationIds)
 *   .toArray()
 *   .then(resolve)
 */
export const createIndexedDBQuery = function (
  indexedDBName: IndexedDBNameType,
) {
  const chain: IndexedDBChainType[] = []
  const createProxy = (chain: IndexedDBChainType[]): any => {
    return new Proxy(() => {}, {
      get: (target, prop) => {
        chain.push({
          type: 'get',
          prop: prop as string,
        })
        if (prop === 'then') {
          // 把then去掉
          chain.pop()
          // 返回一个函数
          return () => {
            return new Promise((resolve) => {
              clientUseIndexedDB('IndexedDBQueryChain', {
                indexedDBName,
                chain,
              }).then((result) => {
                resolve(result?.data)
              })
            })
          }
        }
        return createProxy(chain)
      },
      apply: (target, thisArg, args) => {
        chain.push({
          type: 'apply',
          args,
        })
        return createProxy(chain)
      },
    })
  }
  return createProxy(chain) as ConversationDB
}
