import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import {
  IUserCurrentPlan,
  useUserInfo,
} from '@/features/auth/hooks/useUserInfo'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { I18nextKeysType } from '@/i18next'

export interface IAIMessageModelSuggestionsProps {
  AIMessage: IAIResponseMessage
}

export interface IConversationSuggestAIModel {
  title: string
  value: string
  description?: I18nextKeysType
}

/**
 * AI Provider 的引导规则
 * @inheritdoc - https://ikjt09m6ta.larksuite.com/docx/WLuqdWQRPoYSBcxra8iuFps4sdS
 * @param userPlan
 * @param conversationAIModel
 */
const getAIModels = (
  userPlan: IUserCurrentPlan,
  conversationAIModel: string,
) => {
  const userRoleType = userPlan.name
  const GPT_4O: IConversationSuggestAIModel = {
    title: 'gpt-4o',
    value: 'gpt-4o',
    description: 'client:art__model__dalle3__description',
  }
  const CLAUDE_3_OPUS: IConversationSuggestAIModel = {
    title: 'claude-3-opus',
    value: 'claude-3-opus',
    description: 'client:art__model__dalle3__description',
  }
  if (userRoleType === 'elite') {
    if (
      ['claude-3-opus', 'gpt-4', MAXAI_CHATGPT_MODEL_GPT_4_TURBO].includes(
        conversationAIModel,
      )
    ) {
      return [GPT_4O]
    }
  } else if (userRoleType === 'pro') {
    if (conversationAIModel !== CLAUDE_3_OPUS.value) {
      return [CLAUDE_3_OPUS]
    }
  } else {
    if (conversationAIModel !== GPT_4O.value) {
      return [GPT_4O]
    }
  }
  return []
}

const AIMessageModelSuggestions: FC<IAIMessageModelSuggestionsProps> = (
  props,
) => {
  const { AIMessage } = props
  const { currentUserPlan, loading } = useUserInfo()
  const { currentSidebarConversationType, clientConversation } =
    useClientConversation()
  const messageAIModel = AIMessage.originalMessage?.metadata?.AIModel || ''
  const memoConfig = useMemo(() => {
    const isLastMessage =
      AIMessage.messageId === clientConversation?.lastMessageId
    if (
      currentSidebarConversationType !== 'Chat' ||
      loading ||
      !isLastMessage
    ) {
      return null
    }
    const conversationModel = clientConversation?.meta.AIModel || ''
    const models = getAIModels(currentUserPlan, conversationModel)
    const suggestions = models.filter((model) => model.value !== messageAIModel)
    const ctaButton = null
    // 当这条消息的AIModel不是当前会话的AIModel时，显示starts with AIModel的按钮
    if (messageAIModel && messageAIModel !== conversationModel) {
    }
  }, [
    clientConversation,
    currentSidebarConversationType,
    loading,
    currentUserPlan,
    messageAIModel,
  ])
  if (!memoConfig) {
    return null
  }
  return (
    <Stack direction={'row'} alignItems={'center'}>
      <Divider
        orientation='vertical'
        flexItem
        sx={{
          mx: 0.5,
        }}
      />
      <AIModelIcons aiModelValue={messageAIModel} />
    </Stack>
  )
}
export default AIMessageModelSuggestions
