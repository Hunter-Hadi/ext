import orderBy from 'lodash-es/orderBy'
import Browser from 'webextension-polyfill'

import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import {
  maxAIRequestBodyAnalysisGenerator,
  maxAIRequestBodyDocChatGenerator,
  maxAIRequestBodyPromptActionGenerator,
  maxAIRequestBodySummaryChatGenerator,
  maxAIRequestBodySummaryGenerator,
} from '@/background/api/maxAIRequestBodyGenerator'
import {
  IMaxAIResponseOutputMessage,
  IMaxAIResponseParserMessage,
  maxAIRequestResponseErrorParser,
  maxAIRequestResponseJsonParser,
  maxAIRequestResponseStreamParser,
} from '@/background/api/maxAIRequestResponseParser'
import { IAIProviderType } from '@/background/provider/chat/ChatAdapter'
import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIChatGPTBackendBodyType,
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
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { isSummaryMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { backgroundConversationDB } from '@/features/indexed_db/conversations/background'
import {
  IAIResponseMessage,
  IChatMessage,
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
    onMessage: (message: IMaxAIResponseParserMessage) => void
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

  let backendAPI: IMaxAIChatGPTBackendAPIType = 'get_chatgpt_response'

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
  const chat_history: IMaxAIRequestHistoryMessage[] =
    question.meta?.historyMessages?.map((message) => {
      return chatMessageToMaxAIRequestMessage(message, true)
    }) || []
  const maxAIRequestMessage = chatMessageToMaxAIRequestMessage(question)
  const docId = conversationDetail?.meta?.docId
  let postBody: IMaxAIChatGPTBackendBodyType = Object.assign(
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
  // 这里判断一下，因为某些action是有设置固定值的，比如说smart query的时候
  if (typeof questionTemperature === 'number') {
    postBody.temperature = questionTemperature
    postBody.temperature = Math.min(postBody.temperature, 1.2)
  } else {
    delete postBody.temperature
  }
  // 是否是summary总结的message
  let summaryMessage: IAIResponseMessage | null = null
  // 当前正在输出的message
  let outputMessage: IChatMessage | null = null

  if (conversationDetail) {
    if (outputMessageId) {
      outputMessage =
        (await backgroundConversationDB.messages.get(outputMessageId)) || null
      if (outputMessage && isSummaryMessage(outputMessage)) {
        summaryMessage = outputMessage
      }
    }
    if (summaryMessage) {
      // summary总结
      const { backendAPI: summaryAPI, postBody: summaryBody } =
        await maxAIRequestBodySummaryGenerator(
          postBody,
          conversationDetail,
          summaryMessage,
          MaxAIPromptActionConfig,
        )
      backendAPI = summaryAPI
      postBody = summaryBody
    } else if (
      conversationDetail.type === 'Summary' &&
      !MaxAIPromptActionConfig
    ) {
      // summary问答，需要找到第一条summary总结的消息，去判断nav类型
      const messages = await backgroundConversationDB.messages
        .where('conversationId')
        .equals(conversationId)
        .and((message) => message.type === 'ai')
        .toArray()

      const firstMessage = orderBy(messages, ['created_at'], ['asc'])?.[0]

      const { backendAPI: summaryAPI, postBody: summaryBody } =
        await maxAIRequestBodySummaryChatGenerator(
          postBody,
          conversationDetail,
          firstMessage as IAIResponseMessage,
        )
      backendAPI = summaryAPI
      postBody = summaryBody
    }
    // 没有docId并且不是summaryMessage的情况下，需要发送系统提示
    if (!docId && !summaryMessage && conversationDetail.meta.systemPrompt) {
      // 插入到chat history的第一条
      postBody.chat_history?.unshift({
        role: 'system',
        content: [
          {
            type: 'text',
            text: conversationDetail.meta.systemPrompt,
          },
        ],
      })
    }
    if (docId && postBody.chat_history?.[0]?.role === 'ai') {
      // summary里面的chat history不包括页面的自动summary对话
      // 这个自动总结的对话会影响后续用户真正问的问题，我们在chat_with_document传chat history的时候把这两条去掉吧
      // 2023-09-21 @xiang.xu
      postBody.chat_history?.splice(0, 1)
    }
  }

  // 如果有MaxAIPromptActionConfig，就需要用/use_prompt_action
  // summary/v2接口支持传递prompt_input，目前在summary body里自行处理，后续此接口参数更改特殊化再单独拆出
  if (MaxAIPromptActionConfig && !summaryMessage) {
    backendAPI = 'use_prompt_action'
    delete postBody.doc_id
    postBody = await maxAIRequestBodyPromptActionGenerator(
      postBody,
      MaxAIPromptActionConfig,
    )
  }
  // 当前只有大文件聊天用到这个model，这里不判断docId是因为可能有docId了但是切换了第一条summary消息的nav
  if (backendAPI.startsWith('chat_with_document')) {
    const { backendAPI: docAPI, postBody: docBody } =
      maxAIRequestBodyDocChatGenerator(postBody)
    backendAPI = docAPI
    postBody = docBody
  }
  // 发送给api或者mixpanel的数据
  if (analytics) {
    postBody = await maxAIRequestBodyAnalysisGenerator(postBody, analytics)
  }
  await beforeSend?.()
  const controller = new AbortController()
  const signal = controller.signal
  setAbortController(controller)
  let hasError = false
  let isTokenExpired = false
  let responseMessage: IMaxAIResponseOutputMessage = {
    text: '',
    conversationId,
  }
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
        const parserMessage = maxAIRequestResponseErrorParser(
          result,
          conversationId,
        )
        hasError = true
        isTokenExpired = parserMessage.tokenExpired || false
        onMessage && onMessage(parserMessage)
        afterSend?.('error')
        return
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
          const streamMessage: IMaxAIResponseStreamMessage | null = JSON.parse(
            message as string,
          )
          const parserMessage = maxAIRequestResponseStreamParser(
            streamMessage,
            responseMessage,
            conversationDetail,
          )
          responseMessage = parserMessage.data
          onMessage && onMessage(parserMessage)
          log.debug('streaming on message', streamMessage)
        } catch (e) {
          log.error('parse message.data error: \t', e)
        }
      },
    })
      .then()
      .catch((err) => {
        log.info('streaming end error', err)
        const parserMessage = maxAIRequestResponseErrorParser(
          err,
          conversationId,
        )
        hasError = true
        isTokenExpired = parserMessage.tokenExpired || false
        onMessage && onMessage(parserMessage)
        afterSend?.('error')
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

      // TODO 目前多合一的接口目前没有status字段暂时也不会以json mode方式调用
      if (data.status === 'OK' && data.text) {
        const parserMessage = maxAIRequestResponseJsonParser(
          data,
          responseMessage,
          conversationDetail,
        )
        responseMessage = parserMessage.data
      } else {
        const parserMessage = maxAIRequestResponseErrorParser(
          data,
          conversationId,
        )
        hasError = true
        isTokenExpired = parserMessage.tokenExpired || false
        onMessage && onMessage(parserMessage)
        afterSend?.('error')
      }
    } catch (error: any) {
      const parserMessage = maxAIRequestResponseErrorParser(
        error,
        conversationId,
      )
      hasError = true
      isTokenExpired = parserMessage.tokenExpired || false
      onMessage && onMessage(parserMessage)
      afterSend?.('error')
      log.error('jsonMode error', error)
    }
  }
  if (hasError) {
    if (responseMessage.text === '') {
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
        data: responseMessage,
      })
    await afterSend?.('success')
  }
  if (isTokenExpired) {
    log.info('user token expired')
    await chromeExtensionLogout()
    await afterSend?.('token_expired')
  }
}
