import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import SidebarPromotionDialog from '@/features/sidebar/components/SidebarChatBox/SidebarPromotionDialog'
import SidebarTour from '@/features/sidebar/components/SidebarChatBox/SidebarTour'
import SidebarChatPanel from '@/features/sidebar/components/SidebarChatPanel'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import useSidebarDropEvent from '@/features/sidebar/hooks/useSidebarDropEvent'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }
/**
 * 一些自定义/监听需要在没渲染前就初始化的操作
 * @constructor
 */
export const SidebarPageInit: FC = () => {
  useInitSidebar()
  useInitWebPageMessageChannel()
  return <></>
}
const SidebarPage = () => {
  const { handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useSidebarDropEvent()
  return (
    <Stack
      flex={1}
      height={0}
      position={'relative'}
      direction="row"
      id={'MaxAISidebarContainer'}
    >
      <SidebarTour />
      <SidebarPromotionDialog />
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
        {!isMaxAIImmersiveChatPage() && <ChatBoxHeader />}
        <SidebarChatPanel />
      </Stack>
      {!isMaxAIImmersiveChatPage() && <SidebarNav />}
    </Stack>
  )
}
export default SidebarPage
