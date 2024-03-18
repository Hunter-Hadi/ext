import { useEffect, useRef } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import usePageUrlChange from '@/features/common/hooks/usePageUrlChange'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'
import { AppState } from '@/store'

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
  const { stopGenerate } = useClientChat()
  const {
    currentSidebarConversation,
    sidebarSettings,
    currentSidebarConversationType,
    updateSidebarSettings,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const { currentConversationIdRef } = useClientConversation()
  const { updateAIProviderModel } = useAIProviderModels()
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const { continueInSearchWithAI } = useSearchWithAI()
  const pageConversationTypeRef = useRef<ISidebarConversationType>('Chat')
  const sidebarSettingsRef = useRef(sidebarSettings)
  useEffect(() => {
    sidebarSettingsRef.current = sidebarSettings
  }, [sidebarSettings])
  const appOpenRef = useRef(appState.open)
  useEffect(() => {
    appOpenRef.current = appState.open
  }, [appState.open])
  useEffect(() => {
    let isExpired = false
    if (currentSidebarConversationType && appOpenRef.current) {
      const switchConversation = async (conversationId?: string) => {
        if (!conversationId) {
          return
        }
        const conversation = await clientGetConversation(conversationId)
        if (
          !isExpired &&
          conversation &&
          conversation.meta.AIProvider &&
          conversation.meta.AIModel
        ) {
          await updateAIProviderModel(
            conversation.meta.AIProvider,
            conversation.meta.AIModel,
          )
        }
      }
      console.log(
        '新版Conversation currentSidebarConversationType',
        currentSidebarConversationType,
      )
      switch (currentSidebarConversationType) {
        case 'Chat':
          {
            // 切换回cache中的conversation
            switchConversation(sidebarSettingsRef.current?.chat?.conversationId)
          }
          break
        case 'Summary':
          {
            // 切换回cache中的conversation
            createPageSummary().then().then()
          }
          break
        case 'Search':
          {
            // Search的逻辑
            switchConversation(
              sidebarSettingsRef.current?.search?.conversationId,
            )
          }
          break
        case 'Art':
          {
            switchConversation(sidebarSettingsRef.current?.art?.conversationId)
          }
          break
      }
      pageConversationTypeRef.current = currentSidebarConversationType
    }
    return () => {
      isExpired = true
    }
  }, [currentSidebarConversationType])
  // summary 重新生成的逻辑
  useEffect(() => {
    // 如果不是Summary, return
    if (currentSidebarConversationType !== 'Summary' || !appState.open) {
      return
    }
    if (currentSidebarConversation?.id) {
      // 如过conversation不是summary， return
      if (currentSidebarConversation?.type !== 'Summary') {
        return
      }
      // 如果有消息了
      if (currentSidebarConversation?.messages) {
        const firstAIMessage =
          currentSidebarConversation?.messages.find(isAIMessage)
        // 如果已经有总结并且完成了，那就跳出
        if (firstAIMessage?.originalMessage?.metadata?.isComplete) {
          return
        }
      }
    } else {
      // 直接触发create
    }
    stopGenerate().then(() => {
      createPageSummary().then().catch().finally()
    })
  }, [
    currentSidebarConversation?.id,
    currentSidebarConversationType,
    appState.open,
  ])
  // summary 聚焦处理
  useFocus(() => {
    if (pageConversationTypeRef.current === 'Summary') {
      updateSidebarSettings({
        summary: {
          conversationId: getPageSummaryConversationId(),
        },
      })
    }
  })
  // Summary的特殊逻辑
  // - 切换url的时候为了省下token，直接切换到chat
  // - 在每个YouTube/PDF URL 第一次打开Sidebar的情况下，第一次打开Chat自动切换到Summary
  const pageUrlIsUsedRef = useRef(false)
  useEffect(() => {
    resetPageSummary()
    pageUrlIsUsedRef.current = false
  }, [pageUrl])
  useEffect(() => {
    if (!pageUrlIsUsedRef.current) {
      const pageSummaryType = getPageSummaryType()
      pageUrlIsUsedRef.current = true
      console.log('special pageSummaryType', pageSummaryType)
      if (
        pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY' ||
        pageSummaryType === 'PDF_CRX_SUMMARY'
      ) {
        updateSidebarSettings({
          summary: {
            conversationId: getPageSummaryConversationId(),
          },
        }).then(() => {
          updateSidebarConversationType('Summary')
        })
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
  })
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
