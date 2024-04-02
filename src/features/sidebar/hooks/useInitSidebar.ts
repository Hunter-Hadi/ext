import { useEffect, useRef } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import usePageUrlChange from '@/features/common/hooks/usePageUrlChange'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { AppState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

/**
 * 这里存放着不同的Tab类型的特殊行为：例如summary在url变化后要改回chat
 * 除了这里对conversationType有操作以外，还有这些文件:
 * @file src/features/contextMenu/components/FloatingContextMenu/index.tsx - popup menu菜单要切换到Chat
 * @file src/features/contextMenu/components/InputAssistantButton/InputAssistantButtonContextMenu.tsx - Input Assistant Button的菜单要切换到Chat
 * @file src/features/sidebar/components/SidebarTabs/index.tsx - Sidebar的菜单要切换到Chat
 *
 */
const useInitSidebar = () => {
  const appState = useRecoilValue(AppState)
  const { createPageSummary, resetPageSummary } = usePageSummary()
  const { pageUrl, startListen } = usePageUrlChange()
  const {
    sidebarSummaryConversationId,
    sidebarSettings,
    currentSidebarConversationType,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const { currentConversationIdRef, createConversation } =
    useClientConversation()
  const { stopGenerate } = useClientChat()
  const { updateAIProviderModel } = useAIProviderModels()
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const { continueInSearchWithAI } = useSearchWithAI()
  const pageConversationTypeRef = useRef<ISidebarConversationType>('Chat')
  const sidebarSettingsRef = useRef(sidebarSettings)
  useEffect(() => {
    sidebarSettingsRef.current = sidebarSettings
  }, [sidebarSettings])
  const isUpdatingConversationRef = useRef(false)
  useEffect(() => {
    if (isUpdatingConversationRef.current) {
      return
    }
    if (
      currentSidebarConversationType &&
      (appState.open || isMaxAIImmersiveChatPage())
    ) {
      const handleUpdateConversationType = async () => {
        const switchSidebarConversation = async (conversationId?: string) => {
          if (!conversationId) {
            return
          }
          const conversation = await clientGetConversation(conversationId)
          if (
            conversation &&
            conversation.meta.AIProvider &&
            conversation.meta.AIModel
          ) {
            await updateAIProviderModel(
              conversation.meta.AIProvider,
              conversation.meta.AIModel,
            )
          } else {
            // 如果没有AIProvider和AIModel，那么就用默认的
            await createConversation(currentSidebarConversationType)
          }
        }
        switch (currentSidebarConversationType) {
          case 'Chat':
            {
              if (sidebarSettingsRef.current?.chat?.conversationId) {
                // 切换回cache中的conversation
                await switchSidebarConversation(
                  sidebarSettingsRef.current?.chat?.conversationId,
                )
              } else {
                await createConversation(currentSidebarConversationType)
              }
            }
            break
          case 'Summary':
            {
              await createConversation(currentSidebarConversationType)
            }
            break
          case 'Search':
            {
              if (sidebarSettingsRef.current?.search?.conversationId) {
                // 切换回cache中的conversation
                await switchSidebarConversation(
                  sidebarSettingsRef.current?.search?.conversationId,
                )
              } else {
                await createConversation(currentSidebarConversationType)
              }
            }
            break
          case 'Art':
            {
              if (sidebarSettingsRef.current?.art?.conversationId) {
                // 切换回cache中的conversation
                await switchSidebarConversation(
                  sidebarSettingsRef.current?.art?.conversationId,
                )
              } else {
                await createConversation(currentSidebarConversationType)
              }
            }
            break
        }
      }
      isUpdatingConversationRef.current = true
      handleUpdateConversationType().then(() => {
        isUpdatingConversationRef.current = false
      })
    }
  }, [currentSidebarConversationType, appState.open])
  // summary 重新生成的逻辑
  useEffect(() => {
    if (
      currentSidebarConversationType === 'Summary' &&
      sidebarSummaryConversationId
    ) {
      console.log('Tracking Tracking Tracking', sidebarSummaryConversationId)
      createPageSummary().then().catch()
    }
  }, [sidebarSummaryConversationId, currentSidebarConversationType])
  // Summary的特殊逻辑
  // - 切换url的时候为了省下token，直接切换到chat
  // - 在每个YouTube/PDF URL 第一次打开Sidebar的情况下，第一次打开Chat自动切换到Summary
  const pageUrlIsUsedRef = useRef(false)
  useEffect(() => {
    if (pageUrl) {
      stopGenerate()
      resetPageSummary()
      pageUrlIsUsedRef.current = false
    }
  }, [pageUrl])
  useEffect(() => {
    if (!pageUrlIsUsedRef.current && pageUrl) {
      const pageSummaryType = getPageSummaryType()
      pageUrlIsUsedRef.current = true
      console.log('special pageSummaryType', pageSummaryType, pageUrl)
      if (
        pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY' ||
        pageSummaryType === 'PDF_CRX_SUMMARY'
      ) {
        updateSidebarConversationType('Summary')
      } else if (pageConversationTypeRef.current === 'Summary') {
        updateSidebarConversationType('Chat')
      }
    }
  }, [pageUrl])
  // 监听搜索引擎的continue search with ai
  useEffect(() => {
    const listener = (event: any) => {
      const aiMessage: IAIResponseMessage = event?.detail?.aiMessage
      if (aiMessage) {
        continueInSearchWithAI(aiMessage).then().catch()
      }
    }
    window.addEventListener('MaxAIContinueSearchWithAI', listener)
    return () => {
      window.removeEventListener('MaxAIContinueSearchWithAI', listener)
    }
  }, [])
  // focus的时候更新消息
  useFocus(() => {
    if (currentConversationIdRef.current) {
      const start = new Date().getTime()
      clientGetConversation(currentConversationIdRef.current).then(
        (conversation) => {
          if (conversation) {
            console.log('UsingUsingUsing', new Date().getTime() - start, 'ms')
            console.log('新版Conversation refocus更新', conversation.messages)
            updateConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
          }
        },
      )
    }
  })
  useEffectOnce(() => {
    startListen()
  })
}

export default useInitSidebar
