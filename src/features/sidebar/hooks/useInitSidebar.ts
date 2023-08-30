import { useRecoilState, useRecoilValue } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { useEffect, useRef } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import { AppSettingsState } from '@/store'
import usePageUrlChange from '@/hooks/usePageUrlChange'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useAIProvider from '@/features/chatgpt/hooks/useAIProvider'
import { useFocus } from '@/hooks/useFocus'

const useInitSidebar = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const { createPageSummary } = usePageSummary()
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const { pageUrl, startListen } = usePageUrlChange()
  const { changeConversation } = useClientConversation()
  const sidebarSettingsRef = useRef(sidebarSettings)
  const { currentAIProviderRef, updateChatGPTProvider } = useAIProvider()
  const lastChatTypeAIProviderRef = useRef(currentAIProviderRef.current)
  useEffect(() => {
    sidebarSettingsRef.current = sidebarSettings
  }, [sidebarSettings])
  useEffect(() => {
    if (sidebarSettings.type === 'Summary') {
      lastChatTypeAIProviderRef.current = currentAIProviderRef.current
      createPageSummary()
        .then()
        .catch()
        .finally(() => {
          // 切换到summary的时候，需要开始监听url变化
          startListen()
        })
    } else if (
      sidebarSettings.type === 'Chat' &&
      sidebarSettingsRef.current?.chatConversationId
    ) {
      changeConversation(sidebarSettingsRef.current.chatConversationId).then(
        (success) => {
          if (!success && lastChatTypeAIProviderRef.current) {
            console.log(lastChatTypeAIProviderRef.current)
            updateChatGPTProvider(lastChatTypeAIProviderRef.current)
          } else {
            lastChatTypeAIProviderRef.current = currentAIProviderRef.current
          }
        },
      )
    }
  }, [sidebarSettings.type])
  useEffect(() => {
    if (!sidebarSettings.summaryConversationId) {
      setTimeout(() => {
        if (sidebarSettingsRef.current.type === 'Summary') {
          createPageSummary().then().catch()
        }
      }, 500)
    }
  }, [sidebarSettings.summaryConversationId])
  useEffect(() => {
    console.log('usePageUrlChange, pageUrl', pageUrl)
    if (sidebarSettingsRef.current.type === 'Summary') {
      if (pageUrl) {
        console.log('新版Conversation pageUrl更新', pageUrl)
        // createPageSummary().then().catch()
        // NOTE: 太耗费tokens了，所以切到chat就行
        setSidebarSettings((prevState) => {
          return {
            ...prevState,
            type: 'Chat',
          }
        })
      }
    }
  }, [pageUrl])
  useEffect(() => {
    if (
      appSettings.chatTypeConversationId &&
      sidebarSettingsRef.current.type === 'Chat'
    ) {
      console.log(
        '新版Conversation chatTypeConversationId更新',
        appSettings.chatTypeConversationId,
      )
      setSidebarSettings((prevState) => {
        return {
          ...prevState,
          chatConversationId: appSettings.chatTypeConversationId,
        }
      })
    }
  }, [appSettings.chatTypeConversationId])
  useFocus(() => {
    if (
      sidebarSettingsRef.current.type === 'Chat' &&
      sidebarSettingsRef.current.chatConversationId
    ) {
      changeConversation(sidebarSettingsRef.current.chatConversationId).then()
    }
  })
}

export default useInitSidebar
