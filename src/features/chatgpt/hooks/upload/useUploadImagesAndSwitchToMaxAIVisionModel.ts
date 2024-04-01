import { useEffect, useMemo, useRef } from 'react'

import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const useUploadImagesAndSwitchToMaxAIVisionModel = () => {
  const {
    files,
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
  } = useAIProviderUpload()
  const { createConversation } = useClientConversation()
  const {
    updateSidebarConversationType,
    currentSidebarConversationType,
    sidebarSettings,
  } = useSidebarSettings()
  const { updateAIProviderModel, currentAIProvider, currentAIProviderModel } =
    useAIProviderModels()

  // 由于 执行 updateAIProviderModel 会导致 aiProviderUploadFiles 更新，
  // 但是 aiProviderUploadFiles 会被缓存，所以这里使用 ref 来获取最新的 aiProviderUploadFiles
  const aiProviderUploadFilesRef = useRef(aiProviderUploadFiles)
  useEffect(() => {
    aiProviderUploadFilesRef.current = aiProviderUploadFiles
  }, [aiProviderUploadFiles])

  const uploadImagesAndSwitchToMaxAIVisionModel = async (
    imageFiles: File[],
  ) => {
    if (imageFiles.length === 0) {
      return
    }
    if (currentSidebarConversationType !== 'Chat') {
      await updateSidebarConversationType('Chat')
    }
    if (sidebarSettings?.chat?.conversationId) {
      const conversation = await clientGetConversation(
        sidebarSettings.chat.conversationId,
      )
      if (
        !conversation?.meta?.AIModel ||
        ![
          MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
          'claude-3-sonnet',
          'claude-3-opus',
          'claude-3-haiku',
          'gemini-pro',
        ].includes(conversation?.meta?.AIModel)
      ) {
        await updateAIProviderModel(
          'USE_CHAT_GPT_PLUS',
          MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
        )
        await createConversation('Chat')
      }
    } else {
      await updateAIProviderModel(
        'USE_CHAT_GPT_PLUS',
        MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      )
      await createConversation('Chat')
    }
    const existFilesCount = files?.length || 0
    const maxFiles = AIProviderConfig?.maxCount || 1
    const canUploadCount = maxFiles - existFilesCount
    if (canUploadCount === 0) {
      await aiProviderRemoveFiles(files.slice(0, imageFiles.length))
    }
    await aiProviderUploadFilesRef.current(
      await formatClientUploadFiles(
        imageFiles.slice(0, maxFiles),
        AIProviderConfig?.maxFileSize,
      ),
    )
  }
  const isMaxAIVisionModel = useMemo(() => {
    if (
      currentAIProvider === 'USE_CHAT_GPT_PLUS' &&
      currentAIProviderModel === MAXAI_CHATGPT_MODEL_GPT_4_TURBO
    ) {
      return true
    }
    if (currentAIProvider === 'MAXAI_CLAUDE') {
      return ['claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku'].includes(
        currentAIProviderModel,
      )
    }
    if (currentAIProvider === 'MAXAI_GEMINI') {
      return ['gemini-pro'].includes(currentAIProviderModel)
    }
    return false
  }, [currentAIProvider, currentAIProviderModel])

  return {
    isMaxAIVisionModel,
    uploadImagesAndSwitchToMaxAIVisionModel,
  }
}

export default useUploadImagesAndSwitchToMaxAIVisionModel
