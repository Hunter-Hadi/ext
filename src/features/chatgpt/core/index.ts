import { v4 as uuidV4 } from 'uuid'

import { getAIProviderSettings } from '@/background/src/chat/util'
import { IChatGPTModelType, IChatGPTPluginType } from '@/background/utils'
import { AI_PROVIDER_MAP } from '@/constants'
import { chromeExtensionArkoseTokenGenerator } from '@/features/chatgpt/core/chromeExtensionArkoseTokenGenerator'
import generateSentinelChatRequirementsToken from '@/features/chatgpt/core/generateSentinelChatRequirementsToken'
import { mappingToMessages } from '@/features/chatgpt/core/util'

import { fetchSSE } from './fetch-sse'

export interface IChatGPTAnswer {
  text: string
  messageId: string
  conversationId: string
  parentMessageId?: string
}
export type Event =
  | {
      type: 'answer'
      data: IChatGPTAnswer
    }
  | {
      type: 'done'
    }
  | {
      type: 'error'
      data: {
        message: string
        detail: string
      }
    }

export interface GenerateAnswerParams {
  messageId?: string
  parentMessageId?: string
  prompt: string
  onEvent: (event: Event) => void
  signal?: AbortSignal
  meta?: any
}
export interface IChatGPTConversationRawMappingData {
  id: string
  parent: string
  children: string[]
  message?: {
    id: string
    author: {
      role: string
      metadata: {
        [key: string]: any
      }
    }
    create_time: number
    content: {
      content_type: string
      parts: string[]
    }
    end_turn: boolean
    weight: number
    metadata: {
      model_slug: string
      finish_details: {
        type: string
        stop: string
      }
    }
    recipient: string
  }
}

export interface IChatGPTConversationRaw {
  title: string
  // 当前的node，可以理解为conversation最后的messageId
  current_node: string
  mapping: {
    [key: string]: IChatGPTConversationRawMappingData
  }
  moderation_results: any[]
  create_time: number
  update_time: number
}

export interface IChatGPTConversation {
  id: string
  conversationId?: string
}

export interface IChatGPTDaemonProcess {
  conversations: ChatGPTConversation[]
  token?: string
  models: IChatGPTModelType[]
  plugins: IChatGPTPluginType[]
  createConversation: (
    conversationId?: string,
    selectedModel?: string,
  ) => Promise<ChatGPTConversation | undefined>
  getAllModels: () => Promise<IChatGPTModelType[]>
  getAllPlugins: () => Promise<IChatGPTPluginType[]>
  getConversation: (conversationId: string) => ChatGPTConversation | undefined
  getConversations: () => ChatGPTConversation[]
  closeConversation: (conversationId: string) => Promise<boolean>
  addAbortWithMessageId: (messageId: string, abortFn: () => void) => void
  removeAbortWithMessageId: (messageId: string) => void
  abortWithMessageId: (messageId: string) => void
  removeCacheConversation: () => Promise<void>
}

const CHAT_GPT_PROXY_HOST = `https://chat.openai.com`
const CHAT_TITLE = 'MaxAI.me'

