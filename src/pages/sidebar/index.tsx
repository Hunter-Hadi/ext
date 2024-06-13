import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useRef } from 'react'

import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import UnLoginOverlay from '@/features/auth/components/UnLoginOverlay'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { useInitMixPanel } from '@/features/mixpanel/utils'
import SidebarPromotionDialog from '@/features/sidebar/components/SidebarChatBox/SidebarPromotionDialog'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import SidebarSurveyDialog from '@/features/sidebar/components/SidebarChatBox/SidebarSurveyDialog'
import SidebarTour from '@/features/sidebar/components/SidebarChatBox/SidebarTour'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useInitWebPageSidebar from '@/features/sidebar/hooks/useInitWebPageSidebar'
import useSidebarDropEvent from '@/features/sidebar/hooks/useSidebarDropEvent'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import FunnelSurveyDialog from '@/features/survey/components/FunnelSurveyDialog'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }
const SidebarChatPanel = React.lazy(
  () => import('@/features/sidebar/components/SidebarChatPanel'),
)

/**
 * 一些自定义/监听需要在没渲染前就初始化的操作
 * @constructor
 */
const WebPageSidebarInit: FC = () => {
  useInitWebPageSidebar()
  return <></>
}
const ImmersiveChatPageSidebarInit: FC = () => {
  const { createConversation, currentConversationIdRef } =
    useClientConversation()
  const { currentSidebarConversationType } = useSidebarSettings()
  const isCreatingRef = useRef(false)
  useEffect(() => {
    if (
      currentSidebarConversationType &&
      !currentConversationIdRef.current &&
      !isCreatingRef.current
    ) {
      isCreatingRef.current = true
      createConversation(currentSidebarConversationType)
        .then()
        .catch()
        .finally(() => {
          isCreatingRef.current = false
        })
    }
  }, [currentSidebarConversationType])
  return <></>
}
const SidebarPageInit: FC = () => {
  useInitMixPanel()
  useInitWebPageMessageChannel()
  return <></>
}

const SidebarDragWrapper: FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useSidebarDropEvent()
  return (
    <Stack
      component={'div'}
      position={'relative'}
      flex={1}
      width={0}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop as any}
    >
      {children}
    </Stack>
  )
}

const SidebarPage: FC<{
  open?: boolean
}> = (props) => {
  const { open = false } = props
  const isImmersiveChatRef = useRef(isMaxAIImmersiveChatPage())
  return (
    <>
      <SidebarPageInit />
      {!isImmersiveChatRef.current && <WebPageSidebarInit />}
      {isImmersiveChatRef.current && <ImmersiveChatPageSidebarInit />}
      {open && (
        <Stack
          flex={1}
          height={0}
          position={'relative'}
          direction='row'
          id={'MaxAISidebarContainer'}
        >
          <SidebarTour />
          <SidebarPromotionDialog />
          <SidebarSurveyDialog />
          <FunnelSurveyDialog sceneType='SURVEY_CANCEL_COMPLETED' />
          <SidebarDragWrapper>
            {!isImmersiveChatRef.current && <ChatBoxHeader />}
            <AppSuspenseLoadingLayout>
              <SidebarChatPanel />
            </AppSuspenseLoadingLayout>
          </SidebarDragWrapper>
          {!isImmersiveChatRef.current && <SidebarNav />}
          <UnLoginOverlay />
        </Stack>
      )}
      {/*// 为了在Sidebar没有渲染的时候能执行shortcuts*/}
      {/* 在 click MaxAIScreenshotMiniButton 时 通过找到下面这个隐藏的 SidebarScreenshotButton 组件触发 click 事件，来实现截图  */}
      <SidebarScreenshotButton
        enabled={!open}
        sx={{
          position: 'absolute',
          visibility: 'hidden',
          width: 0,
          height: 0,
          opacity: 0,
        }}
      />
    </>
  )
}
export default SidebarPage
