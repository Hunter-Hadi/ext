import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useMemo } from 'react'
import { atomFamily, useRecoilState } from 'recoil'

import {
  ConversationStatusType,
  IAIProviderType,
} from '@/background/provider/chat'
import { openAIAPISystemPromptGenerator } from '@/background/src/chat/OpenAIApiChat/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import {
  IConversation,
  IConversationMeta,
} from '@/features/indexed_db/conversations/models/Conversation'
import SidebarChatPanel from '@/features/sidebar/components/SidebarChatPanel'
import { ISidebarConversationType } from '@/features/sidebar/types'

const port = new ContentScriptConnectionV2()
const ChatPanelStateFamily = atomFamily<
  {
    conversationId: string
    status: ConversationStatusType
  },
  number
>({
  key: 'ChatPanelState',
  default: {
    conversationId: '',
    status: 'success',
  },
})
const SettingsDevTestPrompt: FC = () => {
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  return (
    <Stack spacing={1} direction={'row'} flexWrap={'wrap'}>
      {AI_PROVIDER_MODEL_MAP.USE_CHAT_GPT_PLUS.map((AIModel, i) => {
        return (
          <Stack position={'relative'} key={AIModel.value} width={'48%'}>
            <ChatPanelItem
              panelId={i}
              AIModel={AIModel.value}
              AIProvider={'USE_CHAT_GPT_PLUS'}
            />
          </Stack>
        )
      })}
    </Stack>
  )
}

const ChatPanelItem: FC<{
  panelId: number
  AIProvider: IAIProviderType
  AIModel: string
}> = (props) => {
  const { getAIProviderModelDetail } = useAIProviderModelsMap()
  const { panelId, AIProvider, AIModel } = props
  const [state, setState] = useRecoilState(ChatPanelStateFamily(panelId))
  const createConversation = async (
    conversationType: ISidebarConversationType,
    currentAIProvider?: IAIProviderType,
    currentModel?: string,
  ) => {
    console.log('新版Conversation ', AIProvider, AIModel)
    const baseMetaConfig: Partial<IConversationMeta> = {
      AIProvider: currentAIProvider || AIProvider,
      AIModel: currentModel || AIModel,
      maxTokens:
        getAIProviderModelDetail(AIProvider, AIModel)?.maxTokens || 4096,
    }
    // 如果是OPENAI_API，那么就加上systemPrompt
    if (AIProvider === 'OPENAI_API') {
      baseMetaConfig.systemPrompt = openAIAPISystemPromptGenerator(AIModel)
    }
    // 创建一个新的conversation
    const result = await port.postMessage({
      event: 'Client_createChatGPTConversation',
      data: {
        initConversationData: {
          type: 'Chat',
          title: 'Ask AI anything',
          meta: baseMetaConfig,
        } as Partial<IConversation>,
      },
    })
    setState({
      conversationId: result.data.conversationId,
      status: 'success',
    })
    return result.data.conversationId
  }
  const chantPanelMemoValue = useMemo<ChatPanelContextValue>(() => {
    return {
      conversationId: state.conversationId,
      createConversation,
      conversationStatus: state.status,
      updateConversationStatus: (status) => {
        setState((prevState) => {
          return {
            ...prevState,
            status,
          }
        })
      },
    }
  }, [state])
  useEffect(() => {
    if (!state.conversationId) {
      createConversation('Chat')
    }
  }, [state.conversationId])
  return (
    <AppLoadingLayout loading={!state.conversationId}>
      <ChatPanelContext.Provider value={chantPanelMemoValue}>
        <SidebarChatPanel />
      </ChatPanelContext.Provider>
    </AppLoadingLayout>
  )
}

export default SettingsDevTestPrompt
