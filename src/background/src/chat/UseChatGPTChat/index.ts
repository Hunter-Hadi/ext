import isNumber from 'lodash-es/isNumber'
import Browser from 'webextension-polyfill'

import maxAIBackgroundSafeFetch from '@/background/api/maxAIBackgroundSafeFetch'
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
  IMaxAIResponseStreamMessage,
  USE_CHAT_GPT_PLUS_MODELS,
} from '@/background/src/chat/UseChatGPTChat/types'
import { getAIProviderSettings } from '@/background/src/chat/util'
import { chromeExtensionLogout } from '@/background/utils'
import {
  AI_PROVIDER_MAP,
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  APP_VERSION,
} from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { combinedPermissionSceneType } from '@/features/auth/utils/permissionHelper'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { IConversationMeta } from '@/features/indexed_db/conversations/models/Conversation'
import {
  IAIResponseOriginalMessage,
  IUserMessageMetaType,
} from '@/features/indexed_db/conversations/models/Message'
import Log from '@/utils/Log'
import { backgroundSendMaxAINotification } from '@/utils/sendMaxAINotification/background'

const log = new Log('Background/Chat/UseChatGPTPlusChat')

class UseChatGPTPlusChat extends BaseChat {
  status: ConversationStatusType = 'success'
  private lastActiveTabId?: number
  private token?: string
  constructor() {
    super('UseChatGPTPlusChat')
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
  async checkTokenAndUpdateStatus() {
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
   * @param options.doc_id 大文件聊天之前上传的上下文的documentId
   * @param options.chat_history 聊天历史
   * @param options.backendAPI 后端api
   * @param options.streaming 是否流式
   * @param options.taskId 任务id
   */
  async askChatGPT(
    message_content: IMaxAIChatMessageContent[],
    options?: {
      taskId: string
      doc_id?: string
      streaming?: boolean
      chat_history?: IMaxAIRequestHistoryMessage[]
      backendAPI?: IMaxAIChatGPTBackendAPIType
      meta?: IUserMessageMetaType
    },
    onMessage?: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
        conversationMeta?: IConversationMeta
        originalMessage?: IAIResponseOriginalMessage
      }
    }) => void,
  ) {
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
    let backendAPI = options?.backendAPI || 'get_chatgpt_response'
    const {
      taskId,
      doc_id,
      streaming = true,
      chat_history = [],
      meta,
    } = options || {}
    const userConfig = await getAIProviderSettings('USE_CHAT_GPT_PLUS')
    const currentModel =
      this.conversation?.meta.AIModel ||
      userConfig!.model ||
      USE_CHAT_GPT_PLUS_MODELS[0].value
    this.clearFiles()
    let temperature: number | undefined = isNumber(userConfig?.temperature)
      ? userConfig!.temperature
      : 1
    // 隐藏temperature的设置，默认值由后端去控制 - 2024-05-21 - @tongda
    // 这里判断一下，因为某些action是有设置固定值的，比如说smart query的时候
    if (typeof meta?.temperature === 'number') {
      temperature = meta.temperature
      temperature = Math.min(temperature, 1.2)
    } else {
      temperature = undefined
    }
    let postBody = Object.assign(
      {
        chat_history,
        streaming,
        message_content,
        chrome_extension_version: APP_VERSION,
        model_name: currentModel,
        prompt_id: meta?.contextMenu?.id
          ? meta.contextMenu.id
          : backendAPI === 'chat_with_document'
          ? 'summary_chat'
          : 'chat',
        prompt_name: meta?.contextMenu?.text
          ? meta.contextMenu.text
          : backendAPI === 'chat_with_document'
          ? 'summary_chat'
          : 'chat',
        /**
         * MARK: 将 OpenAI API的温度控制加一个最大值限制：1.6 - 2023-08-25 - @huangsong
         * 将 OpenAI API的温度控制加一个最大值限制：1.2 - 2023-10-9 - @huangsong
         * 隐藏temperature的设置，默认值由后端去控制 - 2024-05-21 - @tongda
         * */
        temperature,
      },
      doc_id ? { doc_id } : {},
      meta?.isEnabledJsonMode
        ? { response_in_json: true, streaming: false }
        : {},
    )
    // 当前只有大文件聊天用到这个model
    if (backendAPI === 'chat_with_document') {
      // prompt action 不需要doc_id
      if (options?.meta?.MaxAIPromptActionConfig) {
        delete (postBody as any).doc_id
      } else {
        postBody.model_name = 'gpt-3.5-turbo-16k'
        const messageContent = postBody.message_content.find(
          (content) => content.type === 'text',
        )
        const messageContentText = messageContent?.text || ''
        postBody.message_content = messageContentText as any
        // 大文件聊天的接口不支持新的message结构，换成老的 - @xiang.xu - 2024-01-15
        postBody.chat_history = postBody.chat_history.map((history) => {
          // 老得结构
          // {
          //   type: 'human' | 'ai' | 'generic' | 'system' | 'function'
          //   data: {
          //     content: string
          //     additional_kwargs: {
          //       [key: string]: any
          //     }
          //   }
          // }
          return {
            type: history.role,
            data: {
              content:
                history.content.find((content) => content.type === 'text')
                  ?.text || '',
              additional_kwargs: {},
            },
          } as any
        })
      }
    }
    const isSummaryAPI =
      backendAPI === 'get_summarize_response' ||
      backendAPI.startsWith('summary/v2')
    if (isSummaryAPI) {
      // 后端会自动调整model
      delete (postBody as any).model_name
    }
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
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    if (backendAPI === 'chat_with_document') {
      // 新接口
      backendAPI = 'chat_with_document/v2'
    }
    log.info('streaming start', postBody)
    // 后端会每段每段的给前端返回数据
    let messageResult = ''
    let hasError = false
    let conversationId = this.conversation?.id || ''
    let conversationMeta: IConversationMeta | undefined
    let originalMessage: IAIResponseOriginalMessage | undefined
    let isTokenExpired = false
    if (postBody.streaming) {
      await fetchSSE(`${APP_USE_CHAT_GPT_API_HOST}/gpt/${backendAPI}`, {
        taskId,
        provider: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(postBody),
        onMessage: (message: string) => {
          try {
            const messageData: IMaxAIResponseStreamMessage | null = JSON.parse(
              message as string,
            )
            if (messageData?.conversation_id) {
              conversationId = messageData.conversation_id
            }
            // 增强数据
            if (messageData?.streaming_status) {
              if (messageData.doc_id !== undefined) {
                conversationMeta = {
                  ...conversationMeta,
                  docId: messageData.doc_id,
                }
              }
              if (messageData.text !== undefined) {
                if (messageData.need_merge) {
                  messageResult += messageData.text
                } else {
                  messageResult = messageData.text
                }
                originalMessage = {
                  ...originalMessage,
                  content: {
                    contentType: 'text',
                    text: messageResult,
                  },
                }
              }
              if (messageData.citations !== undefined) {
                switch (messageData.streaming_status) {
                  case 'start':
                  case 'in_progress':
                    // TODO loading状态
                    originalMessage = {
                      ...originalMessage,
                      metadata: {
                        ...originalMessage?.metadata,
                        sourceCitations: messageData.citations,
                      },
                    }
                    break
                  case 'complete':
                    originalMessage = {
                      ...originalMessage,
                      metadata: {
                        ...originalMessage?.metadata,
                        sourceCitations: messageData.citations,
                      },
                    }
                    break
                }
              }
              if (messageData.related !== undefined) {
                switch (messageData.streaming_status) {
                  case 'start':
                  case 'in_progress':
                    // TODO loading状态
                    originalMessage = {
                      ...originalMessage,
                      metadata: {
                        ...originalMessage?.metadata,
                        deepDive: {
                          title: {
                            title: ' ',
                            titleIcon: 'Loading',
                          },
                          value: '',
                        },
                      },
                    }
                    break
                  case 'complete':
                    originalMessage = {
                      ...originalMessage,
                      metadata: {
                        ...originalMessage?.metadata,
                        deepDive: {
                          title: {
                            title: 'Keep exploring',
                            titleIcon: 'Layers',
                          },
                          type: 'related',
                          value: messageData.related,
                        },
                      },
                    }
                    break
                }
              }
              onMessage &&
                onMessage({
                  type: 'message',
                  done: false,
                  error: '',
                  data: {
                    text: '',
                    conversationId,
                    conversationMeta,
                    originalMessage,
                  },
                })
            } else if (messageData?.text || messageData?.sources) {
              if (messageData.text) {
                messageResult += messageData.text
              }
              if (messageData.sources) {
                originalMessage = {
                  ...originalMessage,
                  metadata: {
                    ...originalMessage?.metadata,
                    sourceCitations: messageData.sources,
                  },
                }
              }
              onMessage &&
                onMessage({
                  type: 'message',
                  done: false,
                  error: '',
                  data: {
                    text: messageResult,
                    conversationId: conversationId,
                    originalMessage,
                  },
                })
            }
            log.debug('streaming on message', messageResult)
          } catch (e) {
            log.error('parse message.data error: \t', e)
          }
        },
      })
        .then()
        .catch((err) => {
          hasError = true
          log.info('streaming end error', err)
          if (
            err?.message === 'BodyStreamBuffer was aborted' ||
            err?.message === 'The user aborted a request.'
          ) {
            onMessage &&
              onMessage({
                type: 'error',
                error: 'manual aborted request.',
                done: true,
                data: { text: '', conversationId },
              })
            return
          }
          try {
            const error = JSON.parse(err.message || err)
            // 判断是不是用量卡点的报错
            const apiResponseSceneType = combinedPermissionSceneType(
              error?.msg,
              error?.meta?.model_type,
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
            }
            if (error?.code === 401) {
              isTokenExpired = true
            }
            log.error('sse error', err)
            onMessage &&
              onMessage({
                done: true,
                type: 'error',
                error:
                  error.message ||
                  error.detail ||
                  'Something went wrong, please try again. If this issue persists, contact us via email.',
                data: { text: '', conversationId },
              })
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
        })
      log.info('streaming end success')
    } else {
      // 目前来说，能进到这里的一定是jsonMode
      try {
        const response = await maxAIBackgroundSafeFetch(
          `${APP_USE_CHAT_GPT_API_HOST}/gpt/${backendAPI}`,
          {
            method: 'POST',
            signal,
            body: JSON.stringify(postBody),
          },
          taskId,
        )
        const data = await response.json()
        if (data.status === 'OK' && data.text) {
          messageResult = data.text
        } else {
          hasError = true
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error:
                data?.message ||
                data?.detail ||
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              data: { text: '', conversationId },
            })
        }
      } catch (error: any) {
        hasError = true
        if (
          error?.message === 'The user aborted a request.' ||
          error?.message === 'BodyStreamBuffer was aborted'
        ) {
          onMessage &&
            onMessage({
              type: 'error',
              error: 'manual aborted request.',
              done: true,
              data: { text: '', conversationId },
            })
          return
        }
        onMessage &&
          onMessage({
            done: true,
            type: 'error',
            error:
              error?.message ||
              'Something went wrong, please try again. If this issue persists, contact us via email.',
            data: { text: '', conversationId },
          })
        log.error('jsonMode error', error)
      }
    }
    if (hasError) {
      if (messageResult === '') {
        // HACK: 后端现在偶尔会返回空字符串，这里做个fallback
        backgroundSendMaxAINotification(
          'MAXAI_API',
          '[API] response empty string.',
          JSON.stringify(
            {
              model: postBody.model_name,
              promptTextLength: postBody.message_content.length,
            },
            null,
            2,
          ),
          {
            uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
          },
        )
      }
    } else {
      onMessage &&
        onMessage({
          done: true,
          type: 'message',
          error: '',
          data: {
            text: messageResult,
            conversationId,
            originalMessage,
          },
        })
    }
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
    // this.status = 'needAuth'
    // await this.updateClientStatus()
    this.active = false
  }
  private async getToken() {
    return await getMaxAIChromeExtensionAccessToken()
  }
}
export { UseChatGPTPlusChat }
