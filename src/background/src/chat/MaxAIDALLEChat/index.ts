import Browser from 'webextension-polyfill'

import { backgroundRequestHeaderGenerator } from '@/background/api/backgroundRequestHeaderGenerator'
import {
  maxAIRequestBodyAnalysisGenerator,
  maxAIRequestBodyPromptActionGenerator,
} from '@/background/api/maxAIRequestBodyGenerator'
import { ConversationStatusType } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIChatMessageContent,
  IMaxAIRequestHistoryMessage,
  MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
} from '@/background/src/chat/UseChatGPTChat/types'
import { getAIProviderSettings } from '@/background/src/chat/util'
import { chromeExtensionLogout } from '@/background/utils'
import {
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  APP_VERSION,
} from '@/constants'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { combinedPermissionSceneType } from '@/features/auth/utils/permissionHelper'
import {
  IChatUploadFile,
  IUserMessageMetaType,
} from '@/features/indexed_db/conversations/models/Message'
import Log from '@/utils/Log'

const log = new Log('Background/Chat/MaxAIDALLEChat')

class MaxAIDALLEChat extends BaseChat {
  status: ConversationStatusType = 'success'
  private lastActiveTabId?: number
  private token?: string
  constructor() {
    super('MaxAIDALLEChat')
    this.init()
  }
  private init() {
    log.info('init')
  }
  async preAuth() {
    this.active = true
    this.status = 'success'
    await this.updateClientConversationChatStatus()
    // await this.checkTokenAndUpdateStatus()
  }
  async auth(authTabId: number) {
    this.active = true
    this.lastActiveTabId = authTabId
    await this.checkTokenAndUpdateStatus()
    if (this.status === 'needAuth') {
      // 引导去登陆
      await Browser.tabs.create({
        active: true,
        url: APP_USE_CHAT_GPT_HOST,
      })
    }
    await this.updateClientConversationChatStatus()
  }
  private async checkTokenAndUpdateStatus() {
    const prevStatus = this.status
    this.token = await this.getToken()
    this.status = this.token ? 'success' : 'needAuth'
    if (prevStatus !== this.status) {
      log.info('checkTokenAndUpdateStatus', this.status, this.lastActiveTabId)
      // 本来要切回去chat页面,流程改了，不需要这个变量来切换了
      this.lastActiveTabId = undefined
    }
    await this.updateClientConversationChatStatus()
  }

