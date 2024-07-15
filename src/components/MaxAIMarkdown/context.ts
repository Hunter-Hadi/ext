import React from 'react'

import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'

export interface IMaxAIMarkdownContext {
  message?: IChatMessage
}

export const MaxAIMarkdownContext = React.createContext<IMaxAIMarkdownContext>({
  message: undefined,
})