const chatGptRequest = (
  token: string,
  method: string,
  path: string,
  data?: unknown,
) => {
  return fetch(`${CHAT_GPT_PROXY_HOST}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}
export const getConversationDownloadFile = async (params: { uuid: string }) => {
  // https://chat.openai.com/backend-api/files/181e27fe-1a7b-4d14-ab17-68f70582ab30/download
  const { uuid } = params
  try {
    const token = await getChatGPTAccessToken()
    const resp = await chatGptRequest(
      token,
      'GET',
      `/backend-api/files/${uuid}/download`,
    )
    const data = await resp.json()
    return {
      success: true,
      data: data?.download_url,
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      data: '',
    }
  }
}
export const getConversationFileUrl = async (params: {
  conversationId: string
  message_id: string
  sandbox_path: string
}) => {
  const { conversationId, message_id, sandbox_path } = params
  const fallbackUrl = `https://chat.openai.com/c/${conversationId}`
  // https://chat.openai.com/backend-api/conversation/647c720d-9eeb-4986-8b89-112098f107b6/interpreter/download?message_id=895986d6-bd39-404e-a485-923cdb5c7476&sandbox_path=%2Fmnt%2Fdata%2Fclip_3s.mp4
  try {
    const token = await getChatGPTAccessToken()
    const resp = await chatGptRequest(
      token,
      'GET',
      `/backend-api/conversation/${conversationId}/interpreter/download?message_id=${message_id}&sandbox_path=${sandbox_path}`,
    )
    const data = await resp.json()
    // error_code:"ace_pod_expired"
    // status:"error"
    if (data?.status === 'error') {
      return {
        success: false,
        data: fallbackUrl,
        error: 'File Expired',
      }
    }
    return {
      success: true,
      data: data?.download_url || fallbackUrl,
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      data: fallbackUrl,
      error: 'Network Error',
    }
  }
}
export const getConversationList = async (params: {
  token: string
  offset?: number
  limit?: number
  order?: string
}) => {
  try {
    const { token, offset = 0, limit = 100, order = 'updated' } = params
    const resp = await chatGptRequest(
      token,
      'GET',
      `/backend-api/conversations?offset=${offset}&limit=${limit}&order=${order}`,
    )
    const data = await resp.json()
    return data?.items || []
  } catch (e) {
    return []
  }
}

export const sendModerationRequest = async ({
  token,
  conversationId,
  messageId,
  input,
}: {
  token: string
  conversationId: string
  messageId: string
  input: string
}) => {
  try {
    await chatGptRequest(token, 'POST', '/backend-api/moderations', {
      conversation_id: conversationId,
      message_id: messageId,
      input,
      model: 'text-moderation-playground',
    })
  } catch (e) {
    console.error(e)
  }
}

export const setConversationProperty = async (
  token: string,
  conversationId: string,
  propertyObject: any,
) => {
  await chatGptRequest(
    token,
    'PATCH',
    `/backend-api/conversation/${conversationId}`,
    propertyObject,
  )
}

export const getChatGPTAccessToken = async (
  notCatchError = false,
): Promise<string> => {
  const resp = await fetch('https://chat.openai.com/api/auth/session')
  if (resp.status === 403 && !notCatchError) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken && !notCatchError) {
    throw new Error('UNAUTHORIZED')
  }
  return data?.accessToken || ''
}

export const generateArkoseToken = async (model: string, dx?: string) => {
  const needWaitArkoseToken = [
    'text-davinci-002-render-sha',
    // 'text-davinci-002-render-sha-mobile',
    'gpt-4',
    'gpt-4-code-interpreter',
    'gpt-4-browsing',
    'gpt-4-plugins',
    'gpt-4-mobile',
  ].includes(model)
  if (needWaitArkoseToken) {
    if (!dx) {
      return ''
    }
    const token = await chromeExtensionArkoseTokenGenerator.generateToken(
      'gpt_4',
      dx,
    )
    if (!token) {
      throw Error(
        'Something went wrong, please try again. If this issue persists, contact us via email.',
      )
    }
    return token
    return new Promise((resolve, reject) => {
      const taskId = uuidV4()
      let isResolve = false
      window.postMessage({
        event: 'MAX_AI_CHAT_GPT_MESSAGE_KEY',
        type: 'arkoseToken',
        data: {
          taskId,
        },
      })
      setTimeout(() => {
        if (!isResolve) {
          reject(
            'Something went wrong, please try again. If this issue persists, contact us via email.',
          )
          window.removeEventListener('message', onceListener)
          window.location.reload()
        }
      }, 20 * 1000)
      const onceListener = (event: any) => {
        if (
          event?.data?.event === 'MAX_AI_CHAT_GPT_MESSAGE_KEY' &&
          event?.data?.type === 'arkoseTokenResponse' &&
          event?.data?.data?.taskId === taskId
        ) {
          if (!isResolve) {
            isResolve = true
            const token = event?.data?.data?.token || ''
            if (token) {
              resolve(token)
            } else {
              reject(
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              )
            }
            window.removeEventListener('message', onceListener)
          }
        }
      }
      window.addEventListener('message', onceListener)
    })
  } else {
    // TODO gpt3.5某些用户可能也需要
    return ''
  }
}

