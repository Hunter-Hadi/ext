import React, { FC, useMemo, useState } from 'react'

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
import FloatingMiniMenu from '@/features/contextMenu/components/FloatingMiniMenu'
import GoogleDocInject from '@/features/contextMenu/components/GoogleDocInject'
import InputAssistantButtonPortal from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonPortal'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const ContextMenuRoot: FC = () => {
  const { updateSidebarSettings } = useSidebarSettings()
  const [conversationId, setConversationId] = useState<string>('')
  const [conversationStatus, updateConversationStatus] =
    useState<ConversationStatusType>('success')
  const { createSidebarConversation } = useSidebarSettings()
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
        console.log(
          '新版ContextWindow 创建Conversation',
          newConversationId,
          conversationType,
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
      updateConversationStatus: updateConversationStatus,
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

export default ContextMenuRoot
