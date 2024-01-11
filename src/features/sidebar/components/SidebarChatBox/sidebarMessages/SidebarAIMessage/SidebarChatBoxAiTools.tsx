import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import { formatAIMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

const SidebarChatBoxAiTools: FC<{
  useChatGPTAble?: boolean
  message: IAIResponseMessage
}> = (props) => {
  const { message } = props
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
  const memoCopyText = useMemo(() => {
    return formatAIMessageContent(message)
  }, [message])

  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      ref={gmailChatBoxAiToolsRef}
    >
      <SidebarCopyButton message={message} />
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
    </Stack>
  )
}
export default SidebarChatBoxAiTools
