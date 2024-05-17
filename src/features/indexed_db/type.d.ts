import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'

type IndexedDBChainType =
  | {
      type: 'get'
      prop: string
    }
  | {
      type: 'apply'
      args: any[]
    }

export type IndexedDBNameType = 'conversations'

export type IndexedDBListener = {
  (
    type: 'IndexedDBQueryChain',
    data: {
      indexedDBName: IndexedDBNameType
      chain: IndexedDBChainType[]
    },
  ): Promise<any>
  (
    type: 'ConversationDBRemoveConversation',
    data: {
      conversationId: string
      softDelete: boolean
    },
  ): Promise<boolean>
  (
    type: 'ConversationDBMigrateConversationV3',
    data: {
      conversationId?: string
      conversation?: IConversation
    },
  ): Promise<IConversation | undefined>
}
