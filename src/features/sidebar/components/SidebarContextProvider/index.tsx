import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

import { ConversationStatusType } from '@/background/provider/chat'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { getInputMediator } from '@/store/InputMediator'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const conversationTypeRouteMap: Record<string, ISidebarConversationType> = {
  chat: 'Chat',
  search: 'Search',
  art: 'Art',
}

const SidebarImmersiveProvider: FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
    updateSidebarConversationType,
    createSidebarConversation,
    sidebarSettings,
  } = useSidebarSettings()
  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatusType>('success')

  const [initialized, setInitialized] = useState(false)

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

  const conversationTypeRef = useRef(currentSidebarConversationType)
  conversationTypeRef.current = currentSidebarConversationType

  const sidebarContextValue = useMemo(() => {
    /**
     * 区分immersive chat和sidebar里的状态
     */
    const conversationId = immersiveConversationId

    /**
     * 修改conversation id
     * 目前这个方法只有在ConversationList里有调用
     * 根据当前conversationType去修改settings里的记录
     * @param newConversationId
     * @param conversationType
     */
    const updateConversationId = async (
      newConversationId: string,
      conversationType?: ISidebarConversationType,
    ) => {
      const map: Record<
        string,
        keyof Exclude<typeof sidebarSettings, undefined>
      > = {
        Chat: 'chat',
        Summary: 'summary',
        Search: 'search',
        Art: 'art',
      }
      if (map[conversationType || sidebarConversationTypeRef.current]) {
        return setImmersiveSettings((prev) => ({
          ...prev,
          [map[sidebarConversationTypeRef.current]]: {
            conversationId: newConversationId,
          },
        }))
      }
    }

    /**
     * 创建conversation
     * immersive chat里创建conversation时不能影响到sidebar里
     * 所以这里加入了一个updateSetting的参数
     */
    const createConversation: ChatPanelContextValue['createConversation'] =
      async (conversationType, AIProvider, AIModel) => {
        const conversationId = await createSidebarConversation(
          conversationType,
          AIProvider,
          AIModel,
          false,
        )
        await updateConversationId(conversationId, conversationType)
        return conversationId
      }

    /**
     * 清除conversation
     * immersive chat里清除conversation时不能影响到sidebar里
     * 这里重新写了一个方法，主要是useSidebarSettings里修改的是sidebar的clientWritingMessage
     */
    const resetConversation: ChatPanelContextValue['resetConversation'] =
      async () => {
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
      }

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
  }, [immersiveConversationId, conversationStatus])

  // 初始化时sidebarSettings为空，同步数据后更新至immersiveSettings
  const isSyncRef = useRef(false)
  useEffect(() => {
    if (!isSyncRef.current && sidebarSettings) {
      isSyncRef.current = true
      setImmersiveSettings(
        mergeWithObject([sidebarSettings, immersiveSettings]),
      )
      if (!immersiveConversationId) {
        // 初始化没有id，比如首次安装的时候登陆成功后不打开sidebar直接打开immersive chat
        sidebarContextValue.createConversation(conversationTypeRef.current)
      }
    }
  }, [
    immersiveSettings,
    sidebarSettings,
    immersiveConversationId,
    sidebarContextValue,
  ])

  // 记录hash变化
  useEffectOnce(() => {
    const [_, route, conversationId] = window.location.hash.replace('#', '')?.split('/')

    const type = conversationTypeRouteMap[route] || currentSidebarConversationType
    updateSidebarConversationType(type)
    if (conversationId) {
      sidebarContextValue
        .updateConversationId(conversationId, type)
        .finally(() => setInitialized(true))

      clientGetConversation(conversationId).then(conversation => {
        if (!conversation) {
          sidebarContextValue.createConversation(conversationTypeRef.current)
        }
      })
    } else {
      setInitialized(true)
    }
  })

  useEffect(() => {
    if (initialized) {
      window.location.hash = `#/${currentSidebarConversationType.toLowerCase()}/${immersiveConversationId}`
    }
  }, [initialized, currentSidebarConversationType, immersiveConversationId])

  return (
    <ChatPanelContext.Provider value={sidebarContextValue}>
      {initialized && children}
    </ChatPanelContext.Provider>
  )
}

const SidebarAppProvider: FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props
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

  const sidebarConversationTypeRef = useRef(currentSidebarConversationType)
  sidebarConversationTypeRef.current = currentSidebarConversationType

  const sidebarContextValue = useMemo<ChatPanelContextValue>(() => {
    return {
      conversationStatus,
      updateConversationStatus: (newStatus: ConversationStatusType) => {
        setConversationStatus(newStatus)
      },
      conversationId: currentSidebarConversationId,
      updateConversationId: async (newId) => {
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
          return updateSidebarSettings({
            [map[sidebarConversationTypeRef.current]]: {
              conversationId: newId,
            },
          })
        }
      },
      createConversation: createSidebarConversation,
      resetConversation: resetSidebarConversation,
    }
  }, [currentSidebarConversationId, conversationStatus])

  return (
    <ChatPanelContext.Provider value={sidebarContextValue}>
      {children}
    </ChatPanelContext.Provider>
  )
}

/**
 * SidebarContextProvider组件
 * 拆分出来提供给immersive chat app和side bar里使用
 *
 * @param props
 * @constructor
 */
const SidebarContextProvider: FC<{
  children: React.ReactNode
}> = (props) => {
  const { children } = props
  const isImmersiveChatRef = useRef(isMaxAIImmersiveChatPage())
  if (isImmersiveChatRef.current) {
    return <SidebarImmersiveProvider>{children}</SidebarImmersiveProvider>
  }

  return <SidebarAppProvider>{children}</SidebarAppProvider>
}

export default SidebarContextProvider
