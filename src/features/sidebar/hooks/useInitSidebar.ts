import { useRecoilState, useRecoilValue } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { useEffect, useRef } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import { AppSettingsState } from '@/store'
import usePageUrlChange from '@/hooks/usePageUrlChange'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

const useInitSidebar = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const { createPageSummary } = usePageSummary()
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const { pageUrl, startListen } = usePageUrlChange()
  const { changeConversation } = useClientConversation()
  const sidebarTypeRef = useRef(sidebarSettings.type)
  useEffect(() => {
    if (sidebarSettings.type === 'Summary') {
      createPageSummary()
        .then()
        .catch()
        .finally(() => {
          // 切换到summary的时候，需要开始监听url变化
          startListen()
        })
    } else if (
      sidebarSettings.type === 'Chat' &&
      sidebarSettings.chatConversationId
    ) {
      changeConversation(sidebarSettings.chatConversationId)
    }
    sidebarTypeRef.current = sidebarSettings.type
  }, [sidebarSettings.type])

  useEffect(() => {
    if (!sidebarSettings.summaryConversationId) {
      setTimeout(() => {
        if (sidebarTypeRef.current === 'Summary') {
          createPageSummary().then().catch()
        }
      }, 100)
    } else if (pageUrl) {
      console.log('新版Conversation pageUrl更新', pageUrl)
      createPageSummary().then().catch()
    }
  }, [sidebarSettings.summaryConversationId, pageUrl])
  useEffect(() => {
    if (appSettings.chatTypeConversationId && sidebarSettings.type === 'Chat') {
      setSidebarSettings((prevState) => {
        return {
          ...prevState,
          chatConversationId: appSettings.chatTypeConversationId,
        }
      })
    }
  }, [appSettings.chatTypeConversationId, sidebarSettings.type])
}

export default useInitSidebar
