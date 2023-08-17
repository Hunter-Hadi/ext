import { useRecoilState, useRecoilValue } from 'recoil'
import {
  SidebarConversationIdSelector,
  SidebarSettingsState,
} from '@/features/sidebar'
import { AppSettingsState } from '@/store'
import { useEffect } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'

const useInitSidebar = () => {
  const { createPageSummary } = usePageSummary()
  const sidebarConversationId = useRecoilValue(SidebarConversationIdSelector)
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const appSettings = useRecoilValue(AppSettingsState)
  useEffect(() => {
    setSidebarSettings((prevState) => {
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

  useEffect(() => {
    if (sidebarConversationId) {
      const port = new ContentScriptConnectionV2()
      // 复原background conversation
      port
        .postMessage({
          event: 'Client_changeConversation',
          data: {
            conversationId: sidebarConversationId,
          },
        })
        .then()
    }
  }, [sidebarConversationId])
}
export default useInitSidebar