export class ChatGPTConversation {
  id: string
  token: string
  model: string
  conversationId?: string
  // regenerate last question answer - parent message id
  lastChatGPTAnswerMessageId: string
  conversationInfo: {
    title: string
    messages: Array<{
      messageId: string
      parentMessageId: string
      text: string
    }>
    raw?: IChatGPTConversationRaw
  }
  // 是否在删除历史会话
  isCleaningCache = false
  constructor(props: {
    token: string
    model: string
    conversationId?: string
  }) {
    this.token = props.token
    this.model = props.model
    this.lastChatGPTAnswerMessageId = uuidV4()
    this.id = uuidV4()
    this.conversationId = props.conversationId || undefined
    this.conversationInfo = {
      title: '',
      messages: [],
    }
  }
  async updateTitle(title: string) {
    if (!this.conversationId || this.conversationInfo.title === title) {
      return
    }
    await setConversationProperty(this.token, this.conversationId, {
      title,
    })
    this.conversationInfo.title = title
  }
  async fetchHistoryAndConfig() {
    if (!this.conversationId) {
      return
    }
    try {
      const result = await chatGptRequest(
        this.token,
        'GET',
        `/backend-api/conversation/${this.conversationId}`,
      )
      const chatGPTConversationRaw: IChatGPTConversationRaw =
        await result.json()
      this.conversationInfo = {
        title: chatGPTConversationRaw.title,
        messages: mappingToMessages(
          chatGPTConversationRaw.current_node,
          chatGPTConversationRaw.mapping,
        ),
        raw: chatGPTConversationRaw,
      }
      if (chatGPTConversationRaw.title !== CHAT_TITLE) {
        await this.updateTitle(CHAT_TITLE)
      }
      console.log(result)
      this.lastChatGPTAnswerMessageId = chatGPTConversationRaw.current_node
    } catch (e) {
      console.error(e)
      this.lastChatGPTAnswerMessageId = uuidV4()
      this.conversationId = undefined
      this.conversationInfo = {
        title: '',
        messages: [],
      }
    }
  }
  async generateAnswer(params: GenerateAnswerParams, regenerate = false) {
    const questionId = params.messageId || uuidV4()
    const parentMessageId =
      params.parentMessageId || this.lastChatGPTAnswerMessageId || uuidV4()
    console.debug(
      'generateAnswer start',
      this.conversationId,
      questionId,
      parentMessageId,
    )
    let isSend = false
    let resultText = ''
    let resultMessageId = ''
    const settings = await getAIProviderSettings('OPENAI')
    let arkoseToken = undefined
    const { chatRequirementsToken, dx } =
      await generateSentinelChatRequirementsToken(this.token)
    try {
      arkoseToken = await generateArkoseToken(this.model, dx)
    } catch (e) {
      params.onEvent({
        type: 'error',
        data: { message: (e as any).message || 'Network error.', detail: '' },
      })
      params.onEvent({ type: 'done' })
      return
    }
    const postMessage = {
      action: regenerate ? 'variant' : 'next',
      messages: [
        {
          id: questionId,
          author: {
            role: 'user',
          },
          content: {
            content_type: 'text',
            parts: [params.prompt],
          },
        },
      ],
      model: this.model,
      parent_message_id: parentMessageId,
      timezone_offset_min: new Date().getTimezoneOffset(),
      history_and_training_disabled: false,
      force_paragen: false,
      force_rate_limit: false,
      conversation_mode: {
        kind: 'primary_assistant',
      },
      websocket_request_id: uuidV4(),
      suggestions: [],
    } as any
    if (this.conversationId) {
      postMessage.conversation_id = this.conversationId
    }
    if (arkoseToken) {
      // NOTE: 只有gpt-4相关的模型需要传入arkoseToken
      postMessage.arkose_token = arkoseToken
    } else {
      // postMessage.arkose_token = null
    }
    if (params.meta) {
      if (
        params.meta?.attachments &&
        params.meta.attachments.length > 0 &&
        this.model === 'gpt-4'
      ) {
        // gpt-4现在可以带图片聊天
        try {
          postMessage.messages[0].content.content_type = 'multimodal_text'
          // 把用户上传的文件带进parts里
          postMessage.messages[0].content.parts = params.meta.attachments
            .map((chatUploadFile: any) => {
              return {
                width: 0,
                height: 0,
                asset_pointer: `file-service://${chatUploadFile.id}`,
                size_bytes: chatUploadFile.size,
              }
            })
            .concat(postMessage.messages[0].content.parts)
          postMessage.messages[0].metadata = {
            attachments: params.meta.attachments.map((chatUploadFile: any) => {
              return {
                name: chatUploadFile.name,
                size: chatUploadFile.size,
                id: chatUploadFile.id,
                mimeType: chatUploadFile.type,
                width: 0,
                height: 0,
              }
            }),
          }
        } catch (e) {
          // 防止报错影响运行
        }
      } else {
        // NOTE: 目前只用在了gpt-4-code-interpreter
        postMessage.messages[0].metadata = params?.meta?.meta || {}
      }
    }
    if (
      settings?.plugins &&
      !this.conversationId &&
      this.model === 'gpt-4-plugins'
    ) {
      // NOTE: 只有创建新的对话时才需要传入插件
      postMessage.plugin_ids = settings.plugins
    }
    // chatgpt特殊的图片渲染格式 => <<ImageDisplayed>>
    // {"message": {"id": "6c7a3d32-0e43-4f51-ad89-b2bf0e7922af", "author": {"role": "tool", "name": "python", "metadata": {}}, "create_time": 1689588774.3638568, "update_time": 1689588775.6521173, "content": {"content_type": "execution_output", "text": "\n<<ImageDisplayed>>"}, "status": "finished_successfully", "end_turn": null, "weight": 1.0, "metadata": {"aggregate_result": {"status": "success", "run_id": "48a329c7-017b-4370-898b-f311a08aa7a9", "start_time": 1689588774.3525271, "update_time": 1689588775.6513627, "code": "import qrcode\nimport matplotlib.pyplot as plt\n\n# Create qr code instance\nqr = qrcode.QRCode(\n    version = 1,\n    error_correction = qrcode.constants.ERROR_CORRECT_H,\n    box_size = 10,\n    border = 4,\n)\n\n# The data that you want to store\ndata = \"MaxAI.me\"\n\n# Add data\nqr.add_data(data)\nqr.make(fit=True)\n\n# Create an image from the QR Code instance\nimg = qr.make_image()\n\n# Display the generated image\nplt.imshow(img, cmap='gray')\nplt.axis('off')\nplt.show()", "end_time": 1689588775.6513627, "final_expression_output": null, "in_kernel_exception": null, "system_exception": null, "messages": [{"message_type": "image", "time": 1689588775.618626, "sender": "server", "image_payload": null, "image_url": "file-service://2073c3f9-f30e-4225-9728-6a3d2d7a41bd"}], "jupyter_messages": [{"msg_type": "status", "parent_header": {"msg_id": "33e69522-f80020023c0d6f70dbdf5e65_2_1", "version": "5.3"}, "content": {"execution_state": "busy"}}, {"msg_type": "execute_input", "parent_header": {"msg_id": "33e69522-f80020023c0d6f70dbdf5e65_2_1", "version": "5.3"}}, {"msg_type": "display_data", "parent_header": {"msg_id": "33e69522-f80020023c0d6f70dbdf5e65_2_1", "version": "5.3"}, "content": {"data": {"text/plain": "<Figure size 2000x1200 with 1 Axes>", "image/vnd.openai.fileservice.png": "file-service://2073c3f9-f30e-4225-9728-6a3d2d7a41bd"}}}, {"msg_type": "status", "parent_header": {"msg_id": "33e69522-f80020023c0d6f70dbdf5e65_2_1", "version": "5.3"}, "content": {"execution_state": "idle"}}], "timeout_triggered": null}, "is_complete": true, "message_type": "next", "model_slug": "gpt-4-code-interpreter"}, "recipient": "all"}, "conversation_id": "4e7a2dec-0b48-4d4c-b091-6cbf425b27ca", "error": null}
    // chatgpt 返回的图片渲染 =>
    // {"message": {"id": "a5e2dd9f-1a7e-4205-a87d-59ea449d14d6", "author": {"role": "tool", "name": "dalle.text2im", "metadata": {}}, "create_time": null, "update_time": null, "content": {"content_type": "multimodal_text", "parts": [{"content_type": "image_asset_pointer", "asset_pointer": "file-service://file-3lZoyavh3UZ9QJT5k1dJjk4J", "size_bytes": 295596, "width": 1024, "height": 1024, "fovea": 512, "metadata": {"dalle": {"gen_id": "IhqIYwGXKd1cDQxE", "prompt": "A serene, luminous full moon in a starlit night sky, with a whimsical twist: a classic ping pong ball gently resting on its surface. The moon's craters and texture are detailed, reflecting soft moonlight. The ping pong ball, with its matte white surface and subtle shadows, contrasts with the moon's rugged terrain. The surrounding space is filled with twinkling stars, adding to the tranquil and surreal atmosphere.", "seed": 4286421595, "serialization_title": "DALL-E generation metadata"}}}]}, "status": "finished_successfully", "end_turn": null, "weight": 1.0, "metadata": {"message_type": "next", "model_slug": "gpt-4", "parent_id": "16d78db9-9f94-418a-a8b8-ae671d95b291"}, "recipient": "all"}, "conversation_id": "9c00faab-8c70-4ae3-a55a-002264bd816b", "error": null}
    const displayImageIds: string[] = []
    await fetchSSE(`${CHAT_GPT_PROXY_HOST}/backend-api/conversation`, {
      provider: AI_PROVIDER_MAP.OPENAI,
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        'Openai-Sentinel-Arkose-Token': arkoseToken || '',
        'Openai-Sentinel-Chat-Requirements-Token': chatRequirementsToken,
      } as any,
      body: JSON.stringify(Object.assign(postMessage)),
      onMessage: async (message: string) => {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          if (resultText && this.conversationId && resultMessageId) {
            this.updateTitle(CHAT_TITLE)
            sendModerationRequest({
              token: this.token,
              conversationId: this.conversationId,
              messageId: resultMessageId,
              input: resultText,
            })
          }
          let newResultText = resultText
          // 渲染displayImage
          if (displayImageIds.length > 0) {
            const imageUrls = await Promise.all(
              displayImageIds.map(async (displayImageId) => {
                return await getConversationDownloadFile({
                  uuid: displayImageId,
                })
              }),
            )
            imageUrls.forEach((image) => {
              if (image.success && image.data) {
                newResultText = `![image](${image.data})\n${newResultText}`
              }
            })
          }
          // 解析resultText中的markdown链接
          const markdownLinks = newResultText.match(/\[.*?\]\(.*?\)/g)
          if (
            this.conversationId &&
            markdownLinks &&
            markdownLinks.length > 0
          ) {
            const replaceDataList = await Promise.all(
              markdownLinks.map(async (markdownLink) => {
                // "[Download the clipped video](sandbox:/mnt/data/clip_3s.mp4)"
                // split by "]("
                const parts = markdownLink.split('](')
                if (parts.length !== 2) {
                  return undefined
                }
                const text = parts[0].slice(1)
                const url = parts[1].slice(0, -1)
                if (!url.startsWith('sandbox:')) {
                  return undefined
                }
                const downloadFile = await getConversationFileUrl({
                  conversationId: this.conversationId!,
                  message_id: resultMessageId,
                  sandbox_path: url.replace('sandbox:', ''),
                })
                if (downloadFile.success) {
                  return {
                    original: markdownLink,
                    new: `[${text}](${downloadFile.data})`,
                  } as {
                    original: string
                    new: string
                  }
                } else {
                  return undefined
                }
              }),
            )
            replaceDataList.forEach((replaceData) => {
              if (replaceData) {
                newResultText = newResultText.replace(
                  replaceData.original,
                  replaceData.new,
                )
              }
            })
            params.onEvent({
              type: 'answer',
              data: {
                text: newResultText,
                messageId: resultMessageId,
                conversationId: this.conversationId,
                parentMessageId: questionId,
              },
            })
            setTimeout(() => {
              params.onEvent({ type: 'done' })
            }, 100)
          } else {
            params.onEvent({ type: 'done' })
          }
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          console.error(err)
          return
        }
        // web browsing object
        // {"message": {"id": "a1bad9ad-29b0-4ab3-8603-a9f6b4399fbb", "author": {"role": "assistant", "name": null, "metadata": {}}, "create_time": 1684210390.537254, "update_time": null, "content": {"content_type": "code", "language": "unknown", "text": "# To find out today's news, I'll perform a search.\nsearch(\"2023\u5e745\u670816\u65e5"}, "status": "in_progress", "end_turn": null, "weight": 1.0, "metadata": {"message_type": "next", "model_slug": "gpt-4-browsing"}, "recipient": "browser"}, "conversation_id": "3eade3ec-a3b7-4d04-941b-52347d533c80", "error": null}
        let text =
          data.message?.content?.parts?.[0] || data.message?.content?.text || ''
        if (typeof text === 'string' && text.includes(`<<ImageDisplayed>>`)) {
          const imageFileUrl =
            data.message?.metadata?.aggregate_result?.messages?.[0]?.image_url
          // "file-service://9fb16358-e2b8-4ab5-9e38-c47c6d3a8c2b"
          const imageFileId = imageFileUrl.split('//')?.[1] || ''
          if (displayImageIds.find((item) => item === imageFileId)) {
            return
          }
          displayImageIds.push(imageFileId)
        }
        if (data.message?.content?.content_type === 'multimodal_text') {
          // 判断是不是gpt-4 dalle的图片
          if (
            data.message.content.parts?.[0]?.content_type ===
            'image_asset_pointer'
          ) {
            text = 'Creating image'
            const assetPointer =
              data.message.content.parts?.[0]?.asset_pointer?.split(
                '//',
              )?.[1] || ''
            if (assetPointer) {
              if (displayImageIds.find((item) => item === assetPointer)) {
                return
              }
              displayImageIds.push(assetPointer)
            }
          }
        }
        // console.log(
        //   'generateAnswer on content',
        //   data?.message?.content?.content_type,
        //   data?.message?.content?.language,
        //   data?.message,
        // )
        if (text) {
          console.log('generateAnswer on text', data)
          resultText = text
          resultMessageId = data.message.id
          this.conversationId = data.conversation_id
          this.lastChatGPTAnswerMessageId = data.message.id
          if (this.conversationId && !isSend) {
            isSend = true
            sendModerationRequest({
              token: this.token,
              conversationId: this.conversationId,
              messageId: questionId,
              input: params.prompt,
            })
          }
          params.onEvent({
            type: 'answer',
            data: {
              text,
              messageId: data.message.id,
              conversationId: data.conversation_id,
              parentMessageId: questionId,
            },
          })
        } else if (data.error) {
          console.error('generateAnswer on error', data)
          params.onEvent({
            type: 'error',
            data: {
              message: data.error,
              detail: '',
            },
          })
        }
      },
    })
      .then()
      .catch((err) => {
        try {
          if (
            err?.message === 'BodyStreamBuffer was aborted' ||
            err?.message === 'The user aborted a request.'
          ) {
            params.onEvent({
              type: 'error',
              data: { message: 'manual aborted request.', detail: '' },
            })
            return
          }
          const error = JSON.parse(err.message || err)
          console.error('sse error', err)
          params.onEvent({
            type: 'error',
            data: { message: error.message, detail: error.detail },
          })
        } catch (e) {
          params.onEvent({
            type: 'error',
            data: { message: 'Network error.', detail: '' },
          })
        }
      })
  }
  async close() {
    if (this.conversationId) {
      await setConversationProperty(this.token, this.conversationId, {
        is_visible: false,
      })
      this.conversationInfo = {
        title: '',
        messages: [],
      }
    }
  }
  async removeCacheConversation() {
    if (this.isCleaningCache) {
      console.log('isCleaningCache!!!')
      return
    }
    if (this.token) {
      const conversations = await getConversationList({
        token: this.token,
      })
      const cacheConversations = conversations.filter(
        (conversation: { id: string; title: string }) => {
          return (
            conversation.title === CHAT_TITLE &&
            conversation.id !== this.conversationId
          )
        },
      )
      console.log('start removeCacheConversation', cacheConversations.length)
      if (cacheConversations.length === 0) {
        return
      }
      this.isCleaningCache = true
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
      for (let i = 0; i < cacheConversations.length; i++) {
        try {
          console.log(
            'removeCacheConversation',
            cacheConversations[i].id,
            cacheConversations[i].title,
          )
          await setConversationProperty(this.token, cacheConversations[i].id, {
            is_visible: false,
          })
          await delay(3000)
        } catch (e) {
          console.error(e)
        }
      }
      this.isCleaningCache = false
      console.log('end removeCacheConversation')
    }
  }
}

