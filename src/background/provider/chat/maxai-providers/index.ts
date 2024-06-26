import Browser from 'webextension-polyfill'

import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import {
  maxAIRequestBodyAnalysisGenerator,
  maxAIRequestBodyPromptActionGenerator,
} from '@/background/api/maxAIRequestBodyGenerator'
import { IAIProviderType } from '@/background/provider/chat/ChatAdapter'
import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIChatMessageContent,
  IMaxAIRequestHistoryMessage,
  IMaxAIResponseStreamMessage,
  MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
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
  IChatUploadFile,
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
  const conversationDetail = await ConversationManager.getConversationById(
    conversationId,
  )
  let backendAPI: IMaxAIChatGPTBackendAPIType = 'get_chatgpt_response'
  const chat_history: IMaxAIRequestHistoryMessage[] = []
  question.meta?.historyMessages?.forEach((message) => {
    chat_history.push(chatMessageToMaxAIRequestMessage(message, true))
  })
  const maxAIRequestMessage = chatMessageToMaxAIRequestMessage(question)
  const docId = conversationDetail?.meta?.docId
  let postBody: {
    message_content?: IMaxAIChatMessageContent[]
    chat_history?: IMaxAIRequestHistoryMessage[]
    chrome_extension_version: string
    model_name: string
    prompt_id: string
    prompt_name: string
    streaming: boolean
    temperature?: number
    doc_id?: string
    response_in_json?: boolean
    // text to image
    prompt?: string
    style?: string
    size?: string
    n?: number
  } = Object.assign(
    {
      chat_history,
      message_content: maxAIRequestMessage.content,
      chrome_extension_version: APP_VERSION,
      model_name: AIModel,
      prompt_id: contextMenu?.id ? contextMenu.id : 'chat',
      prompt_name: contextMenu?.text ? contextMenu.text : 'chat',
      /**
       * MARK: 将 OpenAI API的温度控制加一个最大值限制：1.6 - 2023-08-25 - @huangsong
       * 将 OpenAI API的温度控制加一个最大值限制：1.2 - 2023-10-9 - @huangsong
       * */
      temperature: 1,
    },
    docId ? { doc_id: docId } : {},
    isEnabledJsonMode
      ? { response_in_json: true, streaming: false }
      : { streaming: true },
  )
  // 隐藏temperature的设置，默认值由后端去控制 - 2024-05-21 - @tongda
  // 这里判断一下，因为某些action是有设置固定值的，比如说smart query的时候
  if (typeof questionTemperature === 'number') {
    postBody.temperature = questionTemperature
    postBody.temperature = Math.min(postBody.temperature, 1.2)
  }
  // TODO: AI provider -> provider_api
  // TODO: switch cases AIProvider去决定backend_api, temperature等信息
  switch (AIProvider) {
    case 'USE_CHAT_GPT_PLUS': {
      backendAPI = 'get_chatgpt_response'
      const AIProviderConfig = await getAIProviderSettings(AIProvider)
      postBody.temperature = AIProviderConfig?.temperature || 1
      break
    }
    case 'MAXAI_CLAUDE': {
      backendAPI = 'get_claude_response'
      const AIProviderConfig = await getAIProviderSettings(AIProvider)
      postBody.temperature = AIProviderConfig?.temperature || 1
      // claude search answer下不传递chat_history，否则会触发claude的报错 - 2024-05-30 - @xianhui
      if (
        backendAPI === 'get_claude_response' &&
        postBody.prompt_name === '[Search] answer'
      ) {
        postBody.chat_history = []
      }
      break
    }
    case 'MAXAI_GEMINI': {
      backendAPI = 'get_gemini_response'
      const AIProviderConfig = await getAIProviderSettings(AIProvider)
      postBody.temperature = AIProviderConfig?.temperature || 1
      // NOTE: gemini的理解能力不行，需要把Human的回答过滤掉掉连续的
      if (chat_history.length > 0) {
        // 从后往前过滤连续的human
        for (let i = chat_history.length - 1; i >= 0; i--) {
          if (chat_history[i].role === 'human') {
            if (chat_history[i - 1]?.role === 'human') {
              chat_history.splice(i, 1)
            }
          }
        }
      }
      break
    }
    case 'MAXAI_FREE': {
      backendAPI = 'get_freeai_chat_response'
      break
    }
    case 'MAXAI_DALLE': {
      // 如果能找到system的对话，就是自然语言转成生成图片的prompt
      if (chat_history.find((history) => history.role === 'system')) {
        backendAPI = 'get_chatgpt_response'
        postBody.streaming = false
        delete postBody.response_in_json
        postBody.model_name = MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO
      } else {
        // 文生图
        backendAPI = 'get_image_generate_response'
        const userConfig = await getAIProviderSettings('MAXAI_DALLE')
        postBody.prompt = postBody.message_content?.[0]?.text || ''
        postBody.style = userConfig?.contentType || 'vivid'
        postBody.size =
          userConfig?.resolution?.length === 2
            ? `${userConfig.resolution[0]}x${userConfig.resolution[1]}`
            : `1024x1024`
        postBody.n = userConfig?.generateCount || 1
        delete postBody.message_content
        delete postBody.chat_history
      }
      break
    }
  }
  // 隐藏temperature的设置，默认值由后端去控制 - 2024-05-21 - @tongda
  delete postBody.temperature
  // chat_with_document的情况
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
      // 插入到chat history的第一条
      chat_history.unshift({
        role: 'system',
        content: [
          {
            type: 'text',
            text: conversationDetail.meta.systemPrompt,
          },
        ],
      })
    }
    if (isFirstSummaryMessage) {
      // summary里面的chat history不包括页面的自动summary对话
      // 这个自动总结的对话会影响后续用户真正问的问题，我们在chat_with_document传chat hisotry的时候把这两条去掉吧
      // 2023-09-21 @xiang.xu
      chat_history.splice(0, 1)
    }
    // 当前只有大文件聊天用到这个model
    if (backendAPI === 'chat_with_document') {
      if (MaxAIPromptActionConfig) {
        delete postBody.doc_id
      } else {
        postBody.model_name = 'gpt-3.5-turbo-16k'
        if (
          postBody.prompt_id === postBody.prompt_name &&
          postBody.prompt_id === 'chat'
        ) {
          postBody.prompt_id = 'summary_chat'
          postBody.prompt_name = 'summary_chat'
        }
        const messageContent = postBody.message_content?.find(
          (content) => content.type === 'text',
        )
        const messageContentText = messageContent?.text || ''
        postBody.message_content = messageContentText as any
        // 大文件聊天的接口不支持新的message结构，换成老的 - @xiang.xu - 2024-01-15
        postBody.chat_history = postBody.chat_history?.map((history) => {
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
  await beforeSend?.()
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
  if (backendAPI === 'get_image_generate_response') {
    try {
      const result = await fetch(
        `${APP_USE_CHAT_GPT_API_HOST}/gpt/get_image_generate_response`,
        {
          method: 'POST',
          signal,
          headers: backgroundRequestHeadersGenerator.getTaskIdHeaders(taskId, {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
          }),
          body: JSON.stringify(postBody),
        },
      ).then((res) => res.json())
      const userConfig = await getAIProviderSettings(AIProvider)
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
        afterSend?.('success')
        return
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
          afterSend?.('error')
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
          afterSend?.('error')
          return
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
      afterSend?.('error')
      return
    }
  } else if (postBody.streaming) {
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
            promptTextLength: postBody.message_content?.length,
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
