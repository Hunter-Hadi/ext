import { AppSettingsState } from '@/store'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IChatUploadFile, ISystemChatMessage } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { useFocus } from '@/hooks/useFocus'
import isArray from 'lodash-es/isArray'
import { ChatGPTMessageState } from '@/features/gmail/store'
import { useCreateClientMessageListener } from '@/background/utils'
import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import cloneDeep from 'lodash-es/cloneDeep'

/**
 * AI Provider的上传文件处理
 */
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const useAIProviderUpload = () => {
  const [files, setFiles] = useState<IChatUploadFile[]>([])
  const appSettings = useRecoilValue(AppSettingsState)
  const updateChatMessage = useSetRecoilState(ChatGPTMessageState)
  const blurDelayRef = useRef(false)
  const AIProviderConfig = useMemo(() => {
    let isSupportedUpload = false
    if (appSettings.chatGPTProvider) {
      switch (appSettings.chatGPTProvider) {
        case 'OPENAI':
          {
            if (appSettings.currentModel === 'gpt-4-code-interpreter') {
              isSupportedUpload = true
            }
          }
          break
        default:
          break
      }
    }
    return {
      isSupportedUpload,
      currentModel: appSettings.currentModel,
      chatGPTProvider: appSettings.chatGPTProvider,
    }
  }, [appSettings.currentModel, appSettings.chatGPTProvider])
  const aiProviderUploadFiles = useCallback(
    async (newUploadFiles: IChatUploadFile[]) => {
      blurDelayRef.current = true
      const uploadingFiles = cloneDeep(newUploadFiles).map((item) => {
        item.uploadStatus = 'uploading'
        item.uploadProgress = 20
        return item
      })
      console.log('useAIProviderUpload [aiProviderUploadFiles]', uploadingFiles)
      setFiles(uploadingFiles)
      if (AIProviderConfig.isSupportedUpload) {
        switch (AIProviderConfig.chatGPTProvider) {
          case 'OPENAI':
            {
              // 确保/pages/chatgpt/codeInterpreter.ts正确的注入了
              await port.postMessage({
                event: 'Client_chatUploadFiles',
                data: {
                  files: uploadingFiles,
                },
              })
            }
            break
          default:
            break
        }
      }
      setTimeout(() => {
        blurDelayRef.current = false
      }, 1000)
    },
    [AIProviderConfig],
  )
  const aiProviderRemoveFiles = useCallback(
    async (files: IChatUploadFile[]) => {
      if (AIProviderConfig.isSupportedUpload) {
        const result = await port.postMessage({
          event: 'Client_chatRemoveFiles',
          data: {
            files,
          },
        })
        console.log('useAIProviderUpload [Client_chatRemoveFiles]', result.data)
        setFiles(result.data || [])
        return result.success
        return false
      }
      return false
    },
    [AIProviderConfig],
  )
  useEffect(() => {
    const errorItem = files.find((item) => item.uploadStatus === 'error')
    if (errorItem) {
      updateChatMessage((old) => {
        let isContainsError = false
        for (let i = 0; i < old.length; i++) {
          if (old[i].messageId === errorItem.id) {
            isContainsError = true
            break
          }
        }
        if (isContainsError) {
          return old
        }
        return old.concat({
          messageId: errorItem.id,
          text:
            errorItem.uploadErrorMessage ||
            `${errorItem.fileName} upload error`,
          type: 'system',
          extra: {
            status: 'error',
          },
        } as ISystemChatMessage)
      })
      aiProviderRemoveFiles([errorItem])
    }
  }, [files])
  useFocus(() => {
    port
      .postMessage({
        event: 'Client_chatGetFiles',
        data: {},
      })
      .then((result) => {
        if (blurDelayRef.current) {
          return
        }
        if (isArray(result.data)) {
          console.log('useAIProviderUpload [Client_chatGetFiles]', result.data)
          setFiles(result.data)
        }
      })
  })
  useCreateClientMessageListener(async (event, data, sender) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenUploadFilesChange': {
        const { files } = data
        console.log(
          'useAIProviderUpload [Client_listenUploadFilesChange]',
          files,
        )
        setFiles(files)
        return {
          success: true,
          data: {},
          message: '',
        }
      }
      default:
        break
    }
    return undefined
  })
  return {
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
    files,
  }
}
export default useAIProviderUpload
