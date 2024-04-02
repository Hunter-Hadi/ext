import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { IChatConversation } from '@/background/src/chatConversations'
import { resetChromeExtensionOnBoardingData } from '@/background/utils'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  ChatGPTClientState,
  ClientConversationMapState,
} from '@/features/chatgpt/store'
import DevShortcutsLog from '@/features/sidebar/components/SidebarTabs/DevShortcutsLog'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { SidebarSummaryConversationIdState } from '@/features/sidebar/store'

const DevConsole: FC = () => {
  const {
    currentSidebarAIProvider,
    currentSidebarConversationId,
    currentSidebarConversationType,
    sidebarSettings,
  } = useSidebarSettings()
  const sidebarSummaryConversationId = useRecoilValue(
    SidebarSummaryConversationIdState,
  )
  const clientConversationMap = useRecoilValue(ClientConversationMapState)
  const {
    clientWritingMessage,
    currentConversationId,
    chatStatus,
    clientConversation,
  } = useClientConversation()
  const { currentAIProviderModel } = useAIProviderModels()
  const [chatGPTClientState] = useRecoilState(ChatGPTClientState)
  const [showDevContent, setShowDevContent] = useState(true)
  const renderConversation = useMemo(() => {
    const clonedConversation: any = cloneDeep(
      clientConversation,
    ) as IChatConversation
    if (clonedConversation) {
      clonedConversation.messages = []
    }
    return clonedConversation
  }, [clientConversation])

  return (
    <Stack
      sx={{
        position: 'absolute',
        top: '0',
        width: showDevContent ? '500px' : '32px',
        height: showDevContent ? '500px' : '32px',
        overflowX: 'auto',
        overflowY: 'auto',
        zIndex: 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        right: '100%',
        border: '1px solid',
        borderColor: 'customColor.borderColor',
        borderRadius: '4px',
      }}
    >
      {showDevContent ? (
        <Button
          variant={'contained'}
          sx={{
            zIndex: 11,
            width: 32,
            height: 32,
            minWidth: 'unset',
            position: 'absolute',
            top: 0,
            right: 0,
            p: 1,
          }}
          onClick={() => setShowDevContent(!showDevContent)}
        >
          <UnfoldLessIcon />
        </Button>
      ) : (
        <Button
          variant={'contained'}
          sx={{
            zIndex: 11,
            width: 32,
            height: 32,
            minWidth: 'unset',
            position: 'absolute',
            top: 0,
            right: 0,
            p: 1,
          }}
          onClick={() => setShowDevContent(true)}
        >
          <UnfoldMoreIcon />
        </Button>
      )}
      <Stack
        width={'100%'}
        flexDirection={'row'}
        sx={{
          visibility: showDevContent ? 'visible' : 'hidden',
        }}
      >
        <Stack
          sx={{
            width: 0,
            flex: 1,
            overflow: 'auto',
            '& > pre, & > p': {
              p: 0,
              m: 0,
              fontSize: '12px',
            },
          }}
        >
          <Stack direction={'row'} spacing={1}>
            <Button
              onClick={async (event) => {
                await resetChromeExtensionOnBoardingData()
              }}
            >
              Reset OnBoarding
            </Button>
          </Stack>
          <p>authStatus: {chatGPTClientState.status}</p>
          <p>loading: {clientWritingMessage.loading ? 'loading' : 'done'}</p>
          <p>
            currentSidebarConversationType: {currentSidebarConversationType}
          </p>
          <p>
            currentSidebarAIProvider: {currentSidebarAIProvider} - [
            {clientConversation?.messages.length}]
          </p>
          <p>currentSidebarAIMode: {currentAIProviderModel}</p>
          <p>currentSidebarConversationId: {currentSidebarConversationId}</p>
          <p>Chat: {sidebarSettings?.chat?.conversationId}</p>
          <p>Summary: {sidebarSummaryConversationId}</p>
          <p>Search: {sidebarSettings?.search?.conversationId}</p>
          <p>Art: {sidebarSettings?.art?.conversationId}</p>
          <Divider></Divider>
          <pre>{JSON.stringify(renderConversation, null, 2)}</pre>
          {/*<pre>{JSON.stringify(sidebarSettings, null, 2)}</pre>*/}
          {/*<pre>*/}
          {/*  {JSON.stringify(appLocalStorage.thirdProviderSettings, null, 2)}*/}
          {/*</pre>*/}
        </Stack>
        <Stack width={200} flexShrink={0}>
          <pre>{Object.keys(clientConversationMap).join('\n')}</pre>
          <span>
            {chatStatus}:{currentConversationId}
          </span>
          <DevShortcutsLog />
        </Stack>
      </Stack>
    </Stack>
  )
}
export default DevConsole
