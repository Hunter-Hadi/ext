import Browser from 'webextension-polyfill'

import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import {
  maxAIRequestBodyAnalysisGenerator,
  maxAIRequestBodyPromptActionGenerator,
} from '@/background/api/maxAIRequestBodyGenerator'
import { IAIProviderType } from '@/background/provider/chat/ChatAdapter'
import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIRequestHistoryMessage,
  IMaxAIResponseStreamMessage,
} from '@/background/src/chat/UseChatGPTChat/types'
import {
  chatMessageToMaxAIRequestMessage,
  getAIProviderSettings,
} from '@/background/src/chat/util'
import ConversationManager from '@/background/src/chatConversations'
import { chromeExtensionLogout } from '@/background/utils'
import {
  AI_PROVIDER_MAP,
  APP_USE_CHAT_GPT_API_HOST,
  APP_VERSION,
} from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { combinedPermissionSceneType } from '@/features/auth/utils/permissionHelper'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { backgroundConversationDB } from '@/features/indexed_db/conversations/background'
import {
  IAIResponseOriginalMessage,
  IUserChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import Log from '@/utils/Log'
import { backgroundSendMaxAINotification } from '@/utils/sendMaxAINotification/background'

export type IMaxAIAskQuestionFunctionType = (
  taskId: string,
  sender: Browser.Runtime.MessageSender,
  question: IUserChatMessage,
  options: {
    AIProvider: IAIProviderType
    AIModel: string
    conversationId: string
    checkAuthStatus: () => Promise<boolean>
    onMessage: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
        originalMessage?: IAIResponseOriginalMessage
      }
    }) => void
    beforeSend?: () => Promise<void>
    setAbortController: (controller: AbortController) => void
    afterSend?: (reason: 'token_expired' | 'success' | 'error') => Promise<void>
  },
) => Promise<void>

const log = new Log(
  'background/provider/chat/maxai-providers/UseChatGPTPlusChatProvider.ts',
)