  /**
   * 获取回答
   * @param message_content 问题
   * @param options
   * @param onMessage 回调
   * @param options.regenerate 是否重新生成
   * @param options.taskId 任务id
   */
  async askChatGPT(
    message_content: IMaxAIChatMessageContent[],
    options?: {
      taskId: string
      regenerate?: boolean
      chat_history?: IMaxAIRequestHistoryMessage[]
      meta?: IUserMessageMetaType
    },
    onMessage?: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
      }
    }) => void,
  ) {
    let backendAPI: IMaxAIChatGPTBackendAPIType = 'get_image_generate_response'
    await this.checkTokenAndUpdateStatus()
    if (this.status !== 'success') {
      onMessage &&
        onMessage({
          type: 'error',
          done: true,
          error: 'Your session has expired. Please log in.',
          data: {
            text: '',
            conversationId: '',
          },
        })
      return
    }
    const { taskId, meta, chat_history } = options || {}
    const conversationId = this.conversation?.id || ''
    const userConfig = await getAIProviderSettings('MAXAI_DALLE')
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    try {
      if (chat_history?.find((history) => history.role === 'system')) {
        backendAPI = 'get_chatgpt_response'
        let postBody = {
          streaming: false,
          chat_history,
          message_content,
          chrome_extension_version: APP_VERSION,
          model_name: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
          prompt_id: meta?.contextMenu?.id || 'chat',
          prompt_name: meta?.contextMenu?.text || 'chat',
        }
        // 如果有meta.MaxAIPromptActionConfig，就需要用/use_prompt_action
        if (options?.meta?.MaxAIPromptActionConfig) {
          backendAPI = 'use_prompt_action'
          postBody = await maxAIRequestBodyPromptActionGenerator(
            postBody,
            options.meta.MaxAIPromptActionConfig,
          )
        }
        if (options?.meta?.analytics) {
          postBody = await maxAIRequestBodyAnalysisGenerator(
            postBody,
            options.meta.analytics,
          )
        }
        // 说明需要转换自然语言为prompt
        const result = await fetch(
          `${APP_USE_CHAT_GPT_API_HOST}/gpt/${backendAPI}`,
          {
            method: 'POST',
            signal,
            headers: backgroundRequestHeaderGenerator.getTaskIdHeader(taskId, {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            }),
            body: JSON.stringify(postBody),
          },
        ).then((res) => res.json())
        if (result.status === 'OK') {
          onMessage?.({
            done: true,
            type: 'message',
            error: '',
            data: {
              text: result.text || message_content?.[0]?.text || '',
              conversationId,
            },
          })
        } else {
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error:
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              data: { text: '', conversationId },
            })
        }
      } else {
        const result = await fetch(
          `${APP_USE_CHAT_GPT_API_HOST}/gpt/get_image_generate_response`,
          {
            method: 'POST',
            signal,
            headers: backgroundRequestHeaderGenerator.getTaskIdHeader(taskId, {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            }),
            body: JSON.stringify({
              prompt: message_content?.[0]?.text || '',
              chrome_extension_version: APP_VERSION,
              model_name:
                this.conversation?.meta.AIModel ||
                userConfig!.model ||
                MAXAI_IMAGE_GENERATE_MODELS[0].value,
              prompt_id: meta?.contextMenu?.id || 'chat',
              prompt_name: meta?.contextMenu?.text || 'chat',
              style: userConfig?.contentType || 'vivid',
              size:
                userConfig?.resolution?.length === 2
                  ? `${userConfig.resolution[0]}x${userConfig.resolution[1]}`
                  : `1024x1024`,
              n: userConfig?.generateCount || 1,
            }),
          },
        ).then((res) => res.json())
        if (result.status === 'OK' && result.data?.length) {
          const resultJson = JSON.stringify(
            result.data
              .map((imageData: { webp_url: string; png_url: string }) => {
                //maxaistorage.s3.amazonaws.com/dalle-generations/4d5a37a3-ed17-456e-a452-a52eeb88e280.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4NYXT5H4KLMTHHPR%2F20240123%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240123T061145Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=7c001032878a178bfeb27c698e7abbdc0e21fd5f4fbbe89de51a511a453856fa
                //maxaistorage.s3.amazonaws.com/dalle-generations/4d5a37a3-ed17-456e-a452-a52eeb88e280.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4NYXT5H4KLMTHHPR%2F20240123%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240123T061145Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=c7ab7b517430c38c41c6c997e46b4f647ffe8109187c41b4c57aff7067faf3c0
                const fileId =
                  imageData.webp_url.split('/').pop()?.split('?')?.[0] ||
                  imageData.png_url.split('/').pop()?.split('?')?.[0]
                if (!fileId) {
                  return null
                }
                const file: IChatUploadFile = {
                  id: fileId,
                  fileName: `${fileId}.webp`,
                  fileType: 'image/webp',
                  fileSize: 0,
                  uploadedFileId: fileId,
                  uploadedUrl: imageData.webp_url || imageData.png_url || '',
                  uploadStatus: 'success',
                  uploadProgress: 100,
                  meta: userConfig,
                }
                return file
              })
              .filter((file: IChatUploadFile | null) => file),
          )
          onMessage?.({
            done: true,
            type: 'message',
            error: '',
            data: {
              text: resultJson,
              conversationId,
            },
          })
        } else {
          // 判断是不是用量卡点的报错
          const apiResponseSceneType = combinedPermissionSceneType(
            result?.msg,
            result?.meta?.model_type,
          )
          if (apiResponseSceneType) {
            onMessage &&
              onMessage({
                type: 'error',
                error: apiResponseSceneType,
                done: true,
                data: { text: '', conversationId },
              })
            return
          } else {
            onMessage &&
              onMessage({
                done: true,
                type: 'error',
                error:
                  result?.detail ??
                  'Something went wrong, please try again. If this issue persists, contact us via email.',
                data: { text: '', conversationId },
              })
          }
        }
      }
    } catch (e) {
      onMessage &&
        onMessage({
          done: true,
          type: 'error',
          error:
            'Something went wrong, please try again. If this issue persists, contact us via email.',
          data: { text: '', conversationId },
        })
    }
    const isTokenExpired = false
    if (isTokenExpired) {
      log.info('user token expired')
      this.status = 'needAuth'
      await chromeExtensionLogout()
      await this.updateClientConversationChatStatus()
    }
  }
  async abortTask(taskId: string) {
    if (this.taskList[taskId]) {
      this.taskList[taskId]()
      delete this.taskList[taskId]
      return true
    }
    return true
  }
  async destroy() {
    log.info('destroy')
    this.status = 'needAuth'
    // await this.updateClientStatus()
    this.active = false
  }
  private async getToken() {
    return await getMaxAIChromeExtensionAccessToken()
  }
}
export { MaxAIDALLEChat }
