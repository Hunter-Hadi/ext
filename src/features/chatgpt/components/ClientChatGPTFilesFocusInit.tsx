import isArray from 'lodash-es/isArray'
import React, { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { useCreateClientMessageListener } from '@/background/utils'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientUploadedFilesState } from '@/features/chatgpt/store'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const ClientChatGPTFilesFocusInit = () => {
  const { currentConversationId, currentConversationIdRef } =
    useClientConversation()
  const [clientUploadedState, setClientUploadedState] = useRecoilState(
    ClientUploadedFilesState,
  )

  const { blurDelay } = clientUploadedState

  const blurDelayRef = useRef(false)

  const setFiles = (files: IChatUploadFile[]) => {
    setClientUploadedState((preSate) => {
      return {
        ...preSate,
        files,
      }
    })
  }

  useEffect(() => {
    blurDelayRef.current = blurDelay
  }, [blurDelay])

  useEffect(() => {
    if (!currentConversationId) {
      return
    }
    const updateFiles = async () => {
      const result = await port.postMessage({
        event: 'Client_chatGetFiles',
        data: {
          conversationId: currentConversationId,
        },
      })
      if (isArray(result.data)) {
        setFiles(result.data)
      }
    }
    updateFiles()
    window.addEventListener('focus', updateFiles)
    return () => {
      window.removeEventListener('focus', updateFiles)
    }
  }, [currentConversationId])
  useCreateClientMessageListener(async (event, data) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenUploadFilesChange': {
        const { files, conversationId } = data
        console.log(
          'useAIProviderUpload [Client_listenUploadFilesChange]',
          files,
          conversationId,
        )
        if (conversationId !== currentConversationIdRef.current) {
          return {
            success: false,
            data: {},
            message: 'conversationId not match',
          }
        }
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

  return <></>
}

export default ClientChatGPTFilesFocusInit