export class ChatGPTDaemonProcess implements IChatGPTDaemonProcess {
  token?: string
  conversations: ChatGPTConversation[]
  abortFunctions: {
    [conversationId: string]: () => void
  }
  models: IChatGPTModelType[]
  plugins: IChatGPTPluginType[]
  constructor() {
    this.conversations = []
    this.abortFunctions = {}
    this.plugins = []
    this.token = undefined
    this.models = []
  }
  private async fetchModels(token: string): Promise<IChatGPTModelType[]> {
    if (this.models.length > 0) {
      return this.models
    }
    const permissionResult = await chatGptRequest(
      token,
      'GET',
      '/backend-api/settings/beta_features',
    )
      .then(async (r) => {
        const permission: any = await r.json()
        return {
          browsing: permission?.browsing || false,
          chat_preferences: permission?.chat_preferences || false,
          code_interpreter: permission?.code_interpreter || false,
          plugins: permission?.plugins || false,
        }
      })
      .catch(() => {
        return {
          browsing: false,
          chat_preferences: false,
          code_interpreter: false,
          plugins: false,
        }
      })
    const resp = await chatGptRequest(token, 'GET', '/backend-api/models').then(
      (r) => r.json(),
    )
    if (resp?.models && resp.models.length > 0) {
      this.models = resp.models.filter((model: any) => {
        // TODO 因为不知道chat_preferences对应的slug，所以暂时不处理
        if (model.slug === 'gpt-4-code-interpreter') {
          return permissionResult.code_interpreter
        } else if (model.slug === 'gpt-4-browsing') {
          return permissionResult.browsing
        } else if (model.slug === 'gpt-4-plugins') {
          return permissionResult.plugins
        }
        return true
      })
    }
    return this.models
  }
  private async fetchPlugins(token: string): Promise<IChatGPTPluginType[]> {
    if (this.plugins.length > 0) {
      return this.plugins
    }
    const resp = await chatGptRequest(
      token,
      'GET',
      '/backend-api/aip/p?offset=0&limit=100&is_installed=true',
    ).then((r) => r.json())
    if (resp?.items && resp.items.length > 0) {
      this.plugins = resp.items
    }
    return resp.items
  }
  private async getModelName(
    token: string,
    selectModel?: string,
  ): Promise<string> {
    try {
      const models = await this.fetchModels(token)
      if (models?.length > 0) {
        if (selectModel) {
          const model = models.find((m) => m.slug === selectModel)
          if (model) {
            return model.slug
          }
        }
        return models[0].slug
      }
      return 'text-davinci-002-render-sha'
    } catch (err) {
      console.error(err)
      return 'text-davinci-002-render-sha'
    }
  }
  async getAllModels() {
    if (this.models.length > 0) {
      return this.models
    }
    try {
      const token = this.token || (await getChatGPTAccessToken())
      if (token) {
        this.token = token
      }
      return await this.fetchModels(token)
    } catch (e) {
      console.error(e)
      return []
    }
  }
  async getAllPlugins() {
    if (this.plugins.length > 0) {
      return this.plugins
    }
    try {
      const token = this.token || (await getChatGPTAccessToken())
      if (token) {
        this.token = token
      }
      return await this.fetchPlugins(token)
    } catch (e) {
      console.error(e)
      return []
    }
  }
  async createConversation(conversationId?: string, selectedModel?: string) {
    if (this.conversations.length > 0) {
      if (selectedModel) {
        if (this.conversations[0].model === selectedModel) {
          return this.conversations[0]
        } else {
          this.conversations.forEach((conversation) => conversation.close())
          this.conversations = []
        }
      } else {
        return this.conversations[0]
      }
    }
    try {
      const token = this.token || (await getChatGPTAccessToken())
      const model = await this.getModelName(token, selectedModel)
      const conversationInstance = new ChatGPTConversation({
        token,
        model,
        conversationId,
      })
      this.conversations.push(conversationInstance)
      conversationInstance.removeCacheConversation()
      await conversationInstance.fetchHistoryAndConfig()
      console.log(conversationInstance)
      return conversationInstance
    } catch (error) {
      console.error('createConversation error:\t', error)
      if ((error as any).message === 'CLOUDFLARE') {
        // 刷新网页
        location.reload()
      }
      return undefined
    }
  }
  getConversation(conversationId: string) {
    return this.conversations.find(
      (c) => c.id === conversationId || c.conversationId === conversationId,
    )
  }
  getConversations() {
    return this.conversations
  }
  async closeConversation(conversationId: string) {
    try {
      const conversation = this.getConversation(conversationId)
      if (conversation) {
        await conversation.close()
        this.conversations = this.conversations.filter(
          (conversation) => conversation.conversationId !== conversationId,
        )
      }
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  addAbortWithMessageId(messageId: string, abortFunction: () => void) {
    this.abortFunctions[messageId] = abortFunction
  }
  removeAbortWithMessageId(messageId: string) {
    delete this.abortFunctions[messageId]
  }
  abortWithMessageId(messageId: string) {
    try {
      console.log(messageId)
      if (this.abortFunctions[messageId]) {
        console.log('abort Controller abort runed', messageId)
        this.abortFunctions[messageId]()
        delete this.abortFunctions[messageId]
        console.log(this.abortFunctions)
      }
    } catch (e) {
      console.error('abortWithMessageId error', e)
    }
  }
  removeCacheConversation() {
    return this.conversations?.[0]?.removeCacheConversation()
  }
}
