import React, { FC } from 'react'

import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message';
import SidebarAIMessageImageContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageImageContent'
import SidebarAIMessageTextContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageTextContent'

const SidebarAIMessageContent: FC<{
  AIMessage: IAIResponseMessage
}> = (props) => {
  const { AIMessage } = props
  const contentType = AIMessage?.originalMessage?.content?.contentType || 'text'
  if (contentType === 'image') {
    return <SidebarAIMessageImageContent AIMessage={AIMessage} />
  }
  return <SidebarAIMessageTextContent AIMessage={AIMessage} />
}
export default SidebarAIMessageContent
