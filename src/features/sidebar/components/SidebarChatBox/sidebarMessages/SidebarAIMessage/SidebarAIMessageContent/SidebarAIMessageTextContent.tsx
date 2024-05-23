import React, { FC, useMemo } from 'react'

import CustomMarkdown from '@/components/CustomMarkdown'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'

const SidebarAIMessageTextContent: FC<{
  AIMessage: IAIResponseMessage
}> = (props) => {
  const { AIMessage } = props
  const { isDarkMode } = useCustomTheme()
  const currentContentValue = useMemo(() => {
    let messageValue = AIMessage.text
    if (AIMessage.originalMessage?.content?.text) {
      messageValue =
        textHandler(AIMessage.originalMessage.content.text, {
          noResponseTag: true,
          noSummaryTag: true,
        }) || AIMessage.text
    }
    messageValue = messageValue.replace(/^\s+/, '')
    return messageValue
  }, [AIMessage])
  return (
    <div className={`markdown-body ${isDarkMode ? 'markdown-body-dark' : ''}`}>
      <CustomMarkdown>{currentContentValue}</CustomMarkdown>
    </div>
  )
}
export default SidebarAIMessageTextContent
