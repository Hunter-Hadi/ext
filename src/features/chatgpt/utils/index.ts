import cloneDeep from 'lodash-es/cloneDeep'
import Browser from 'webextension-polyfill'

import {
  IChromeExtensionClientSendEvent,
  IOpenAIChatSendEvent,
} from '@/background/eventType'
import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { ISearchWithAISendEvent } from '@/features/searchWithAI/background/eventType'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'

export const pingDaemonProcess = async () => {
  const port = new ContentScriptConnectionV2()
  const result = await port.postMessage({
    event: 'Client_checkChatGPTStatus',
    data: {},
  })
  return result.success
}

export const pingUntilLogin = () => {
  const port = new ContentScriptConnectionV2()
  return new Promise<boolean>((resolve) => {
    console.log('start pingUntilLogin')
    let maxRetry = 120
    const delay = (t: number) =>
      new Promise((resolve) => setTimeout(resolve, t))
    const checkStatus = async () => {
      const result = await port.postMessage({
        event: 'Client_checkChatGPTStatus',
        data: {},
      })
      if (result.success) {
        if (result?.data?.status !== 'success') {
          maxRetry--
          if (maxRetry <= 0) {
            resolve(false)
          }
          await delay(1000)
          await checkStatus()
        } else {
          resolve(true)
        }
      }
    }
    checkStatus()
  })
}

export class ContentScriptConnectionV2 {
  private readonly runtime: 'client' | 'daemon_process' | 'shortcut'
  constructor(
    options: {
      openHeartbeat?: boolean
      heartbeatInterval?: number
      runtime?: 'client' | 'daemon_process' | 'shortcut'
    } = {},
  ) {
    console.log('[ContentScriptConnectionV2]: init')
    // 初始化运行环境
    this.runtime = options.runtime || 'client'
  }
  async postMessage(msg: {
    event:
      | IChromeExtensionClientSendEvent
      | IOpenAIChatSendEvent
      | IShortCutsSendEvent
      | ISearchWithAISendEvent
    data?: any
  }): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      return await Browser.runtime.sendMessage({
        id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
        event: msg.event,
        data: {
          ...msg.data,
          _RUNTIME_: this.runtime,
        },
      })
    } catch (e) {
      console.log(
        '[ContentScriptConnectionV2]: send error',
        e,
        '\ndata:\t',
        msg,
      )
      return {
        success: false,
        message: (e as any).message,
        data: {},
      }
    }
  }
  destroy() {
    console.log('[ContentScriptConnectionV2]: destroy')
  }
}

export const getAIProviderChatFiles = async (): Promise<IChatUploadFile[]> => {
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  const data = await port.postMessage({
    event: 'Client_chatGetFiles',
    data: {},
  })
  if (data.success) {
    return data.data.map((file: IChatUploadFile) => {
      const cloneFile = cloneDeep(file)
      // 减少数据量
      delete cloneFile.file
      return cloneFile
    })
  } else {
    return []
  }
}

/**
 * 是否为第三方AI provider
 * @param provider
 */
export const isThirdPartyAIProvider = (provider: IAIProviderType) => {
  const thirdPartyAIProvider: IAIProviderType[] = [
    'OPENAI',
    'OPENAI_API',
    'POE',
    'BARD',
    'BING',
  ]
  return thirdPartyAIProvider.includes(provider)
}