export const maxAIAPISendQuestion: IMaxAIAskQuestionFunctionType = async (
  taskId,
  sender,
  question,
  options,
) => {
  const {
    AIProvider,
    AIModel,
    conversationId,
    checkAuthStatus,
    onMessage,
    beforeSend,
    setAbortController,
    afterSend,
  } = options

  if (!(await checkAuthStatus())) {
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
    await afterSend?.('error')
    return
  }
  const {
    temperature: questionTemperature,
    isEnabledJsonMode,
    contextMenu,
    MaxAIPromptActionConfig,
    analytics,
    outputMessageId,
  } = question.meta || {}
  let backendAPI: IMaxAIChatGPTBackendAPIType = 'get_chatgpt_response'
  const chat_history: IMaxAIRequestHistoryMessage[] = []
  let temperature = undefined
  // 隐藏temperature的设置，默认值由后端去控制 - 2024-05-21 - @tongda
  // 这里判断一下，因为某些action是有设置固定值的，比如说smart query的时候
  if (typeof questionTemperature === 'number') {
    temperature = questionTemperature
    temperature = Math.min(temperature, 1.2)
  }
  // TODO: AI provider -> provider_api
  // TODO: switch cases AIProvider去决定backend_api, temperature等信息
  switch (AIProvider) {
    case 'USE_CHAT_GPT_PLUS': {
      backendAPI = 'get_chatgpt_response'
      const AIProviderConfig = await getAIProviderSettings(AIProvider)
      temperature = AIProviderConfig?.temperature || 1
      break
    }
    case 'MAXAI_CLAUDE': {
      backendAPI = 'get_claude_response'
      const AIProviderConfig = await getAIProviderSettings(AIProvider)
      temperature = AIProviderConfig?.temperature || 1
      break
    }
    case 'MAXAI_GEMINI': {
      backendAPI = 'get_gemini_response'
      const AIProviderConfig = await getAIProviderSettings(AIProvider)
      temperature = AIProviderConfig?.temperature || 1
      break
    }
    case 'MAXAI_FREE': {
      backendAPI = 'get_freeai_chat_response'
      break
    }
    case 'MAXAI_DALLE': {
      backendAPI = 'get_image_generate_response'
      break
    }
  }
  const conversationDetail = await ConversationManager.getConversationById(
    conversationId,
  )
  const docId = conversationDetail?.meta?.docId
  if (conversationDetail) {
    // 是否是summary类型的conversation的第一条总结的message
    let isFirstSummaryMessage = false
    if (outputMessageId) {
      const outputMessage = await backgroundConversationDB.messages.get(
        outputMessageId,
      )
      if (
        outputMessage &&
        isAIMessage(outputMessage) &&
        outputMessage.originalMessage?.metadata?.navMetadata?.key
      ) {
        isFirstSummaryMessage = true
      }
    }

    // 大文件聊天之前上传的上下文的documentId
    if (isFirstSummaryMessage) {
      backendAPI = 'get_summarize_response'
    } else if (docId) {
      backendAPI = 'chat_with_document'
    }
    // 没有docId或者isFirstSummaryMessage的情况下，需要发送系统提示
    if (
      (!docId || isFirstSummaryMessage) &&
      conversationDetail.meta.systemPrompt
    ) {
      chat_history.push({
        role: 'system',
        content: [
          {
            type: 'text',
            text: conversationDetail.meta.systemPrompt,
          },
        ],
      })
    }
    question.meta?.historyMessages?.forEach((message) => {
      chat_history.push(chatMessageToMaxAIRequestMessage(message, true))
    })
    if (isFirstSummaryMessage) {
      // summary里面的chat history不包括页面的自动summary对话
      // 这个自动总结的对话会影响后续用户真正问的问题，我们在chat_with_document传chat hisotry的时候把这两条去掉吧
      // 2023-09-21 @xiang.xu
      chat_history.splice(0, 1)
    }
  }
  const maxAIRequestMessage = chatMessageToMaxAIRequestMessage(question)
  await beforeSend?.()
  let postBody = Object.assign(
    {
      chat_history,
      message_content: maxAIRequestMessage.content,
      chrome_extension_version: APP_VERSION,
      model_name: AIModel,
      prompt_id: contextMenu?.id
        ? contextMenu.id
        : backendAPI === 'chat_with_document'
        ? 'summary_chat'
        : 'chat',
      prompt_name: contextMenu?.text
        ? contextMenu.text
        : backendAPI === 'chat_with_document'
        ? 'summary_chat'
        : 'chat',
      /**
       * MARK: 将 OpenAI API的温度控制加一个最大值限制：1.6 - 2023-08-25 - @huangsong
       * 将 OpenAI API的温度控制加一个最大值限制：1.2 - 2023-10-9 - @huangsong
       * 隐藏temperature的设置，默认值由后端去控制 - 2024-05-21 - @tongda
       * */
      // temperature,
    },
    docId ? { doc_id: docId } : {},
    isEnabledJsonMode
      ? { response_in_json: true, streaming: false }
      : { streaming: true },
  )
  // 当前只有大文件聊天用到这个model
  if (backendAPI === 'chat_with_document') {
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
            history.content.find((content) => content.type === 'text')?.text ||
            '',
          additional_kwargs: {},
        },
      } as any
    })
  }
  if (backendAPI === 'get_summarize_response') {
    // 后端会自动调整model
    delete (postBody as any).model_name
  }
  // 如果有MaxAIPromptActionConfig，就需要用/use_prompt_action
  if (MaxAIPromptActionConfig) {
    backendAPI = 'use_prompt_action'
    postBody = await maxAIRequestBodyPromptActionGenerator(
      postBody,
      MaxAIPromptActionConfig,
    )
  }
  if (analytics) {
    postBody = await maxAIRequestBodyAnalysisGenerator(postBody, analytics)
  }
  const controller = new AbortController()
  const signal = controller.signal
  setAbortController(controller)
  if (backendAPI === 'chat_with_document') {
    // 新接口
    backendAPI = 'chat_with_document/v2'
  }
  console.log('streaming start', postBody)
  // 后端会每段每段的给前端返回数据
  let messageResult = ''
  let hasError = false
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
        Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
      },
      body: JSON.stringify(postBody),
      onMessage: (message: string) => {
        try {
          const messageData: IMaxAIResponseStreamMessage | null = JSON.parse(
            message as string,
          )
          // 增强数据
          if (messageData?.streaming_status) {
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
                          title: 'Related',
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
                  conversationId,
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
          afterSend?.('error')
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
            afterSend?.('error')
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
          afterSend?.('error')
        } catch (e) {
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error:
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              data: { text: '', conversationId },
            })
          afterSend?.('error')
        }
      })
    log.info('streaming end success')
  } else {
    // 目前来说，能进到这里的一定是jsonMode
    try {
      const response = await fetch(
        `${APP_USE_CHAT_GPT_API_HOST}/gpt/${backendAPI}`,
        {
          method: 'POST',
          signal,
          headers: backgroundRequestHeadersGenerator.getTaskIdHeaders(taskId, {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
          }),
          body: JSON.stringify(postBody),
        },
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
        afterSend?.('error')
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
        afterSend?.('error')
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
      afterSend?.('error')
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
    await afterSend?.('error')
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
    await afterSend?.('success')
  }
  if (isTokenExpired) {
    log.info('user token expired')
    await chromeExtensionLogout()
    await afterSend?.('token_expired')
  }
}
