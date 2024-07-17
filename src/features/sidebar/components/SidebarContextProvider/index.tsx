import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

import { ConversationStatusType } from '@/background/provider/chat'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/type'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { getInputMediator } from '@/store/InputMediator'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

type ImmersiveSettingsKey = keyof Exclude<
  IChromeExtensionLocalStorage['immersiveSettings'],
  undefined
>

const conversationTypeRouteMap: Record<string, ISidebarConversationType> = {
  chat: 'Chat',
  search: 'Search',
  art: 'Art',
}

// sidebar里切换用户和退出登录暂时没问题，immersive chat里先拆出来单独处理
const SidebarImmersiveUserChange: FC<{ context: ChatPanelContextValue }> = (
  props,
) => {
  const { context } = props
  const { conversationId, createConversation } = context
  useFocus(async () => {
    if (!conversationId) return
    const conversation = await ClientConversationManager.getConversationById(
      conversationId,
    )
    if (conversation) {
      const userId = await getMaxAIChromeExtensionUserId()
      if (conversation.authorId !== userId) {
        createConversation(conversation.type)
      }
    }
  })
  return null
}

const SidebarImmersiveProvider: FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props
  const {
    currentSidebarConversationType,
    updateSidebarConversationType,
    createSidebarConversation,
    updateImmersiveSettings,
    immersiveSettings: localSettings,
  } = useSidebarSettings()

  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatusType>('success')

  const [initialized, setInitialized] = useState(false)

  // 多个immersive page不需要同步，这里只记录初始化时的状态
  const [immersiveSettings, setImmersiveSettings] = useState(localSettings)
  const sidebarConversationTypeRef = useRef(currentSidebarConversationType)
  sidebarConversationTypeRef.current = currentSidebarConversationType
  const immersiveSettingsRef = useRef(immersiveSettings)
  immersiveSettingsRef.current = immersiveSettings

  const immersiveConversationId = useMemo(() => {
    switch (currentSidebarConversationType) {
      case 'ContextMenu':
        return immersiveSettings?.contextMenu?.conversationId
      case 'Chat':
        return immersiveSettings?.chat?.conversationId
      case 'Search':
        return immersiveSettings?.search?.conversationId
      case 'Art':
        return immersiveSettings?.art?.conversationId
    }
    return ''
  }, [currentSidebarConversationType, immersiveSettings])

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
      const map: Record<string, ImmersiveSettingsKey> = {
        ContextMenu: 'contextMenu',
        Chat: 'chat',
        Search: 'search',
        Art: 'art',
      }
      const settingsType =
        map[conversationType || sidebarConversationTypeRef.current]
      if (settingsType) {
        return setImmersiveSettings((prev) => ({
          ...prev,
          [settingsType]: {
            ...prev?.[settingsType],
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
        const sidebarConversationType = sidebarConversationTypeRef.current
        const settingsType =
          sidebarConversationType === 'ContextMenu'
            ? 'contextMenu'
            : (sidebarConversationType.toLowerCase() as ImmersiveSettingsKey)

        const conversationTypeConfig =
          immersiveSettingsRef.current?.[settingsType]
        if ((!AIProvider || !AIModel) && conversationTypeConfig) {
          AIProvider = conversationTypeConfig.AIProvider
          AIModel = conversationTypeConfig.AIModel
        }
        const conversationId = await createSidebarConversation(
          conversationType,
          AIProvider,
          AIModel,
          false,
        )
        await updateConversationId(conversationId, conversationType)
        if (AIProvider || AIModel) {
          await updateImmersiveSettings({
            [settingsType]: { AIProvider, AIModel },
          })
        }
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
          ? await ClientConversationManager.getConversationById(conversationId)
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
      updateConversationStatus: setConversationStatus,
      conversationId,
      updateConversationId,
      createConversation,
      resetConversation,
    }
  }, [immersiveConversationId, conversationStatus])

  // 初始化时immersiveSettings为空，同步数据后更新至immersiveSettings
  const isSyncRef = useRef(false)
  useEffect(() => {
    if (!isSyncRef.current && localSettings) {
      isSyncRef.current = true
      const newSettings = mergeWithObject([localSettings, immersiveSettings])
      setImmersiveSettings(newSettings)
      immersiveSettingsRef.current = newSettings
      if (!immersiveConversationId) {
        // 初始化没有id，比如首次安装的时候登陆成功后不打开sidebar直接打开immersive chat
        sidebarContextValue
          .createConversation(sidebarConversationTypeRef.current)
          .then()
          .catch()
          .finally(() => {
            setInitialized(true)
          })
      } else {
        setInitialized(true)
      }
    }
  }, [
    localSettings,
    immersiveSettings,
    immersiveConversationId,
    sidebarContextValue,
  ])

  // 记录hash变化
  useEffectOnce(() => {
    const [_, route, conversationId] = window.location.hash
      .replace('#', '')
      ?.split('/')

    const type =
      conversationTypeRouteMap[route] || currentSidebarConversationType
    updateSidebarConversationType(type)
    if (conversationId) {
      sidebarContextValue
        .updateConversationId(conversationId, type)
        .finally(() => setInitialized(true))

      ClientConversationManager.getConversationById(conversationId).then(
        (conversation) => {
          if (!conversation) {
            sidebarContextValue.createConversation(
              sidebarConversationTypeRef.current,
            )
          }
        },
      )
    } else {
      setInitialized(true)
    }
  })

  useEffect(() => {
    if (initialized) {
      window.location.hash = `#/${currentSidebarConversationType.toLowerCase()}${
        immersiveConversationId ? `/${immersiveConversationId}` : ''
      }`
    }
  }, [initialized, currentSidebarConversationType, immersiveConversationId])

  return (
    <ChatPanelContext.Provider value={sidebarContextValue}>
      {initialized && children}
      {initialized && (
        <SidebarImmersiveUserChange context={sidebarContextValue} />
      )}
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
          ContextMenu: 'contextMenu',
        }
        if (map[sidebarConversationTypeRef.current]) {
          return updateSidebarSettings({
            [map[sidebarConversationTypeRef.current]]: {
              conversationId: newId,
            },
          })
        }
      },
      createConversation: async (conversationType, aiProvider, aiModel) => {
        const id = await createSidebarConversation(
          conversationType,
          aiProvider,
          aiModel,
        )

        if (conversationType === 'ContextMenu') {
          updateSidebarSettings({
            contextMenu: {
              conversationId: id,
              currentAIModel: aiModel,
            },
          })
        }
        return id
      },
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
