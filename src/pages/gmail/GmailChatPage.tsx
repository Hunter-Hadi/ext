import { Button, Stack, TextareaAutosize } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { GmailChatBox, useCurrentMessageView } from '@/features/gmail'
import AppLoadingLayout from '@/components/LoadingLayout'
import { ChatGPTLoaderWrapper } from '@/features/chatgpt'
import { v4 } from 'uuid'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'

const GmailChatPage = () => {
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
  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify([
      {
        id: '6c10205e-bd17-44d1-bb65-963a39ebbf95',
        type: 'prompt',
        parameters: {
          template:
            'Here is the incoming email:\n"""\n{{GMAIL_MESSAGE_CONTEXT}}\n""""\nCan you list 4 reply outlines for replying this email (each within 10 words)?',
        },
      },
      {
        id: 'cf67ab00-f397-4e13-bcf3-a19825e62fcd',
        type: 'prompt',
        parameters: {
          template:
            'Here is the incoming email:\n"""\n{{GMAIL_MESSAGE_CONTEXT}}\n""""\nFrom now on, we will refer to this outline as [THE_CHOSEE_OUTLINE] in the future: "{{INPUT_VALUE}}". Now, tell me, what facts or decisions do you need to properly draft a reply email following [THE_CHOSEE_OUTLINE]? Give me a list no more than 4 items (each item is within 4 words), and give me example information pre-filled for each item in the same line seperated by colon',
        },
      },
      {
        id: 'ff54ebac-6323-4784-8f06-7803c680bd70',
        type: 'prompt',
        parameters: {
          template:
            'Here is the incoming email:\n"""\n{{GMAIL_MESSAGE_CONTEXT}}\n""""\nNow, reply to the incomming email following [THE_CHOSEE_OUTLINE], and the following facts and decision:\n{{INPUT_VALUE}}',
        },
        autoNext: true,
      },
      {
        id: v4(),
        type: 'prompt',
        parameters: {
          template: 'make it shortly',
        },
        autoNext: true,
      },
      {
        id: v4(),
        type: 'prompt',
        parameters: {
          template: 'make it longer',
        },
      },
    ]),
  )
  const {
    shortCutsEngineRef,
    runShortCuts,
    loading: shortCutsLoading,
    sendQuestion,
    conversation,
    messages,
    reGenerate,
    retryMessage,
    inputValue,
    setInputValue,
    stopGenerateMessage,
  } = useShortCutsWithMessageChat(defaultInputValue || '')
  useEffect(() => {
    setInputValue(defaultInputValue || '')
  }, [defaultInputValue, currentMessageId])
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTLoaderWrapper />
      <TextareaAutosize
        maxRows={1}
        onInput={(event) => setInputJson(event.currentTarget.value)}
        value={inputJson}
      />
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        <Button
          variant={'contained'}
          onClick={() => {
            shortCutsEngineRef.current?.reset()
            shortCutsEngineRef.current?.setActions(JSON.parse(inputJson))
          }}
        >
          Set Actions
        </Button>
        <Button
          disabled={shortCutsLoading}
          onClick={runShortCuts}
          variant={'contained'}
        >
          run PromptCuts
        </Button>
      </Stack>
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
