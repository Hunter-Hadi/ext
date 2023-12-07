import React, { FC, useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'

import { ChatGPTConversationState } from '@/features/sidebar/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import cloneDeep from 'lodash-es/cloneDeep'
import { IChatConversation } from '@/background/src/chatConversations'
import { resetChromeExtensionOnBoardingData } from '@/background/utils'
import { AppLocalStorageState } from '@/store'
import DevShortcutsLog from '@/features/sidebar/components/SidebarTabs/DevShortcutsLog'

const DevConsole: FC = () => {
  const {
    currentSidebarAIProvider,
    currentSidebarConversationId,
    currentSidebarConversationType,
    currentSidebarConversation,
    sidebarSettings,
  } = useSidebarSettings()
  const appLocalStorage = useRecoilValue(AppLocalStorageState)
  const chatGPTConversation = useRecoilValue(ChatGPTConversationState)
  const [chatGPTClientState] = useRecoilState(ChatGPTClientState)
  const [showDevContent, setShowDevContent] = useState(true)
  const renderConversation = useMemo(() => {
    const clonedConversation = cloneDeep(
      currentSidebarConversation,
    ) as IChatConversation
    if (clonedConversation) {
      clonedConversation.messages = []
    }
    return clonedConversation
  }, [currentSidebarConversation])

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
      <Stack width={'100%'} flexDirection={'row'}>
        <Stack width={200} flexShrink={0}>
          <DevShortcutsLog />
        </Stack>
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
          <p>loading: {chatGPTConversation.loading ? 'loading' : 'done'}</p>
          <p>
            currentSidebarConversationType: {currentSidebarConversationType}
          </p>
          <p>currentSidebarAIProvider: {currentSidebarAIProvider}</p>
          <p>currentSidebarConversationId: {currentSidebarConversationId}</p>
          <pre>{JSON.stringify(renderConversation, null, 2)}</pre>
          {/*<pre>{JSON.stringify(sidebarSettings, null, 2)}</pre>*/}
          {/*<pre>*/}
          {/*  {JSON.stringify(appLocalStorage.thirdProviderSettings, null, 2)}*/}
          {/*</pre>*/}
        </Stack>
      </Stack>
    </Stack>
  )
}
export default DevConsole
