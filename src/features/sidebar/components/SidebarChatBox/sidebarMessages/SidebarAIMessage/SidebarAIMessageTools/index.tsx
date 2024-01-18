import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import SidebarAIMessageDownloadButton from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageTools/SidebarAIMessageDownloadImageButton'
import { formatAIMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

const SidebarAIMessageTools: FC<{
  useChatGPTAble?: boolean
  message: IAIResponseMessage
}> = (props) => {
  const { message } = props
  const messageContentType =
    message.originalMessage?.content?.contentType || 'text'
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
  const memoCopyText = useMemo(() => {
    return formatAIMessageContent(message)
  }, [message])
  const downloadUrl = useMemo(() => {
    try {
      debugger
      if (
        message.originalMessage?.content?.text &&
        message.originalMessage.content.contentType === 'image'
      ) {
        const images = JSON.parse(message.originalMessage.content.text)
        debugger
        return images?.[0]?.url || ''
      }
    } catch (e) {
      debugger
      return ''
    }
  }, [message])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      ref={gmailChatBoxAiToolsRef}
    >
      {messageContentType === 'image' && downloadUrl && (
        <SidebarAIMessageDownloadButton downloadUrl={downloadUrl} />
      )}
      {messageContentType === 'text' && <SidebarCopyButton message={message} />}
      {messageContentType === 'text' && (
        <FloatingInputButton
          className={'max-ai__actions__button--use-max-ai'}
          iconButton
          onBeforeShowContextMenu={() => {
            return {
              template: memoCopyText,
              target: gmailChatBoxAiToolsRef.current
                ?.parentElement as HTMLElement,
            }
          }}
        />
      )}
    </Stack>
  )
}
export default SidebarAIMessageTools
