import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import SidebarPromotionDialog from '@/features/sidebar/components/SidebarChatBox/SidebarPromotionDialog'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import SidebarTour from '@/features/sidebar/components/SidebarChatBox/SidebarTour'
import SidebarContextProvider from '@/features/sidebar/components/SidebarContextProvider'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import useSidebarDropEvent from '@/features/sidebar/hooks/useSidebarDropEvent'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'

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
const SidebarPageInit: FC = () => {
  useInitSidebar()
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
  isImmersiveChat?: boolean
  open?: boolean
  disableContextProvider?: boolean
}> = (props) => {
  const { isImmersiveChat, open = false, disableContextProvider } = props

  const ContextProvider = disableContextProvider
    ? React.Fragment
    : SidebarContextProvider

  return (
    <ContextProvider isImmersiveChat={isImmersiveChat}>
      <SidebarPageInit />
      {open && (
        <Stack
          flex={1}
          height={0}
          position={'relative'}
          direction="row"
          id={'MaxAISidebarContainer'}
        >
          <SidebarTour />
          <SidebarPromotionDialog />
          <SidebarDragWrapper>
            {!isImmersiveChat && <ChatBoxHeader />}
            <AppSuspenseLoadingLayout>
              <SidebarChatPanel />
            </AppSuspenseLoadingLayout>
          </SidebarDragWrapper>
          {!isImmersiveChat && <SidebarNav />}
          {!open && (
            <>
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
              {/*<ActionSetVariablesModal modelKey={'Sidebar'} />*/}
            </>
          )}
        </Stack>
      )}
    </ContextProvider>
  )
}
export default SidebarPage
