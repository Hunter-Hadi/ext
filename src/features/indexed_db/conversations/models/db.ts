import Dexie from 'dexie'

import { CURRENT_CONVERSATION_VERSION } from '@/features/indexed_db/conversations/constant'
import type { IIndexDBAttachment } from '@/features/indexed_db/conversations/models/Attachement'
import type { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import type { IConversationLocalStorage } from '@/features/indexed_db/conversations/models/ConversationAction'
import type { IChatMessage } from '@/features/indexed_db/conversations/models/Message'

export class ConversationDB extends Dexie {
  conversations: Dexie.Table<IConversation, string>
  messages: Dexie.Table<IChatMessage, string>
  attachments: Dexie.Table<IIndexDBAttachment, string>
  conversationLocalStorage: Dexie.Table<IConversationLocalStorage, string>

  constructor() {
    super('ConversationDB')
    this.version(CURRENT_CONVERSATION_VERSION).stores({
      conversations:
        'id,lastMessageId,authorId,name,created_at,updated_at,type,domain',
      messages:
        'messageId,conversationId,parentMessageId,created_at,updated_at,type,[conversationId+created_at+messageId]',
      attachments: 'id,messageId,created_at,updated_at',
      conversationLocalStorage: 'conversationId',
    })
    this.conversations = this.table('conversations')
    this.messages = this.table('messages')
    this.attachments = this.table('attachments')
    this.conversationLocalStorage = this.table('conversationLocalStorage')
  }
}
