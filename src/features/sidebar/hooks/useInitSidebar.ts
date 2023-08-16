import { useRecoilState, useRecoilValue } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { AppSettingsState } from '@/store'
import { useEffect } from 'react'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'

const useInitSidebar = () => {
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const appSettings = useRecoilValue(AppSettingsState)
  useEffect(() => {
    getPageSummaryConversationId().then((conversationId) => {
      setSidebarSettings((prevState) => {
        return {
          ...prevState,
          summaryConversationId: conversationId,
          chatConversationId: appSettings.conversationId,
        }
      })
    })
  }, [sidebarSettings.type, appSettings.conversationId])
}
export default useInitSidebar
