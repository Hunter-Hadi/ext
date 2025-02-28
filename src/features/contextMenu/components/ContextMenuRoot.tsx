import React, { FC, memo, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'

import { ConversationStatusType } from '@/background/provider/chat'
import {
  getChromeExtensionLocalStorage,
  MAXAI_DEFAULT_AI_PROVIDER_CONFIG,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import CustomPortal from '@/components/CustomPortal'
import { getModelOptionsForConversationType } from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import { MAXAI_CONTEXT_MENU_ID } from '@/features/common/constants'
import { FloatingContextMenu } from '@/features/contextMenu/components/FloatingContextMenu'
import FloatingShortCutsTip from '@/features/contextMenu/components/FloatingContextMenu/FloatingShortCutsTip'
import { FloatingImageMiniMenu } from '@/features/contextMenu/components/FloatingImageMiniMenu'
import FloatingMiniMenu from '@/features/contextMenu/components/FloatingMiniMenu'
import GoogleDocInject from '@/features/contextMenu/components/GoogleDocInject'
import InputAssistantButtonPortal from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonPortal'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

import { ContextMenuConversationState } from '../store'

const ContextMenuRoot: FC = () => {
  const { updateSidebarSettings, createSidebarConversation } =
    useSidebarSettings()
  const [contextMenuConversation, setContextMenuConversation] = useRecoilState(
    ContextMenuConversationState,
  )
  const conversationId = contextMenuConversation.conversationId

  const setConversationId = (id: string) => {
    setContextMenuConversation((prev) => ({
      ...prev,
      conversationId: id,
    }))
  }

  const [conversationStatus, setConversationStauts] =
    useState<ConversationStatusType>('success')

  const ChatPanelContextValue = useMemo<ChatPanelContextValue>(() => {
    const createConversation: ChatPanelContextValue['createConversation'] =
      async (conversationType, AIProvider, AIModel) => {
        if (!AIProvider || !AIModel) {
          // 说明要用默认的或者用户最后选择的
          const settings = await getChromeExtensionLocalStorage()
          const contextMenuAIModel =
            settings.sidebarSettings?.contextMenu?.currentAIModel ||
            MAXAI_DEFAULT_AI_PROVIDER_CONFIG[conversationType].AIModel
          const contextMenuAIModelDetail = getModelOptionsForConversationType(
            conversationType,
          ).find((item) => item.value === contextMenuAIModel)
          if (contextMenuAIModelDetail) {
            AIProvider = contextMenuAIModelDetail.AIProvider
            AIModel = contextMenuAIModelDetail.value
          } else {
            AIProvider =
              MAXAI_DEFAULT_AI_PROVIDER_CONFIG[conversationType].AIProvider
            AIModel = MAXAI_DEFAULT_AI_PROVIDER_CONFIG[conversationType].AIModel
          }
        }

        const newConversationId = await createSidebarConversation(
          'ContextMenu',
          AIProvider,
          AIModel,
        )

        setConversationId(newConversationId)
        await updateSidebarSettings({
          contextMenu: {
            currentAIModel: AIModel,
          },
        })
        return newConversationId
      }
    return {
      conversationStatus: conversationStatus,
      updateConversationStatus: setConversationStauts,
      updateConversationId: async () => {
        setConversationId('')
      },
      createConversation,
      resetConversation: async () => {
        await createConversation('ContextMenu')
      },
      conversationId,
      setConversationId,
    }
  }, [conversationId])

  return (
    <ChatPanelContext.Provider value={ChatPanelContextValue}>
      <CustomPortal containerId={MAXAI_CONTEXT_MENU_ID}>
        {(props) => {
          return (
            <>
              {/*<AppThemeProvider shadowRootElement={props.rootContainer!}>*/}
              <FloatingContextMenu root={props.rootContainer} />
              <FloatingShortCutsTip />
              <FloatingImageMiniMenu />
              <FloatingMiniMenu />
              <GoogleDocInject />
              <InputAssistantButtonPortal />
              {/*</AppThemeProvider>*/}
            </>
          )
        }}
      </CustomPortal>
    </ChatPanelContext.Provider>
  )
}

export default memo(ContextMenuRoot)
