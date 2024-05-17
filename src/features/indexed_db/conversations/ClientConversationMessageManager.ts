import { UpdateSpec } from 'dexie'
import { v4 as uuidV4 } from 'uuid'

import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { createIndexedDBQuery } from '@/features/indexed_db/utils'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

export class ClientConversationMessageManager {
  /**
   * 处理消息
   * @param conversationId
   * @param messages
   * @private
   */
  private static processMessages(
    conversationId: string,
    messages: IChatMessage[],
  ) {
    return messages.map((message, index) => {
      if (!message.messageId) {
        message.messageId = uuidV4()
      }
      if (!message.parentMessageId) {
        message.parentMessageId = messages[index - 1]?.messageId || ''
      }
      message.conversationId = conversationId
      return message
    })
  }

  /**
   * 获取消息
   * @param conversationId
   */
  static async getMessages(conversationId: string) {
    try {
      const messages = await createIndexedDBQuery('conversations')
        .messages.where('conversationId')
        .equals(conversationId)
        .toArray()
        .then()
      console.log(`ConversationDB[V3] 获取消息`, messages)
      return messages
    } catch (e) {
      console.log(`ConversationDB[V3] 获取消息失败`, e)
      return []
    }
  }

  static async addMessages(conversationId: string, messages: IChatMessage[]) {
    try {
      const result = await createIndexedDBQuery('conversations')
        .messages.bulkPut(this.processMessages(conversationId, messages))
        .then()
      console.log(`ConversationDB[V3] 添加消息`, result)
      return result
    } catch (e) {
      console.log(`ConversationDB[V3] 添加或更新消息失败`, e)
      return false
    }
  }
  // https://dexie.org/docs/Table/Table.bulkUpdate()
  static async updateMessagesWithChanges(
    messageChanges: ReadonlyArray<{
      key: string
      changes: UpdateSpec<IChatMessage>
    }>,
  ) {
    try {
      const updateResult = await createIndexedDBQuery('conversations')
        .messages.bulkUpdate(messageChanges)
        .then()
      console.log(`ConversationDB[V3] 更新消息`, updateResult)
      return updateResult
    } catch (e) {
      console.log(`ConversationDB[V3] 更新消息失败`, e)
      return false
    }
  }
  static async updateMessage(updateMessageData: Partial<IChatMessage>) {
    try {
      if (!updateMessageData.messageId) {
        return false
      }
      const result = await createIndexedDBQuery('conversations')
        .messages.get(updateMessageData.messageId)
        .then()
      const mergeMessage = mergeWithObject([result, updateMessageData])
      const updateResult = await createIndexedDBQuery('conversations')
        .messages.put(mergeMessage)
        .then()
      console.log(`ConversationDB[V3] 更新消息`, updateResult)
      return updateResult
    } catch (e) {
      console.log(`ConversationDB[V3] 更新消息失败`, e)
      return false
    }
  }

  static async deleteMessages(messageIds: string[]) {
    try {
      const result = await createIndexedDBQuery('conversations')
        .messages.bulkDelete(messageIds)
        .then()
      return result
    } catch (e) {
      console.log(`ConversationDB[V3] 删除消息失败`, e)
      return false
    }
  }
}

