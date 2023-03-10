import { Button, Stack, TextareaAutosize } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GmailChatBox,
  InboxEditState,
  useCurrentMessageView,
} from '@/features/gmail'
import { ChatGPTLoaderWrapper } from '@/features/chatgpt'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts'
import { getEzMailChromeExtensionSettings, useDebounceValue } from '@/utils'
import { useRecoilValue } from 'recoil'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'

const GmailChatPage = () => {
  const { currentMessageId } = useCurrentMessageView()
  const { step } = useRecoilValue(InboxEditState)
  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify([
      {
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template:
            'Here is the incoming email:\n"""\n{{GMAIL_MESSAGE_CONTEXT}}\n""""\nCan you list 4 reply outlines for replying this email (each within 10 words)?',
        },
      },
      {
        type: 'INSERT_USER_INPUT',
      },
      {
        type: 'ASK_CHATGPT',
        parameters: {
          template: '{{LAST_ACTION_OUTPUT}}',
        },
      },
      {
        type: 'GMAIL_INSERT_REPLY_BOX',
        parameters: {
          template: 'here is action⬇️:\n{{LAST_ACTION_OUTPUT}}',
        },
      },
    ] as ISetActionsType),
  )
  const {
    runShortCuts,
    loading: shortCutsLoading,
    sendQuestion,
    conversation,
    messages,
    reGenerate,
    retryMessage,
    inputValue,
    setShortCuts,
    stopGenerateMessage,
  } = useShortCutsWithMessageChat('')
  const executeShortCuts = useCallback(async () => {
    const { gmailToolBarContextMenu } = await getEzMailChromeExtensionSettings()
    const ctaButtonAction =
      gmailToolBarContextMenu?.[0] || defaultGmailToolbarContextMenuJson[0]
    if (ctaButtonAction && ctaButtonAction?.data?.actions) {
      setShortCuts(ctaButtonAction.data.actions)
      await runShortCuts()
    }
  }, [setShortCuts, runShortCuts])
  const prefExecuteShortCuts = useRef(executeShortCuts)
  const prevIdRef = useRef<string | undefined>()
  useEffect(() => {
    prefExecuteShortCuts.current = executeShortCuts
  }, [executeShortCuts])
  const debounceCurrentMessageId = useDebounceValue(currentMessageId, 200)
  const memoizedDeps = useMemo(() => {
    const deps = [prefExecuteShortCuts.current, debounceCurrentMessageId]
    prevIdRef.current = debounceCurrentMessageId
    return deps
  }, [debounceCurrentMessageId, step])
  useEffect(() => {
    if (debounceCurrentMessageId) {
      console.log('init default input value run!')
      executeShortCuts()
    }
  }, memoizedDeps)

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
            setShortCuts(JSON.parse(inputJson))
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
    </Stack>
  )
}
export default GmailChatPage
