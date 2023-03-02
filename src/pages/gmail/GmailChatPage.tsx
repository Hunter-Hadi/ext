import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { Button, Stack } from '@mui/material'
import React, { useEffect, useMemo } from 'react'
import { GmailChatBox, useCurrentMessageView } from '@/features/gmail'
import AppLoadingLayout from '@/components/LoadingLayout'
import { ChatGPTLoaderWrapper } from '@/features/chatgpt'
import { ShortCutsEngine, useShortCutsParameters } from '@/features/shortcuts'
import { v4 } from 'uuid'
const shortCutsEngine = new ShortCutsEngine()

const GmailChatPage = () => {
  const getParams = useShortCutsParameters()
  const { loading, messageViewText, currentMessageId } = useCurrentMessageView()
  const defaultInputValue = useMemo(() => {
    if (!currentMessageId) {
      return null
    }
    console.log('currentMessageId', currentMessageId)
    if (currentMessageId?.startsWith('newDraft_')) {
      return 'Write an email to...'
    } else {
      if (messageViewText.trim()) {
        return `Write a reply to this email: \n\n${messageViewText}`
      } else {
        return ``
      }
    }
  }, [currentMessageId, messageViewText])
  const {
    sendQuestion,
    conversation,
    messages,
    reGenerate,
    retryMessage,
    inputValue,
    setInputValue,
    stopGenerateMessage,
  } = useMessageWithChatGPT(defaultInputValue || '')
  useEffect(() => {
    setInputValue(defaultInputValue || '')
  }, [defaultInputValue, currentMessageId])
  useEffect(() => {
    shortCutsEngine.setActions([
      {
        id: v4(),
        type: 'prompt',
        parameters: {
          template: `Here is the incomming email:\n"""\n{{GMAIL_MESSAGE_CONTEXT}}\n""""\ncan you list 4 reply outlines for replying this email (each within 10 words)?`,
        },
      },
      {
        id: v4(),
        type: 'prompt',
        parameters: {
          template: `can you list 4 reply outlines for replying this email (each within 10 words)?`,
        },
      },
      {
        id: v4(),
        type: 'prompt',
        parameters: {
          template: `Given the reply outline to be "{{INPUT_VALUE}}" what facts or decisions do you need to properly draft a reply email? please give a list less than 4 items (each item is within 4 words), and give me example information pre-filled for each item in the same line seperated by colon`,
        },
      },
      {
        id: v4(),
        type: 'prompt',
        parameters: {
          template: `Now, reply to the incomming email, Given the reply outline to be "Sure, sending image. Use this link instead [insert link].", and the following facts and decision:\n{{INPUT_VALUE}}`,
        },
      },
    ])
  }, [])
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTLoaderWrapper />
      <Button
        onClick={async () => {
          await shortCutsEngine.run(getParams().parameters)
        }}
        variant={'contained'}
      >
        run PromptCuts
      </Button>
      <AppLoadingLayout loading={loading || defaultInputValue === null}>
        <GmailChatBox
          insertAble
          editAble={false}
          defaultValue={inputValue}
          onSendMessage={sendQuestion}
          writingMessage={conversation.writingMessage}
          messages={messages}
          loading={conversation.loading}
          title={'Chat Draft'}
          onRetry={retryMessage}
          onReGenerate={reGenerate}
          onStopGenerate={stopGenerateMessage}
        />
      </AppLoadingLayout>
    </Stack>
  )
}
export default GmailChatPage
