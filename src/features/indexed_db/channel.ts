import isArray from 'lodash-es/isArray'
import isObject from 'lodash-es/isObject'
import sift from 'sift'

import ConversationManager from '@/background/src/chatConversations'
import { createBackgroundMessageListener } from '@/background/utils'
import {
  backgroundConversationDB,
  backgroundConversationDBRemoveConversation,
  backgroundConversationDBRemoveMessages,
  backgroundMigrateConversationV3,
} from '@/features/indexed_db/conversations/background'
import {
  IndexedDBChainType,
  IndexedDBListener,
} from '@/features/indexed_db/type'

/**
 * 根据指定的字段列表从对象中投影出相应的字段
 * @param item 原始对象
 * @param keys 需要投影的字段名列表
 */
export const projectObjectWithFields = <T extends Record<string, any>>(
  item: T,
  keys: (keyof T)[],
): any => {
  const returnItem: {
    [key in keyof T]?: T[key]
  } = {}
  Object.keys(item).forEach((key) => {
    if (keys.includes(key as keyof T)) {
      returnItem[key as keyof T] = item[key as keyof T]
    }
  })
  return returnItem
}

const listener: IndexedDBListener = async (type: string, data: any) => {
  switch (type) {
    case 'IndexedDBQueryChain':
      {
        const startTime = new Date().getTime()
        const indexedDBName = data.indexedDBName
        const chain: IndexedDBChainType[] = data.chain || []
        let currentDexieDB: any = null
        if (indexedDBName === 'conversations') {
          currentDexieDB = backgroundConversationDB
        }
        if (chain.length > 0) {
          const [first, ...rest] = chain
          try {
            let previousResult: any = undefined
            let chainFunction =
              first.type === 'get'
                ? (currentDexieDB as any)?.[first.prop]
                : undefined
            for (const stepOfChain of rest) {
              if (stepOfChain.type === 'get') {
                previousResult = chainFunction
                chainFunction = chainFunction?.[stepOfChain.prop]
              } else if (stepOfChain.type === 'apply') {
                // apply
                chainFunction = chainFunction?.apply(
                  previousResult,
                  stepOfChain.args.map((arg) => {
                    if (arg.type === 'SIFT') {
                      return sift(arg.query, arg.options)
                    } else if (arg.type === 'PROJECTION_KEYS') {
                      return (result: Record<string, any>[]) => {
                        if (isArray(result)) {
                          return result.map((item) => {
                            if (isObject(item)) {
                              return projectObjectWithFields(item, arg.keys)
                            }
                            return item
                          })
                        } else if (isObject(result)) {
                          return projectObjectWithFields(result, arg.keys)
                        }
                      }
                    } else {
                      return arg
                    }
                  }),
                )
              }
            }
            const result = chainFunction.then
              ? await chainFunction
              : chainFunction
            console.log(
              'ConversationDB[V3] IndexedDBQueryChain',
              new Date().getTime() - startTime,
              'ms',
            )
            return {
              success: true,
              data: result,
              message: 'OK',
            }
          } catch (e) {
            console.error('IndexedDBQueryChain error', e, chain)
            return {
              success: false,
              data: null,
              message: '',
            }
          }
        }
      }
      break
    case 'ConversationDBRemoveConversation':
      return await backgroundConversationDBRemoveConversation(
        data.conversationId,
        data.softDelete,
      )
    case 'ConversationDBMigrateConversationV3':
      {
        const { conversation, conversationId } = data
        if (conversation) {
          return await backgroundMigrateConversationV3(conversation)
        } else if (conversationId) {
          const oldConversation =
            await ConversationManager.oldVersionConversationDB.getConversationById(
              data.conversationId,
            )
          if (!oldConversation) {
            return undefined
          }
          return await backgroundMigrateConversationV3(oldConversation)
        }
      }
      break
    case 'ConversationDBDeleteMessages': {
      const { conversationId, messageIds } = data
      const result = await backgroundConversationDBRemoveMessages(
        conversationId,
        messageIds,
      )
      return result
    }
  }
  return undefined as any
}

export const initIndexedDBChannel = () => {
  createBackgroundMessageListener(async (runtime, event, data) => {
    if (runtime === 'client') {
      if (event === 'Client_useIndexedDB') {
        const result = await listener(data.type, data.data)
        return {
          success: true,
          data: result,
          message: 'OK',
        }
      }
    }
    return undefined
  })
}
