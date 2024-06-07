import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export interface IConversationLocalStorage {
  conversationId: string
  // 最后运行的shortcuts
  lastRunActions?: ISetActionsType
  // 最后运行的shortcuts的params, 在regenerate/retry时用到
  lastRunActionsParams?: IShortCutsParameter[]
  // 最后运行的shortcuts的messageID, 在regenerate/retry时用到
  lastRunActionsMessageId?: string
}
