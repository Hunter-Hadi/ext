import { useEffect, useRef } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import usePageUrlChange from '@/hooks/usePageUrlChange'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { usePrevious } from '@/hooks/usePrevious'
import { ISidebarConversationType } from '@/features/sidebar/store'
import { useFocus } from '@/hooks/useFocus'
import { getPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import { useSetRecoilState } from 'recoil'
import { ClientConversationMapState } from '@/features/chatgpt/store'

/**
 * 这里存放着不同的Tab类型的特殊行为：例如summary在url变化后要改回chat
 * 除了这里对conversationType有操作以外，还有这些文件:
 * @file src/features/contextMenu/components/FloatingContextMenu/index.tsx - popup menu菜单要切换到Chat
 * @file src/features/contextMenu/components/InputAssistantButton/InputAssistantButtonContextMenu.tsx - Input Assistant Button的菜单要切换到Chat
 * @file src/features/sidebar/components/SidebarTabs/index.tsx - Sidebar的菜单要切换到Chat
 *
 */
const useInitSidebar = () => {
  const { createPageSummary } = usePageSummary()
  const { pageUrl, startListen } = usePageUrlChange()
  const {
    sidebarSettings,
    currentSidebarConversationType,
    currentSidebarConversationId,
    updateSidebarSettings,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const { switchBackgroundChatSystemAIProvider } = useClientConversation()
  const { continueInSearchWithAI } = useSearchWithAI()
  const pageConversationTypeRef = useRef<ISidebarConversationType>('Chat')
  const sidebarSettingsRef = useRef(sidebarSettings)
  const prevSummaryConversationId = usePrevious(
    sidebarSettings?.summary?.conversationId,
  )
  useEffect(() => {
    sidebarSettingsRef.current = sidebarSettings
  }, [sidebarSettings])
  useEffect(() => {
    if (currentSidebarConversationType) {
      console.log(
        '新版Conversation currentSidebarConversationType',
        currentSidebarConversationType,
      )
      switch (currentSidebarConversationType) {
        case 'Chat':
          {
            // Chat的逻辑
          }
          break
        case 'Summary':
          {
            // Summary的逻辑
            createPageSummary()
              .then()
              .catch()
              .finally(() => {
                startListen()
              })
          }
          break
        case 'Search':
          {
            // Search的逻辑
          }
          break
      }
      pageConversationTypeRef.current = currentSidebarConversationType
    }
  }, [currentSidebarConversationType])
  // summary 重新生成的逻辑
  useEffect(() => {
    if (currentSidebarConversationType === 'Summary') {
      // 当上次有ID，当前没有ID，并且是Summary的时候，说明用户点击了New Chat，所以重新生成
      if (prevSummaryConversationId && !currentSidebarConversationId) {
        createPageSummary().then().catch().finally()
      }
    }
  }, [currentSidebarConversationId, currentSidebarConversationType])
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
  // Summary的特殊逻辑 - 切换url的时候为了省下token，直接切换到chat
  useEffect(() => {
    if (pageConversationTypeRef.current === 'Summary') {
      updateSidebarConversationType('Chat')
    }
  }, [pageUrl])
  // conversationID切换的时候的处理
  const currentSidebarConversationIdRef = useRef(currentSidebarConversationId)
  useEffect(() => {
    // 切换使用的AI provider
    let destroy = false
    if (currentSidebarConversationId) {
      debugger
      clientGetConversation(currentSidebarConversationId).then(
        async (conversation) => {
          if (conversation?.meta.AIProvider) {
            if (!destroy) {
              console.log(
                '新版Conversation 切换Tab导致AIProvider',
                conversation.meta.AIProvider,
              )
              await switchBackgroundChatSystemAIProvider(
                conversation.meta.AIProvider,
                conversation.meta.AIModel,
              )
            }
          }
        },
      )
    }
    currentSidebarConversationIdRef.current = currentSidebarConversationId
    return () => {
      destroy = true
    }
  }, [currentSidebarConversationId])
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
    if (currentSidebarConversationIdRef.current) {
      clientGetConversation(currentSidebarConversationIdRef.current).then(
        (conversation) => {
          if (conversation) {
            console.log('新版Conversation refocus更新', conversation.messages)
            updateConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
            // setClientConversationMap((prevState) => {
            //   return {
            //     ...prevState,
            //     [conversation.id]: conversation,
            //   }
            // })
          }
        },
      )
    }
  })
}

export default useInitSidebar
