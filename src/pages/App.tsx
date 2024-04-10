// init i18n
import '@/i18n'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Resizable } from 're-resizable'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'

import { ConversationStatusType } from '@/background/provider/chat'
import Announcement from '@/components/Announcement'
import AppInit from '@/components/AppInit'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import BrowserVersionDetector from '@/components/BrowserVersionDetector'
import { ChatPanelContextValue } from '@/features/chatgpt/store/ChatPanelContext'
import { ChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import { MAXAI_SIDEBAR_ID } from '@/features/common/constants'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isShowChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import useChatBoxWidth from '@/hooks/useChatBoxWidth'
import { SidebarPageInit } from '@/pages/sidebar'
import SidebarTopBar from '@/pages/sidebarLayouts/SidebarTopBar'
import { AppState } from '@/store'
import { getEnv } from '@/utils/AppEnv'

const SidebarPage = React.lazy(() => import('@/pages/sidebar'))
const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const { visibleWidth, maxWidth, minWidth, setLocalWidth, resizeEnable } =
    useChatBoxWidth()
  const [appState, setAppState] = useRecoilState(AppState)
  useEffect(() => {
    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mu) => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return
        setAppState((prev) => {
          return {
            ...prev,
            env: getEnv(),
            open:
              (mu.target as HTMLElement)?.classList?.contains('open') || false,
          }
        })
      })
    })
    const rootEl = document.getElementById(MAXAI_SIDEBAR_ID)
    if (rootEl) {
      attrObserver.observe(rootEl, {
        attributes: true,
        childList: false,
      })
    }
    return () => {
      attrObserver.disconnect()
    }
  }, [])
  useEffect(() => {
    if (appState.open) {
      setAppState((prev) => {
        return {
          ...prev,
          loadedAppSidebar: true,
        }
      })
    }
  }, [appState.open])
  useEffect(() => {
    if (!appState.loadedAppSidebar) {
      const timer = setInterval(() => {
        if (isShowChatBox()) {
          setAppState((prev) => {
            return {
              ...prev,
              loadedAppSidebar: true,
            }
          })
          clearInterval(timer)
        }
      }, 1000)
      return () => {
        clearInterval(timer)
      }
    }
    return () => {
      // do nothing
    }
  }, [appState.loadedAppSidebar])
  const {
    currentSidebarConversationId,
    createSidebarConversation,
    resetSidebarConversation,
  } = useSidebarSettings()
  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatusType>('success')
  const sidebarContextValue = useMemo<ChatPanelContextValue>(() => {
    return {
      conversationStatus,
      updateConversationStatus: (newStatus: ConversationStatusType) => {
        setConversationStatus(newStatus)
      },
      conversationId: currentSidebarConversationId,
      createConversation: createSidebarConversation,
      resetConversation: resetSidebarConversation,
    }
  }, [currentSidebarConversationId, conversationStatus])
  return (
    <>
      <Resizable
        size={{
          width: visibleWidth,
          height: '100%',
        }}
        enable={resizeEnable}
        maxWidth={maxWidth}
        minWidth={minWidth}
        onResizeStop={async (e, direction, ref, d) => {
          await setLocalWidth(visibleWidth + d.width)
        }}
      >
        <Box
          component={'div'}
          className={'use-chat-gpt-ai-app'}
          ref={appRef}
          sx={{
            // pointerEvents: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderLeft: '1px solid rgba(0, 0, 0, .1)',
            bgcolor: 'background.paper',
            // position: 'absolute',
            // right: 0,
            // width: '25%',
            div: {
              userSelect: 'none',
            },
          }}
        >
          <Stack
            height={'100%'}
            sx={{
              '& *': {
                // fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif!important',
              },
            }}
          >
            <AppInit />
            <Announcement />
            <SidebarTopBar />
            <BrowserVersionDetector>
              <AppSuspenseLoadingLayout>
                <ChatPanelContext.Provider value={sidebarContextValue}>
                  <Stack flex={1} height={0}>
                    <SidebarPageInit />
                    {appState.loadedAppSidebar && <SidebarPage />}
                    {/*// 为了在Sidebar没有渲染的时候能执行shortcuts*/}
                    {/* 在 click MaxAIScreenshotMiniButton 时 通过找到下面这个隐藏的 SidebarScreenshotButton 组件触发 click 事件，来实现截图  */}
                    <SidebarScreenshotButton
                      enabled={!appState.loadedAppSidebar}
                      sx={{
                        position: 'absolute',
                        visibility: 'hidden',
                        width: 0,
                        height: 0,
                        opacity: 0,
                      }}
                    />
                    {!appState.loadedAppSidebar && (
                      <>
                        <ActionSetVariablesModal modelKey={'Sidebar'} />
                      </>
                    )}
                  </Stack>
                </ChatPanelContext.Provider>
              </AppSuspenseLoadingLayout>
            </BrowserVersionDetector>
          </Stack>
        </Box>
      </Resizable>
    </>
  )
}

export default App
