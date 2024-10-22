import PanToolIcon from '@mui/icons-material/PanTool'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { atomFamily, useRecoilState, useRecoilValue } from 'recoil'

import { resetChromeExtensionOnBoardingData } from '@/background/utils'
import {
  getChromeExtensionLocalStorage,
  resetChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import DevShortcutsLog from '@/features/sidebar/components/SidebarTabs/DevShortcutsLog'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { SidebarSummaryConversationIdState } from '@/features/sidebar/store'
import { AppLocalStorageState } from '@/store'
const DevConsolePositionState = atomFamily<
  {
    x: number
    y: number
  },
  string
>({
  key: 'DevConsolePositionState',
  default: {
    x: 0,
    y: 0,
  },
})
const useDraggableDevConsole = (id: string) => {
  const [position, setPosition] = useRecoilState(DevConsolePositionState(id))
  const [isDragging, setIsDragging] = useState(false)

  const [startPosition, setStartPosition] = useState({
    x: 0,
    y: 0,
  })
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true)
    setStartPosition({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    })
  }
  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: event.clientX - startPosition.x,
        y: event.clientY - startPosition.y,
      })
    }
  }
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseDown])
  return {
    position,
    handleMouseDown,
    handleMouseUp,
  }
}
const DevConsole: FC<{
  isSidebar?: boolean
  sx?: SxProps
}> = (props) => {
  const [, setAppLocalStorage] = useRecoilState(AppLocalStorageState)
  const { isSidebar = false, sx } = props
  const { position, handleMouseDown, handleMouseUp } = useDraggableDevConsole(
    isSidebar ? 'sidebar' : 'floatingContextMenu',
  )
  const {
    currentSidebarAIProvider,
    currentSidebarConversationId,
    currentSidebarConversationType,
    sidebarSettings,
  } = useSidebarSettings()
  const sidebarSummaryConversationId = useRecoilValue(
    SidebarSummaryConversationIdState,
  )
  const {
    clientConversationMessages,
    clientWritingMessage,
    currentConversationId,
    conversationStatus,
    clientConversation,
  } = useClientConversation()
  const { currentAIProviderModel } = useAIProviderModels()
  const [showDevContent, setShowDevContent] = useState(true)
  const renderConversation = useMemo(() => {
    const clonedConversation: any = cloneDeep(
      clientConversation,
    ) as IConversation
    return clonedConversation
  }, [clientConversation])
  return (
    <Stack
      component={'div'}
      sx={
        isSidebar
          ? {
              position: 'absolute',
              top: position.y,
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
              ...sx,
            }
          : {
              top: position.y,
              left: position.x,
              position: 'fixed',
              width: showDevContent ? '500px' : '32px',
              height: showDevContent ? '500px' : '32px',
              overflowX: 'auto',
              overflowY: 'auto',
              zIndex: -1,
              bgcolor: 'background.paper',
              color: 'text.primary',
              right: '100%',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              borderRadius: '4px',
              ...sx,
            }
      }
    >
      {!isSidebar && (
        <Button
          component={'button'}
          sx={{
            zIndex: 11,
            width: 32,
            height: 32,
            minWidth: 'unset',
            position: 'absolute',
            top: 0,
            right: 40,
            p: 1,
          }}
          variant={'contained'}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <PanToolIcon />
        </Button>
      )}
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
        {isSidebar ? (
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
              <Button
                onClick={async (event) => {
                  await resetChromeExtensionLocalStorage()
                  setAppLocalStorage(await getChromeExtensionLocalStorage())
                }}
              >
                Reset Default
              </Button>
            </Stack>
            <p>authStatus: {conversationStatus}</p>
            <p>loading: {clientWritingMessage.loading ? 'loading' : 'done'}</p>
            <p>
              currentSidebarConversationType: {currentSidebarConversationType}
            </p>
            <p>
              currentSidebarAIProvider: {currentSidebarAIProvider} - [
              {clientConversationMessages.length}]
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
        ) : (
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
            <p>
              {conversationStatus}:{currentConversationId}
            </p>
            <p>loading: {clientWritingMessage.loading ? 'loading' : 'done'}</p>
            <Divider></Divider>
            <pre>{JSON.stringify(renderConversation, null, 2)}</pre>
          </Stack>
        )}
        <Stack width={200} flexShrink={0}>
          <DevShortcutsLog isSidebar={isSidebar} />
        </Stack>
      </Stack>
    </Stack>
  )
}
export default DevConsole
