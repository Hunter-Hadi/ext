import { useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import usePageSummary from '@/features/chat-base/summary/hooks/usePageSummary'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/chat-base/summary/utils/pageSummaryHelper'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import usePageUrlChange from '@/features/common/hooks/usePageUrlChange'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { AppState } from '@/store'

/**
 * 这里存放着不同的Tab类型的特殊行为：例如summary在url变化后要改回chat
 * 除了这里对conversationType有操作以外，还有这些文件:
 * @file src/features/contextMenu/components/FloatingContextMenu/index.tsx - popup menu菜单要切换到Chat
 * @file src/features/contextMenu/components/InputAssistantButton/InputAssistantButtonContextMenu.tsx - Input Assistant Button的菜单要切换到Chat
 * @file src/features/sidebar/components/SidebarTabs/index.tsx - Sidebar的菜单要切换到Chat
 *
 */
const useInitWebPageSidebar = () => {
  const appState = useRecoilValue(AppState)
  const { createPageSummary, resetPageSummary } = usePageSummary()
  const { pageUrl, documentTitle, startListen } = usePageUrlChange()
  const {
    sidebarSummaryConversationId,
    sidebarChatConversationId,
    sidebarSettings,
    currentSidebarConversationType,
    updateSidebarConversationType,
    updateSidebarSummaryConversationId,
  } = useSidebarSettings()
  const { createConversation } = useClientConversation()
  const { stopGenerate } = useClientChat()
  const { updateAIProviderModel } = useAIProviderModels()
  const { continueInSearchWithAI } = useSearchWithAI()
  const pageConversationTypeRef = useRef(currentSidebarConversationType)
  pageConversationTypeRef.current = currentSidebarConversationType
  const pageSummaryConversationIdRef = useRef(sidebarSummaryConversationId)
  pageSummaryConversationIdRef.current = sidebarSummaryConversationId
  const sidebarSettingsRef = useRef(sidebarSettings)
  sidebarSettingsRef.current = sidebarSettings
  const isUpdatingConversationRef = useRef(false)
  useEffect(() => {
    if (isUpdatingConversationRef.current) {
      return
    }
    if (currentSidebarConversationType && appState.open) {
      const handleUpdateConversationType = async () => {
        const switchSidebarConversation = async (conversationId?: string) => {
          if (!conversationId) {
            return
          }
          const conversation =
            await ClientConversationManager.getConversationById(conversationId)
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
  // chat重新生成的逻辑
  useEffect(() => {
    if (
      currentSidebarConversationType === 'Chat' &&
      !sidebarChatConversationId &&
      appState.open
    ) {
      createConversation(currentSidebarConversationType).then().catch()
    }
  }, [sidebarChatConversationId, currentSidebarConversationType, appState.open])
  // summary 重新生成的逻辑
  useEffect(() => {
    if (
      currentSidebarConversationType === 'Summary' &&
      sidebarSummaryConversationId &&
      appState.open
    ) {
      console.log('Tracking Tracking Tracking', sidebarSummaryConversationId)
      createPageSummary().then().catch()
    }
  }, [
    sidebarSummaryConversationId,
    currentSidebarConversationType,
    appState.open,
  ])
  // Summary的特殊逻辑
  // - 切换url的时候为了省下token，直接切换到chat
  // - 在每个YouTube/PDF URL 第一次打开Sidebar的情况下，第一次打开Chat自动切换到Summary
  const pageUrlRef = useRef('')
  const documentTitleRef = useRef('')
  useEffect(() => {
    if (pageUrl && pageUrlRef.current !== pageUrl) {
      const pageSummaryType = getPageSummaryType()
      if (
        pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY' ||
        pageSummaryType === 'PDF_CRX_SUMMARY'
      ) {
        // youtube下需要等得document.title变化后在执行, 否则获取到的是之前的document.title
        if (documentTitleRef.current === documentTitle) {
          return
        }
      }
      // 页面变化重置page summary和summary conversation id
      pageUrlRef.current = pageUrl
      documentTitleRef.current = documentTitle
      resetPageSummary()
      if (
        pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY' ||
        pageSummaryType === 'PDF_CRX_SUMMARY'
      ) {
        if (pageConversationTypeRef.current !== 'Summary') {
          updateSidebarConversationType('Summary')
        }
        updateSidebarSummaryConversationId()
        createConversation('Summary')
        return
      }
      if (pageConversationTypeRef.current === 'Summary') {
        // 页面变化切换至Chat并停止当前对话
        const pageSummaryConversationId = pageSummaryConversationIdRef.current
        getMaxAIChromeExtensionUserId().then((userId) => {
          const newSummaryConversationId = getPageSummaryConversationId({
            userId,
          })
          if (pageSummaryConversationId !== newSummaryConversationId) {
            stopGenerate()
            updateSidebarConversationType('Chat')
            updateSidebarSummaryConversationId(newSummaryConversationId)
          } else {
            updateSidebarSummaryConversationId()
          }
        })
      } else {
        updateSidebarSummaryConversationId()
      }
    }
  }, [pageUrl, documentTitle])
  // 监听搜索引擎的continue search with ai
  useEffect(() => {
    const listener = (event: any) => {
      const aiMessage: IAIResponseMessage = event?.detail?.aiMessage
      const aiProvider: IAIProviderType = event?.detail?.aiProvider
      const aiModel: string = event?.detail?.aiModel
      if (aiMessage) {
        continueInSearchWithAI(aiMessage, aiProvider, aiModel).then().catch()
      }
    }
    window.addEventListener('MaxAIContinueSearchWithAI', listener)
    return () => {
      window.removeEventListener('MaxAIContinueSearchWithAI', listener)
    }
  }, [])
  useEffectOnce(() => {
    startListen()
  })
}

export default useInitWebPageSidebar
