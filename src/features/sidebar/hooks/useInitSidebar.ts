import { useRecoilState, useRecoilValue } from 'recoil'
import { SidebarChatState } from '@/features/sidebar'
import { AppSettingsState } from '@/store'
import { useEffect } from 'react'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'

const useInitSidebar = () => {
  const [sidebarChat, setSidebarChat] = useRecoilState(SidebarChatState)
  const appSettings = useRecoilValue(AppSettingsState)
  useEffect(() => {
    getPageSummaryConversationId().then((conversationId) => {
      setSidebarChat((prevState) => {
        return {
          ...prevState,
          summaryConversationId: conversationId,
          chatConversationId: appSettings.conversationId,
        }
      })
    })
  }, [sidebarChat.type, appSettings.conversationId])
}
export default useInitSidebar