// export async function testClientConversationMessageManager() {
//   /**
//    * @param ob Object                 The object to flatten
//    * @param prefix String (Optional)  The prefix to add before each key, also used for recursion
//    **/
//   function flattenObject(
//     ob: Record<string, any>,
//     prefix: string | false = false,
//     result: Record<string, any> | null = null,
//   ): Record<string, any> {
//     result = result || {}
//
//     // Preserve empty objects and arrays, they are lost otherwise
//     if (
//       prefix &&
//       typeof ob === 'object' &&
//       ob !== null &&
//       Object.keys(ob).length === 0
//     ) {
//       result[prefix] = Array.isArray(ob) ? [] : {}
//       return result
//     }
//
//     const newPrefix = prefix ? prefix + '.' : ''
//
//     for (const i in ob) {
//       if (Object.prototype.hasOwnProperty.call(ob, i)) {
//         // Only recurse on true objects and arrays, ignore custom classes like dates
//         if (
//           typeof ob[i] === 'object' &&
//           (Array.isArray(ob[i]) ||
//             Object.prototype.toString.call(ob[i]) === '[object Object]') &&
//           ob[i] !== null
//         ) {
//           // Recursion on deeper objects
//           flattenObject(ob[i], newPrefix + i, result)
//         } else {
//           result[newPrefix + i] = ob[i]
//         }
//       }
//     }
//     return result
//   }
//
//   /**
//    * Bonus function to unflatten an object
//    *
//    * @param ob Object     The object to unflatten
//    */
//   function unflattenObject(ob: Record<string, any>): Record<string, any> {
//     const result: Record<string, any> = {}
//     for (const i in ob) {
//       if (Object.prototype.hasOwnProperty.call(ob, i)) {
//         const keys = i.match(/(?:^\.+)?(?:\.{2,}|[^.])+(?:\.+$)?/g)! // Just a complicated regex to only match a single dot in the middle of the string
//         keys.reduce((r, e, j) => {
//           return (
//             r[e] ||
//             (r[e] = isNaN(Number(keys[j + 1]))
//               ? keys.length - 1 === j
//                 ? ob[i]
//                 : {}
//               : [])
//           )
//         }, result)
//       }
//     }
//     return result
//   }
//
//   // 测试 processMessages
//   const conversationId = 'conv-1'
//   const testUserMessage: IUserChatMessage = {
//     type: 'user',
//     text: "what's this",
//     meta: {
//       includeHistory: false,
//       meta: {},
//       attachments: [
//         {
//           id: 'f124f84e-e540-4323-a8d3-680ce083a1c6',
//           fileName: 'text1 2.txt',
//           fileSize: 11,
//           fileType: 'text/plain',
//           uploadStatus: 'success',
//           uploadProgress: 100,
//           icon: 'file',
//           blobUrl:
//             'blob:chrome-extension://jiibnaapckdanbcmdnpacbgcpbgokpga/67718b2b-7f32-464f-9e00-353f3cd00592',
//           uploadedUrl:
//             'blob:chrome-extension://jiibnaapckdanbcmdnpacbgcpbgokpga/67718b2b-7f32-464f-9e00-353f3cd00592',
//           extractedContent: '1\n2\n3\n4\n5\n6',
//           uploadedFileId: 'f124f84e-e540-4323-a8d3-680ce083a1c6',
//         },
//         {
//           id: '2d2dcc88-aa18-4eae-935c-269356d95fd1',
//           fileName: 'text2.txt',
//           fileSize: 14,
//           fileType: 'text/plain',
//           uploadStatus: 'success',
//           uploadProgress: 100,
//           icon: 'file',
//           blobUrl:
//             'blob:chrome-extension://jiibnaapckdanbcmdnpacbgcpbgokpga/9e4aea97-c2c7-4201-b282-e4f9e986879e',
//           uploadedUrl:
//             'blob:chrome-extension://jiibnaapckdanbcmdnpacbgcpbgokpga/9e4aea97-c2c7-4201-b282-e4f9e986879e',
//           extractedContent: '7\n8\n9\n10\n11\n12',
//           uploadedFileId: '2d2dcc88-aa18-4eae-935c-269356d95fd1',
//         },
//         {
//           id: '040b05fe-6c2d-4d12-b43b-c12ac4759a8c',
//           fileName: 'tsconfig.json',
//           fileSize: 522,
//           fileType: 'application/json',
//           uploadStatus: 'success',
//           uploadProgress: 100,
//           icon: 'file',
//           blobUrl:
//             'blob:chrome-extension://jiibnaapckdanbcmdnpacbgcpbgokpga/3c8d76be-9ee1-4694-8196-e53b02b6b5b9',
//           uploadedUrl:
//             'blob:chrome-extension://jiibnaapckdanbcmdnpacbgcpbgokpga/3c8d76be-9ee1-4694-8196-e53b02b6b5b9',
//           extractedContent:
//             '{\n  "compilerOptions": {\n    "resolveJsonModule": true,\n    "allowSyntheticDefaultImports": true,\n    "esModuleInterop": true,\n    "jsx": "react",\n    "lib": ["dom", "es2021"],\n    "module": "ESNext",\n    "moduleResolution": "node",\n    "noImplicitReturns": false,\n    "noUnusedLocals": true,\n    "strict": true,\n    "target": "es2018",\n    "paths": {\n      "@/*": ["src/*"]\n    },\n    "experimentalDecorators": true,\n    "baseUrl": "./",\n    "types": [\n      "esbuild-style-plugin"\n    ],\n    "skipLibCheck": true,\n  }\n}\n',
//           uploadedFileId: '040b05fe-6c2d-4d12-b43b-c12ac4759a8c',
//         },
//       ],
//       contexts: [],
//       messageVisibleText: "what's this",
//     },
//     conversationId: '',
//     messageId: '',
//     parentMessageId: '',
//     created_at: '2024-05-15T08:27:03.043Z',
//     updated_at: '2024-05-15T08:27:03.043Z',
//     publishStatus: 'unpublished',
//   }
//   const AIChatMessage: IAIResponseMessage = {
//     type: 'ai',
//     messageId: '712ff983-6c56-47bf-b1ba-e2b7ede1cdda',
//     parentMessageId: '',
//     conversationId: '',
//     text: '',
//     originalMessage: {
//       metadata: {
//         shareType: 'search',
//         title: {
//           title: "what's the apple ince?",
//         },
//         copilot: {
//           title: {
//             title: 'Copilot',
//             titleIcon: 'Awesome',
//             titleIconSize: 24,
//           },
//           steps: [
//             {
//               title: 'Understanding question',
//               status: 'complete',
//               icon: 'CheckCircle',
//             },
//             {
//               title: 'Searching web',
//               status: 'complete',
//               icon: 'Search',
//               valueType: 'tags',
//               value:
//                 '\n  apple ince meaning,\n  definition of apple ince,\n  what is apple ince\n',
//             },
//           ],
//         },
//         sources: {
//           status: 'complete',
//           links: [
//             {
//               title: "What does the 'Inc.' in Apple Inc. mean? - Quora",
//               body: "What does the 'Inc.' in Apple Inc. mean? - Quora",
//               url: 'https://www.quora.com/What-does-the-Inc-in-Apple-Inc-mean',
//               from: 'Quora',
//               favicon:
//                 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAAJ1BMVEVHcEy4Kia5Kie5Kia5Kia5Kye5Kye5Kya5Kia5Kye5Kia5Kie4KiaI6V0GAAAADXRSTlMADBspb5e1yYD/56ZYakswVQAAAKJJREFUeAFjIAIwKhsJIHjMrullIQZwufaZQFABkxefCQaFUMlKCHe6AExy1hbvlTDpzpmzGhkYJFbOnAE2tnLmGhB9auZ0kOEsM2c2gLgcM2c6ACnRmbMEwCaunBkIpNRmzobYsHNmEpA0nzkFwvWcWYzGRVOMZhSaRWjOwHQkwguJKB6cuRhigzqEB9QLCxwISIIHXTkINMID1hgEBAiEPwAg+lTXbUrMegAAAABJRU5ErkJggg==',
//               searchQuery: 'apple ince meaning',
//             },
//             {
//               title: 'Apple Inc.',
//               url: 'https://en.wikipedia.org/wiki/Apple_Inc.',
//               from: 'Wikipedia',
//               favicon:
//                 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAAnklEQVR4AeTNIQiDQABG4b+u17X1aF6PK3YEO9iMJqPVau82y4FgMezS0oVLhqsHtrcqeqzDXv3CEz/6L4yTtZM3dnHmPTtjzXZAXKYVo4agkU2GI2Lloc6JDez1+flswMu1EQZ3xlE7lK8eKDkjtwE+crBMV+wesKmCiisGGepZIfQJpMj9SNb2MYWrChjVkULuCyCfRvsdmBieyQQAsoDk/9ryhFMAAAAASUVORK5CYII=',
//               searchQuery: '\n  definition of apple ince',
//             },
//             {
//               title: 'Apple Inc. | History, Products, Headquarters, & Facts',
//               url: 'https://www.britannica.com/money/Apple-Inc',
//               from: 'Britannica',
//               favicon:
//                 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAPFBMVEVHcEwKPmwLQGwLQGwLQGsAOmkZTHVOb48pVHs5YISCma9yjKRhfpqQpbiwwM0AL2LN19/l6++escH+/v8tWRs0AAAABXRSTlMAILD/6JrywKcAAAGHSURBVHgBdJPhjgMhCIS3tYCICsj7v+vRbi9mez1+ycznxEA8jtu9/Fv3W/qPiwR4aR+343IfkQjrJePYAVCZmkhvjLAjju0TNW6VhQfxjtgA9EYI1AFpCHwBSpU6BkmftfM3AKirORZzIPoG6Jh1WFtz8lr6BwAeSC5szt2ZG8NnAvpAa7JmFy/i9Q8AfVjtQRlTTTq81QTOMODVbYETexXvk94qHNA6vJrmQ0aVxa0NXy8bmiRAMRsUwDGQA801OrRVAWDMyISiEd4LJugc7I5BFgQVe0RovgFnHmwqsNmSMWlO76rTUp74BDye1RRQuOhr5KrjJXpJ4H0OAwAdNpcCVDu1BgkUfHcTCkiKp+9P5RwU6PBsPEyBIgTUwmYiQ08gkZW4eIgmQCrhksLSPWqYkY55oXBCt/7MT38D0DOWvT8TxNnDCD7WrdUmSwLS6zTU6zbfKYySQOFzOxvYCLSIodu+Alk6fh+3gccFmBF2AR7Xr6cW4Rfg/vF5QRV+hpp5CWZ/AE8PHpOm8Wf2AAAAAElFTkSuQmCC',
//               searchQuery: '\n  definition of apple ince',
//             },
//             {
//               title: 'Apple (Hong Kong)',
//               url: 'https://www.apple.com/hk/en/',
//               from: 'Apple',
//               favicon:
//                 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC5UlEQVR4Aa1XQ3hkQRjc+ynX2OZtbfu+tm3b1nlt27a9O4qNS5xxbdd+cTKvXydT31fJoPuvmvf6/ejw86dBlX6CwwQXCq6t5cLaz/xV4+ld6F8r9NdgsCAjIwf5+UUoLCwBydf8jN+JNQbBddzjDQM+gocErRSyWm2QgWu4lntq9/q01UAfwYKCgmK43W6ognu4lzEE+6oamCboLC0tR3vBGIwlOF2vgZm5uQWoqamBXrhcLpw5cxZ79uxFKxCxrGBMxpYZ6Eu33KAXNDp+/AQEBgbzv8Y6Kxi7+e1ofuAKVS/7zp27KE7i6dNnem5HAbVaM3CYh0YF/PWRkdEUpxHoQe3BPNTcQJCgTc9pT0tLh8VigdPpBLFv3368evVKBC7A16/fkJmZKX06qCXo39jAej67Wnjx4iVGjBiJ0NBwBAeHYsCAgTh48BCuXLmCKVOmIioqBrwS4eGRGDduPMxmMzyBWtRsbMCglWSePXuOkJAwCuhmnz79YLVaPSUrGjDWGQhgCvWEyspKdOrURUk8JiYO799/0Exg1KQ2DQxjHveEO3fuKomTPBcyUJPaNLCQxcQTNm3arGzAYDBABmoK7UU0sE7rAC5dukxJPCgoRPy6DMhATWpLDWzbtl35Cty//0DBgOQW3LhxU9nAsGEj4HA4dN0CySHkwvy6bKfECRMmISsrS34IZY8hMXnyFAZV5rFjx6WPoa5E9PnzZ2XxpKQUlJaWaiUik1IqXrBgkZKB06fPwBOKiv4fwA3Ni5FdK3NVVFSgd+++usRnzJilXIzII7JynJOTAxaa7t17Yt68+bh37z6+fPmKCxcuYvToMejVqzdWrVrNMi0rx4cVGxIFKDQkCi2ZAhRaMklTavWqeF6epCltxuneasvLyurb8lmqg0lfLw4m/dozmh0RtBUV6R/NuJZ7avf6eGs4ZeIwMoVmZrYcTvkZv+MarlUZTlUZIDi8diRfX8uFtZ8FqMb7Bx+2VJbBTrlcAAAAAElFTkSuQmCC',
//               searchQuery: '\n  what is apple ince',
//             },
//             {
//               title: 'What is Apple? An products and history overview',
//               url: 'https://www.techtarget.com/whatis/definition/Apple',
//               from: 'TechTarget',
//               favicon:
//                 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAAKlBMVEVHcEwAdHQAdHQAdHQAdHQAdHQAdHQAdHQAdHQAdHQAdHQAdHQAdHQAdHRE5CM+AAAADnRSTlMAFmCFprKS8/8ryEfjdavMLikAAACVSURBVHgBY6ArYFR2DTESgPHEKjqAoD0RwpvV0eLR0dEW0bESxGNtt+TucFLtEJjc4cDAwNmzgUGikYFhRgMD94kJDDc2MDB4TLAoYmpmYOBuYggAqu9h6qnY0APSCDaslauBI2EF3N4uliaLC8fh3BUMFT2MrXDujgXcG3g64VzWng3cFQkIR2d0dPQi++GKLwN9AQDBWSgQdOjOvwAAAABJRU5ErkJggg==',
//               searchQuery: '\n  definition of apple ince',
//             },
//             {
//               title: 'Apple',
//               url: 'https://www.apple.com/',
//               from: 'Apple',
//               favicon:
//                 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC5UlEQVR4Aa1XQ3hkQRjc+ynX2OZtbfu+tm3b1nlt27a9O4qNS5xxbdd+cTKvXydT31fJoPuvmvf6/ejw86dBlX6CwwQXCq6t5cLaz/xV4+ld6F8r9NdgsCAjIwf5+UUoLCwBydf8jN+JNQbBddzjDQM+gocErRSyWm2QgWu4lntq9/q01UAfwYKCgmK43W6ognu4lzEE+6oamCboLC0tR3vBGIwlOF2vgZm5uQWoqamBXrhcLpw5cxZ79uxFKxCxrGBMxpYZ6Eu33KAXNDp+/AQEBgbzv8Y6Kxi7+e1ofuAKVS/7zp27KE7i6dNnem5HAbVaM3CYh0YF/PWRkdEUpxHoQe3BPNTcQJCgTc9pT0tLh8VigdPpBLFv3368evVKBC7A16/fkJmZKX06qCXo39jAej67Wnjx4iVGjBiJ0NBwBAeHYsCAgTh48BCuXLmCKVOmIioqBrwS4eGRGDduPMxmMzyBWtRsbMCglWSePXuOkJAwCuhmnz79YLVaPSUrGjDWGQhgCvWEyspKdOrURUk8JiYO799/0Exg1KQ2DQxjHveEO3fuKomTPBcyUJPaNLCQxcQTNm3arGzAYDBABmoK7UU0sE7rAC5dukxJPCgoRPy6DMhATWpLDWzbtl35Cty//0DBgOQW3LhxU9nAsGEj4HA4dN0CySHkwvy6bKfECRMmISsrS34IZY8hMXnyFAZV5rFjx6WPoa5E9PnzZ2XxpKQUlJaWaiUik1IqXrBgkZKB06fPwBOKiv4fwA3Ni5FdK3NVVFSgd+++usRnzJilXIzII7JynJOTAxaa7t17Yt68+bh37z6+fPmKCxcuYvToMejVqzdWrVrNMi0rx4cVGxIFKDQkCi2ZAhRaMklTavWqeF6epCltxuneasvLyurb8lmqg0lfLw4m/dozmh0RtBUV6R/NuJZ7avf6eGs4ZeIwMoVmZrYcTvkZv+MarlUZTlUZIDi8diRfX8uFtZ8FqMb7Bx+2VJbBTrlcAAAAAElFTkSuQmCC',
//               searchQuery: '\n  what is apple ince',
//             },
//           ],
//         },
//       },
//       includeHistory: true,
//       content: {
//         contentType: 'text',
//         text: 'The term "Apple Inc." refers to the name of the American multinational corporation that specializes in consumer electronics, software services, and online services. Founded in 1976, Apple has been a pioneer in the technology industry and has introduced groundbreaking products like the iPhone, iPad, Mac, Apple Watch, and Apple TV [[2](https://en.wikipedia.org/wiki/Apple_Inc.)].\n\nThe word "Inc." in Apple Inc. stands for "Incorporated." It is a suffix commonly used in company names to denote that the business is a corporation, a legal entity separate from its owners. Being incorporated offers certain legal protections and benefits to the company and its shareholders. The use of "Inc." in Apple\'s name signifies its status as a corporate entity [[1](https://www.quora.com/What-does-the-Inc-in-Apple-Inc-mean)].\n\nIn summary, Apple Inc. is the official name',
//       },
//     },
//     created_at: '2024-05-15T08:30:05.092Z',
//     updated_at: '2024-05-15T08:30:18.760Z',
//     publishStatus: 'unpublished',
//   }
//   const processLast = ClientConversationMessageManager['processMessages'](
//     conversationId,
//     [testUserMessage, AIChatMessage],
//   )
//   const messages: IChatMessage[] = [
//     {
//       type: 'user',
//       messageId: processLast[0].messageId,
//       text: '123',
//     },
//     {
//       type: 'ai',
//       messageId: processLast[1].messageId,
//       text: '456',
//     },
//   ]
//   debugger
//   const processedMessages = ClientConversationMessageManager['processMessages'](
//     conversationId,
//     messages,
//   )
//   console.log('Processed Messages:', processedMessages)
//
//   // Test addMessages
//   const addMessagesResult = await ClientConversationMessageManager.addMessages(
//     conversationId,
//     messages,
//   )
//   console.log('Add Messages Result:', addMessagesResult)
//
//   // Test updateMessages
//
//   const changes = [
//     { key: processLast[0].messageId, changes: flattenObject(processLast[0]) },
//     {
//       key: processLast[1].messageId,
//       changes: flattenObject(processLast[1]),
//     },
//   ]
//   const updateMessagesResult =
//     await ClientConversationMessageManager.updateMessages(changes)
//   console.log('Update Messages Result:', updateMessagesResult)
//
//   // 测试 getMessages
//   const retrievedMessages = await ClientConversationMessageManager.getMessages(
//     conversationId,
//   )
//   console.log('Retrieved Messages:', retrievedMessages)
//   retrievedMessages.forEach((a) => {
//     console.log(
//       'Retrieved Message isEqual:',
//       isEqual(
//         a,
//         processLast.find((b) => b.messageId === a.messageId),
//       ),
//     )
//   })
//   // Test deleteMessages
//   const deleteMessagesResult =
//     await ClientConversationMessageManager.deleteMessages(
//       retrievedMessages.map((message) => message.messageId),
//     )
//   console.log('Delete Messages Result:', deleteMessagesResult)
//
//   // 测试 getMessages
//   const retrievedMessages2 = await ClientConversationMessageManager.getMessages(
//     conversationId,
//   )
//   console.log('Retrieved Messages:', retrievedMessages2)
// }
