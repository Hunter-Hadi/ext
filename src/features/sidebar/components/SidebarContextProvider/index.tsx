import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'

import { ConversationStatusType } from '@/background/provider/chat'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ClientWritingMessageStateFamily } from '@/features/sidebar/store'
import { getInputMediator } from '@/store/InputMediator'

/**
 * SidebarContextProvider组件
 * 拆分出来提供给immersive chat app和side bar里使用
 *
 * @param props
 * @constructor
 */
const SidebarContextProvider: FC<{
  isImmersiveChat?: boolean
  children: React.ReactNode
}> = (props) => {
  const { isImmersiveChat, children } = props
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
    createSidebarConversation,
    resetSidebarConversation,
    updateSidebarSettings,
    sidebarSettings,
  } = useSidebarSettings()
  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatusType>('success')

  // 这里记录immersive page里的状态，初始化时和sidebarSettings里一致
  const [immersiveSettings, setImmersiveSettings] = useState(sidebarSettings)
  const sidebarConversationTypeRef = useRef(currentSidebarConversationType)
  sidebarConversationTypeRef.current = currentSidebarConversationType

  const immersiveConversationId = useMemo(() => {
    let currentId = currentSidebarConversationId
    switch (currentSidebarConversationType) {
      case 'Chat':
        currentId = immersiveSettings?.chat?.conversationId
        break
      case 'Search':
        currentId = immersiveSettings?.search?.conversationId
        break
      case 'Summary':
        currentId = immersiveSettings?.summary?.conversationId
        break
      case 'Art':
        currentId = immersiveSettings?.art?.conversationId
        break
    }
    return currentId || currentSidebarConversationId
  }, [
    currentSidebarConversationType,
    currentSidebarConversationId,
    immersiveSettings,
  ])
  const [immersiveWritingMessage, setImmersiveWritingMessage] = useRecoilState(
    ClientWritingMessageStateFamily(immersiveConversationId || ''),
  )

  // 初始化时sidebarSettings为空，同步数据后更新至immersiveSettings
  useEffect(() => {
    if (!immersiveSettings) {
      setImmersiveSettings(sidebarSettings)
    }
  }, [immersiveSettings, sidebarSettings])

  const sidebarContextValue = useMemo<ChatPanelContextValue>(() => {
    /**
     * 区分immersive chat和sidebar里的状态
     */
    const conversationId = isImmersiveChat
      ? immersiveConversationId
      : currentSidebarConversationId

    /**
     * 修改conversation id
     * 目前这个方法只有在ConversationList里有调用
     * 根据当前conversationType去修改settings里的记录
     * @param newId
     */
    const updateConversationId: ChatPanelContextValue['updateConversationId'] =
      async (newId) => {
        const map: Record<
          string,
          keyof Exclude<typeof sidebarSettings, undefined>
        > = {
          Chat: 'chat',
          Summary: 'summary',
          Search: 'search',
          Art: 'art',
        }
        if (map[sidebarConversationTypeRef.current]) {
          if (isImmersiveChat) {
            return setImmersiveSettings((prev) => ({
              ...prev,
              [map[sidebarConversationTypeRef.current]]: {
                conversationId: newId,
              },
            }))
          } else {
            return updateSidebarSettings({
              [map[sidebarConversationTypeRef.current]]: {
                conversationId: newId,
              },
            })
          }
        }
      }

    /**
     * 创建conversation
     * immersive chat里创建conversation时不能影响到sidebar里
     * 所以这里加入了一个updateSetting的参数
     */
    const createConversation: ChatPanelContextValue['createConversation'] =
      isImmersiveChat
        ? (conversationType, AIProvider, AIModel) =>
            createSidebarConversation(
              conversationType,
              AIProvider,
              AIModel,
              false,
            ).then((newId) => updateConversationId(newId).then(() => newId))
        : createSidebarConversation

    /**
     * 清除conversation
     * immersive chat里清除conversation时不能影响到sidebar里
     * 这里重新写了一个方法，主要是useSidebarSettings里修改的是sidebar的clientWritingMessage
     */
    const resetConversation: ChatPanelContextValue['resetConversation'] =
      isImmersiveChat
        ? async () => {
            if (immersiveWritingMessage.loading) {
              return
            }
            getInputMediator('floatingMenuInputMediator').updateInputValue('')
            getInputMediator('chatBoxInputMediator').updateInputValue('')
            const currentConversation = conversationId
              ? await clientGetConversation(conversationId)
              : null
            if (currentConversation) {
              await createConversation(
                currentConversation.type,
                currentConversation.meta.AIProvider!,
                currentConversation.meta.AIModel!,
              )
            } else {
              await createConversation(sidebarConversationTypeRef.current)
            }
            setImmersiveWritingMessage({
              writingMessage: null,
              loading: false,
            })
          }
        : resetSidebarConversation

    return {
      conversationStatus,
      updateConversationStatus: (newStatus: ConversationStatusType) => {
        setConversationStatus(newStatus)
      },
      conversationId,
      updateConversationId,
      createConversation,
      resetConversation,
    }
  }, [
    currentSidebarConversationId,
    conversationStatus,
    isImmersiveChat,
    immersiveConversationId,
  ])

  return (
    <ChatPanelContext.Provider value={sidebarContextValue}>
      {children}
    </ChatPanelContext.Provider>
  )
}

export default SidebarContextProvider
