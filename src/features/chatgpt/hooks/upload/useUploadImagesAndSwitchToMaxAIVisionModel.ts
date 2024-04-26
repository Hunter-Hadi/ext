import { useEffect, useMemo, useRef } from 'react'

import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const useUploadImagesAndSwitchToMaxAIVisionModel = () => {
  const { aiProviderUploadFiles, getCanUploadFiles } = useAIProviderUpload()
  const { createConversation, clientConversation } = useClientConversation()
  const { updateSidebarConversationType } = useSidebarSettings()
  const { currentAIProvider, currentAIProviderModel } = useAIProviderModels()

  // 由于 执行 updateAIProviderModel 会导致 aiProviderUploadFiles 更新，
  // 但是 aiProviderUploadFiles 会被缓存，所以这里使用 ref 来获取最新的 aiProviderUploadFiles
  const aiProviderUploadFilesRef = useRef(aiProviderUploadFiles)
  useEffect(() => {
    aiProviderUploadFilesRef.current = aiProviderUploadFiles
  }, [aiProviderUploadFiles])

  const resolveRef = useRef<(value: unknown) => void>()
  useEffect(() => {
    if (clientConversation?.id) {
      console.log(
        'clientConversation?.id',
        clientConversation?.id,
        clientConversation?.meta.AIModel,
        resolveRef.current,
        clientConversation.type === 'Chat' &&
          clientConversation?.meta?.AIModel &&
          [
            MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
            'claude-3-sonnet',
            'claude-3-opus',
            'claude-3-haiku',
            'gemini-pro',
          ].includes(clientConversation.meta.AIModel),
      )
      if (
        (clientConversation.type === 'Chat' ||
          clientConversation.type === 'ContextMenu') &&
        clientConversation?.meta?.AIModel &&
        [
          MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
          'claude-3-sonnet',
          'claude-3-opus',
          'claude-3-haiku',
          'gemini-pro',
        ].includes(clientConversation.meta.AIModel)
      ) {
        if (resolveRef.current) {
          resolveRef.current(true)
          resolveRef.current = undefined
        }
      }
    }
  }, [clientConversation?.id])
  const uploadImagesAndSwitchToMaxAIVisionModel = async (
    imageFiles: File[],
  ) => {
    if (imageFiles.length === 0) {
      return
    }
    const currentConversationType = clientConversation?.type
    if (
      !currentConversationType ||
      !['Chat', 'ContextMenu'].includes(currentConversationType)
    ) {
      updateSidebarConversationType('Chat')
    }
    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve) => {
      if (resolveRef.current) {
        resolveRef.current(true)
      }
      resolveRef.current = resolve
      if (clientConversation) {
        if (
          !clientConversation?.meta?.AIModel ||
          ![
            MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
            'claude-3-sonnet',
            'claude-3-opus',
            'claude-3-haiku',
            'gemini-pro',
          ].includes(clientConversation?.meta?.AIModel)
        ) {
          await createConversation(
            clientConversation.type,
            'MAXAI_CLAUDE',
            'claude-3-haiku',
          )
          return
        }
      } else {
        await createConversation('Chat', 'MAXAI_CLAUDE', 'claude-3-haiku')
        return
      }
      if (resolveRef.current) {
        resolveRef.current(true)
        resolveRef.current = undefined
      }
    })
    const canUploadFiles = await getCanUploadFiles(imageFiles)
    await aiProviderUploadFilesRef.current(
      await formatClientUploadFiles(canUploadFiles),
    )
  }
  const isMaxAIVisionModel = useMemo(() => {
    if (!currentAIProviderModel) {
      return false
    }
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
