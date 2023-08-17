import { useRecoilState, useRecoilValue } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { AppSettingsState } from '@/store'
import { useEffect } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'

const useInitSidebar = () => {
  const { createPageSummary } = usePageSummary()
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const appSettings = useRecoilValue(AppSettingsState)
  useEffect(() => {
    setSidebarSettings((prevState) => {
      if (prevState.type === 'Chat') {
        console.log(
          '新版Conversation 要切换的 appSettings id',
          appSettings.conversationId,
        )
      }
      return {
        ...prevState,
        summaryConversationId: getPageSummaryConversationId(),
        chatConversationId: appSettings.conversationId,
      }
    })
  }, [sidebarSettings.type, appSettings.conversationId])
  useEffect(() => {
    if (sidebarSettings.type === 'Summary') {
      createPageSummary().then().catch()
    }
  }, [sidebarSettings.type])
}
export default useInitSidebar
