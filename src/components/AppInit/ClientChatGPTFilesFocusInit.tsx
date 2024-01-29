import isArray from 'lodash-es/isArray'
import React, { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { useCreateClientMessageListener } from '@/background/utils'
import { ClientUploadedFilesState } from '@/features/chatgpt/store'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const ClientChatGPTFilesFocusInit = () => {
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
  useEffectOnce(() => {
    port
      .postMessage({
        event: 'Client_chatGetFiles',
        data: {},
      })
      .then((result) => {
        if (isArray(result.data)) {
          console.log('useAIProviderUpload [Client_chatGetFiles]', result.data)
          setFiles(result.data)
        }
      })
  })
  useCreateClientMessageListener(async (event, data) => {
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

  return <></>
}

export default ClientChatGPTFilesFocusInit
