import { useEffect, useMemo, useRef } from 'react'

import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'

const useUploadImagesAndSwitchToMaxAIVisionModel = () => {
  const { aiProviderUploadFiles, getCanUploadFiles } = useAIProviderUpload()
  const { currentConversationIdRef, createConversation, clientConversation } =
    useClientConversation()
  const { updateSidebarConversationType } = useSidebarSettings()
  const { currentAIProvider, currentAIProviderModel } = useAIProviderModels()

  // 由于 执行 updateAIProviderModel 会导致 aiProviderUploadFiles 更新，
  // 但是 aiProviderUploadFiles 会被缓存，所以这里使用 ref 来获取最新的 aiProviderUploadFiles
  const aiProviderUploadFilesRef = useRef(aiProviderUploadFiles)
  useEffect(() => {
    aiProviderUploadFilesRef.current = aiProviderUploadFiles
  }, [aiProviderUploadFiles])

  const createConversationResolveRef = useRef<(value: unknown) => void>()
  const updateConversationTypeResolveRef =
    useRef<(type: ISidebarConversationType) => void>()
  useEffect(() => {
    if (clientConversation?.id) {
      console.log(
        'clientConversation?.id',
        clientConversation?.id,
        clientConversation?.meta.AIModel,
        createConversationResolveRef.current,
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
        if (createConversationResolveRef.current) {
          createConversationResolveRef.current(true)
          createConversationResolveRef.current = undefined
        }
      }
    }
  }, [clientConversation?.id])
  useEffect(() => {
    if (clientConversation?.type) {
      if (updateConversationTypeResolveRef.current) {
        updateConversationTypeResolveRef.current(
          clientConversation.type as ISidebarConversationType,
        )
        updateConversationTypeResolveRef.current = undefined
      }
    }
  }, [clientConversation?.type])
  const uploadImagesAndSwitchToMaxAIVisionModel = async (
    imageFiles: File[],
  ) => {
    if (imageFiles.length === 0) {
      return
    }
    const currentConversationType = clientConversation?.type
    if (
      currentConversationType &&
      !['Chat', 'ContextMenu'].includes(currentConversationType)
    ) {
      await new Promise((resolve) => {
        updateConversationTypeResolveRef.current = (
          type: ISidebarConversationType,
        ) => {
          if (type === 'Chat') {
            resolve(true)
          }
        }
        updateSidebarConversationType('Chat')
      })
    }
    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve) => {
      if (createConversationResolveRef.current) {
        createConversationResolveRef.current(true)
      }
      createConversationResolveRef.current = resolve
      const conversation = currentConversationIdRef.current
        ? await ClientConversationManager.getConversation(
            currentConversationIdRef.current,
          )
        : undefined
      if (conversation && conversation.type === 'Chat') {
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
          await createConversation(
            conversation.type,
            'MAXAI_CLAUDE',
            'claude-3-haiku',
          )
          return
        } else {
          if (createConversationResolveRef.current) {
            createConversationResolveRef.current(true)
            createConversationResolveRef.current = undefined
          }
        }
      } else {
        await createConversation('Chat', 'MAXAI_CLAUDE', 'claude-3-haiku')
        return
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
