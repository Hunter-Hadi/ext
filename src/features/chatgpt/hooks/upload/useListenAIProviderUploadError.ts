import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { ClientUploadedFilesState } from '@/features/chatgpt/store'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'

const useListenAIProviderUploadError = () => {
  const { aiProviderRemoveFiles } = useAIProviderUpload()
  const [clientUploadedState] = useRecoilState(ClientUploadedFilesState)
  const { files } = clientUploadedState
  const { currentAIProvider } = useAIProviderModels()
  const { currentSidebarConversationMessages, currentSidebarConversationId } =
    useSidebarSettings()
  const isPushingMessageRef = useRef(false)
  useEffect(() => {
    const errorItem = files.find((item) => item.uploadStatus === 'error')
    if (errorItem) {
      isPushingMessageRef.current = true
      switch (currentAIProvider) {
        case 'OPENAI':
          {
            if (
              currentSidebarConversationId &&
              !listReverseFind(
                currentSidebarConversationMessages,
                (item) => item.messageId === errorItem.id,
              )
            ) {
              clientChatConversationModifyChatMessages(
                'add',
                currentSidebarConversationId,
                0,
                [
                  {
                    messageId: errorItem.id,
                    text:
                      errorItem.uploadErrorMessage ||
                      `File ${errorItem.fileName} upload error.`,
                    type: 'system',
                    meta: {
                      status:
                        errorItem.uploadErrorMessage ===
                        `Your previous upload didn't go through as the Code Interpreter was initializing. It's now ready for your file. Please try uploading it again.`
                          ? 'info'
                          : 'error',
                    },
                  } as ISystemChatMessage,
                ],
              )
                .then()
                .catch()
                .finally(() => {
                  isPushingMessageRef.current = false
                })
            }
          }
          break
        default: {
          if (
            currentSidebarConversationId &&
            !listReverseFind(
              currentSidebarConversationMessages,
              (item) => item.messageId === errorItem.id,
            )
          ) {
            clientChatConversationModifyChatMessages(
              'add',
              currentSidebarConversationId,
              0,
              [
                {
                  messageId: errorItem.id,
                  text:
                    errorItem.uploadErrorMessage ||
                    `File ${errorItem.fileName} upload error.`,
                  type: 'system',
                  meta: {
                    status: 'error',
                  },
                } as ISystemChatMessage,
              ],
            )
              .then()
              .catch()
              .finally(() => {
                isPushingMessageRef.current = false
              })
          }
        }
      }
      aiProviderRemoveFiles([errorItem])
    }
  }, [files, currentAIProvider])
}

export default useListenAIProviderUploadError
