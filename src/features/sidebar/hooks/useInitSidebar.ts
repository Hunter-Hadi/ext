import { useRecoilState, useRecoilValue } from 'recoil'
import {
  SidebarConversationIdSelector,
  SidebarSettingsState,
} from '@/features/sidebar'
import { AppSettingsState } from '@/store'
import { useEffect } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import useEffectOnce from '@/hooks/useEffectOnce'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'

const useInitSidebar = () => {
  const { initPageSummaryConversationId, createPageSummary } = usePageSummary()
  const sidebarConversationId = useRecoilValue(SidebarConversationIdSelector)
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const appSettings = useRecoilValue(AppSettingsState)
  useEffect(() => {
    setSidebarSettings((prevState) => {
      return {
        ...prevState,
        chatConversationId: appSettings.conversationId,
      }
    })
  }, [sidebarSettings.type, appSettings.conversationId])
  useEffect(() => {
    if (sidebarSettings.type === 'Summary') {
      getPageSummaryConversationId().then((conversationId) => {
        // 需要开始创建页面摘要
        if (!conversationId) {
          createPageSummary().then().catch()
        }
      })
    }
  }, [sidebarSettings.type])
  useEffectOnce(() => {
    initPageSummaryConversationId().then((conversationId) => {
      setSidebarSettings((prevState) => {
        return {
          ...prevState,
          summaryConversationId: conversationId,
        }
      })
    })
  })
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
