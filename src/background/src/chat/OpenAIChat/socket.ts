// {
//   "message": {
//   "id": "54821c91-cb4b-4076-96a2-6741a92b8e0a",
//     "author": {
//     "role": "system",
//       "name": null,
//       "metadata": {}
//   },
//   "create_time": null,
//     "update_time": null,
//     "content": {
//     "content_type": "text",
//       "parts": [
//       ""
//     ]
//   },
//   "status": "finished_successfully",
//     "end_turn": true,
//     "weight": 0,
//     "metadata": {
//     "is_visually_hidden_from_conversation": true
//   },
//   "recipient": "all"
// },
//   "conversation_id": "1f844c6a-fcca-45b4-adaf-0e3bdb0c8da6",
//   "error": null
// }
//

import { CHATGPT_WEBAPP_HOST } from '@/constants'
import { getOpenAIDeviceId } from '@/features/chatgpt/core/generateSentinelChatRequirementsToken'

interface IChatGPTRawMessage {
  message: {
    id: string
    author: {
      role: string
      name: string
      metadata: any
    }
    create_time: string
    update_time: string
    content: {
      content_type: 'text' | 'multimodal_text'
      parts: Array<
        | { content_type: 'text' | 'multimodal_text'; asset_pointer: string }
        | string
      >
      text?: string
    }
    status: 'finished_successfully' | 'in_progress'
    end_turn: boolean
    weight: number
    metadata: {
      is_visually_hidden_from_conversation: boolean
      aggregate_result?: {
        messages?: Array<{
          image_url?: string
        }>
      }
      gizmo_id?: string
      message_type?: 'next'
      model_slug?: string
      parent_id?: string
    }
    recipient: string
  }
  conversation_id: string
  error: null | string
}

const CHAT_GPT_PROXY_HOST = `https://${CHATGPT_WEBAPP_HOST}`
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
const getConversationFileUrl = async (params: {
  token: string
  conversationId: string
  message_id: string
  sandbox_path: string
}) => {
  const { token, conversationId, message_id, sandbox_path } = params
  const fallbackUrl = `https://${CHATGPT_WEBAPP_HOST}/c/${conversationId}`
  // https://chat.openai.com/backend-api/conversation/647c720d-9eeb-4986-8b89-112098f107b6/interpreter/download?message_id=895986d6-bd39-404e-a485-923cdb5c7476&sandbox_path=%2Fmnt%2Fdata%2Fclip_3s.mp4
  try {
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
const getConversationDownloadFile = async (params: {
  token: string
  uuid: string
}) => {
  // https://chat.openai.com/backend-api/files/181e27fe-1a7b-4d14-ab17-68f70582ab30/download
  const { token, uuid } = params
  try {
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

interface ChatGPTSocketServiceMessage {
  connectionId: string
  event: 'connected' | 'disconnected'
  kind: 'connected' | 'disconnected' | 'serverData' | 'groupData' | 'ack'
  reconnectionToken: string
  type: 'system' | 'message'
  userId: string
  sequenceId?: number
  from?: 'group' | 'server' | 'ack'
  dataType?: 'json'
  data?: {
    type: 'http.response.body'
    body: string
    more_body: boolean
    response_id: string
    conversation_id: string
  }
  message?: string
}

export type ChatGPTSocketServiceMessageListenerData = {
  messageId: string
  parentMessageId: string
  conversationId: string
  text: string
  ChatGPTSocketRawData: ChatGPTSocketServiceMessage
  ChatGPTMessageRawData?: IChatGPTRawMessage
  error: string
  done: boolean
}

export type ChatGPTSocketServiceMessageListener = (
  messageId: string,
  event: ChatGPTSocketServiceMessageListenerData,
) => void

class SequenceAckTask {
  private functionToExecute: () => Promise<void>
  private abortController: AbortController
  private interval: number

  constructor(task: () => Promise<void>, interval: number) {
    this.functionToExecute = task
    this.abortController = new AbortController()
    this.interval = interval
    this.start()
  }

  abort() {
    try {
      this.abortController.abort()
    } catch (e) {
      // TODO
    }
  }

  private async start() {
    const signal = this.abortController.signal
    while (!signal.aborted) {
      try {
        await this.functionToExecute()
      } catch (e) {
        // TODO
      } finally {
        await new Promise((resolve) => setTimeout(resolve, this.interval))
      }
    }
  }
}
class SequenceIdTracker {
  private currentSequenceId: number
  private isUpdated: boolean

  constructor() {
    this.currentSequenceId = 0
    this.isUpdated = false
  }

  tryUpdate(newSequenceId: number): boolean {
    this.isUpdated = true
    if (newSequenceId > this.currentSequenceId) {
      this.currentSequenceId = newSequenceId
      return true
    }
    return false
  }

  tryGetSequenceId(): [boolean, number | null] {
    if (this.isUpdated) {
      this.isUpdated = false
      return [true, this.currentSequenceId]
    }
    return [false, null]
  }

  reset() {
    this.currentSequenceId = 0
    this.isUpdated = false
  }
}

const chatGPTWebappSocketSequenceIdTracker = new SequenceIdTracker()

class ChatGPTSocketService {
  private token: string | null = null
  private status: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  private socket: WebSocket | null = null
  private isDetected: boolean = false
  public isSocketService: boolean = false
  private messageListeners: Map<string, ChatGPTSocketServiceMessageListener> =
    new Map()
  private sequenceAckTask: SequenceAckTask | null = null
  private socketIdMessageMap: Map<
    string,
    {
      messageId: string
      parentMessageId: string
      conversationId: string
      displayImages: string[]
      text: string
      rawMessage: IChatGPTRawMessage
    }
  > = new Map()

  public init(token: string) {
    this.token = token
  }
  public async connect(): Promise<boolean> {
    if (this.status === 'connected') {
      return true
    }
    await this.disconnect()
    this.status = 'connecting'
    const result = await this.registerWebSocket()
    if (result && result.wss_url) {
      return await this.createWebSocket(result.wss_url)
    }
    return false
  }
  public async disconnect(): Promise<boolean> {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.status = 'disconnected'
    this.isDetected = false
    this.isSocketService = false
    return true
  }

  private async registerWebSocket(): Promise<any> {
    const response = await chatGptRequest(
      this.token!,
      'POST',
      '/backend-api/register-websocket',
      {},
    )
    return response.json()
  }

  private createWebSocket(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      // 连接超时5s
      const timer = setTimeout(() => {
        if (this.socket) {
          this.socket.close()
          this.status = 'disconnected'
        }
        resolve(false)
      }, 5000)
      this.socket = new WebSocket(url, 'json.reliable.webpubsub.azure.v1')
      this.socket.binaryType = 'arraybuffer'
      this.socket.onopen = () => {
        console.log('ChatGPTWebapp Socket opened')
        this.sequenceAckTask = new SequenceAckTask(async () => {
          const [isUpdated, sequenceId] =
            chatGPTWebappSocketSequenceIdTracker.tryGetSequenceId()
          if (isUpdated && sequenceId) {
            this.socket?.send(
              JSON.stringify({
                sequenceId,
                type: 'sequenceAck',
              }),
            )
          }
        }, 1000)
      }
      this.socket.onerror = (error) => {
        console.error('ChatGPTWebapp Socket error', error)
        this.sequenceAckTask?.abort()
      }
      this.socket.onclose = () => {
        console.log('ChatGPTWebapp Socket closed')
        this.status = 'disconnected'
        chatGPTWebappSocketSequenceIdTracker.reset()
        this.sequenceAckTask?.abort()
      }
      this.socket.onmessage = async (event) => {
        try {
          const handleSocketMessage = await this.handleSocketMessage(event)
          if (handleSocketMessage) {
            if (handleSocketMessage.type === 'system') {
              if (handleSocketMessage.kind === 'connected') {
                clearTimeout(timer)
                this.status = 'connected'
                resolve(true)
              } else if (handleSocketMessage.kind === 'disconnected') {
                clearTimeout(timer)
                this.status = 'disconnected'
                resolve(false)
              }
            } else if (handleSocketMessage.type === 'message') {
              this.onSocketMessage(handleSocketMessage).then().catch()
            }
          }
        } catch (e) {
          console.error('ChatGPTWebapp Socket message error', e)
        }
      }
    })
  }

  private async handleSocketMessage(
    event: MessageEvent,
  ): Promise<ChatGPTSocketServiceMessage | null> {
    const eventData = Array.isArray(event.data)
      ? chatGPTWebappMergeBuffers(event.data)
      : event.data
    if (typeof eventData === 'string') {
      if (!eventData) {
        throw new Error('ChatGPTWebapp Socket [Message]: message data empty')
      }
      const jsonData = JSON.parse(eventData)
      if (jsonData.type === 'system') {
        if (jsonData.event === 'connected') {
          console.log('ChatGPTWebapp Socket [Message]: connected')
          return Object.assign({}, jsonData, {
            kind: 'connected',
          })
        } else if (jsonData.event === 'disconnected') {
          console.log('ChatGPTWebapp Socket [Message]: disconnected')
          return Object.assign({}, jsonData, {
            kind: 'disconnected',
          })
        }
      } else if (jsonData.type === 'message') {
        console.log(
          `ChatGPTWebapp handleSocketMessage [Message]`,
          jsonData.from,
        )
        if (jsonData.from === 'group') {
          const socketData = chatGPTWebappTransformData(
            jsonData.data,
            jsonData.dataType,
          )
          if (socketData === null) {
            return null
          }
          return Object.assign({}, jsonData, {
            data: socketData,
            message: chatGPTWebappHandleMessageText(socketData.body),
            kind: 'groupData',
          })
        } else if (jsonData.from === 'server') {
          const socketData = chatGPTWebappTransformData(
            jsonData.data,
            jsonData.dataType,
          )
          if (socketData === null) {
            return null
          }
          return Object.assign({}, jsonData, {
            data: socketData,
            message: chatGPTWebappHandleMessageText(socketData.body),
            kind: 'serverData',
          })
        } else if (jsonData.from === 'ack') {
          return Object.assign({}, jsonData, {
            kind: 'ack',
          })
        }
      } else {
        // TODO
        throw new Error('socket message data type error')
      }
      return null
    } else {
      throw new Error('socket message data type error')
    }
  }

  public async detectChatGPTWebappIsSocket() {
    if (this.isDetected) {
      return this.isSocketService
    }
    if (this.token) {
      let isSSE = false
      try {
        const result = await fetch(
          `${CHAT_GPT_PROXY_HOST}/backend-api/accounts/check/v4-2023-04-27`,
          {
            method: 'GET',
            headers: {
              'Oai-Device-Id': await getOpenAIDeviceId(),
              'Oai-Language': 'en-US',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
          },
        )
        if (result.ok && result.status === 200) {
          this.isDetected = true
          const data = await result.json()
          // account_ordering: [xxx]
          // accounts: {xxx, default: {features:[]}}
          const features: string[] = []
          data?.account_ordering?.forEach((userId: string) => {
            if (data?.accounts?.[userId]?.features) {
              features.push(...data?.accounts?.[userId]?.features)
            }
          })
          features.push(...(data?.accounts?.default?.features || []))
          if (features.includes('shared_websocket')) {
            this.isSocketService = true
            isSSE = true
          }
        }
      } catch (e) {
        // console.error(e)
      }
      return isSSE
    }
    return this.isSocketService
  }
  public onMessageIdListener(
    messageId: string,
    listener: ChatGPTSocketServiceMessageListener,
  ) {
    this.messageListeners.set(messageId, listener)
  }

  private async onSocketMessage(
    chatGPTSocketServiceMessage: ChatGPTSocketServiceMessage,
  ) {
    if (
      chatGPTSocketServiceMessage?.kind === 'serverData' ||
      chatGPTSocketServiceMessage?.kind === 'groupData'
    ) {
      this.processMessage(chatGPTSocketServiceMessage, (message) => {
        if (message?.ChatGPTSocketRawData?.sequenceId) {
          chatGPTWebappSocketSequenceIdTracker.tryUpdate(
            message.ChatGPTSocketRawData.sequenceId,
          )
        }
        console.log(
          'ChatGPTWebapp Socket message',
          this.messageListeners,
          this.socketIdMessageMap,
          message,
        )
        this.messageListeners.forEach((listener, messageId) => {
          if (message.parentMessageId === messageId) {
            listener(message.parentMessageId, message)
          }
        })
      })
    }
  }

  private async processMessage(
    chatGPTSocketServiceMessage: ChatGPTSocketServiceMessage,
    onMessage: (data: ChatGPTSocketServiceMessageListenerData) => void,
  ): Promise<void> {
    if (
      !chatGPTSocketServiceMessage.message ||
      chatGPTSocketServiceMessage.message === ''
    ) {
      return
    }
    if (chatGPTSocketServiceMessage.message === '[DONE]') {
      const socketId = chatGPTSocketServiceMessage.data?.response_id
      if (socketId && this.socketIdMessageMap.has(socketId)) {
        const cache = this.socketIdMessageMap.get(socketId)!
        let newResultText = cache.text
        // 渲染displayImage
        if (this.token && cache.displayImages.length > 0) {
          const imageUrls = await Promise.all(
            cache.displayImages.map(async (displayImageId) => {
              return await getConversationDownloadFile({
                token: this.token!,
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
          cache.conversationId &&
          cache.messageId &&
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
                token: this.token!,
                conversationId: cache.conversationId,
                message_id: cache.messageId,
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
        }
        onMessage({
          parentMessageId: cache.parentMessageId,
          messageId: cache.messageId,
          conversationId: cache.conversationId,
          text: newResultText,
          error: '',
          done: true,
          ChatGPTSocketRawData: chatGPTSocketServiceMessage,
          ChatGPTMessageRawData: cache.rawMessage,
        })
        this.socketIdMessageMap.delete(socketId)
        this.messageListeners.delete(cache.parentMessageId)
      }
      return
    }
    try {
      const rawMessage: IChatGPTRawMessage = JSON.parse(
        chatGPTSocketServiceMessage.message,
      )
      const messageId = rawMessage?.message?.id || ''
      const parentMessageId = rawMessage?.message?.metadata?.parent_id || ''
      const socketId = chatGPTSocketServiceMessage.data?.response_id
      if (!messageId || !socketId || !parentMessageId) {
        return
      }
      if (!this.socketIdMessageMap.has(socketId)) {
        this.socketIdMessageMap.set(socketId, {
          messageId,
          parentMessageId,
          conversationId: rawMessage.conversation_id,
          displayImages: [],
          text: '',
          rawMessage,
        })
      }
      const cache = this.socketIdMessageMap.get(socketId)!
      if (rawMessage.error) {
        onMessage({
          messageId,
          // 因为parentMessageId和messageId都会变，只有socketId不会变，所以在第一次socketIdMessageMap之后，就不能改parentMessageId
          parentMessageId: cache.parentMessageId,
          conversationId: rawMessage.conversation_id,
          text: '',
          error: rawMessage.error,
          done: true,
          ChatGPTSocketRawData: chatGPTSocketServiceMessage,
          ChatGPTMessageRawData: rawMessage,
        })
        return
      }

      let text =
        rawMessage.message?.content?.parts?.[0] ||
        rawMessage.message?.content?.text ||
        ''
      // web browsing object
      // {"message": {"id": "a1bad9ad-29b0-4ab3-8603-a9f6b4399fbb", "author": {"role": "assistant", "name": null, "metadata": {}}, "create_time": 1684210390.537254, "update_time": null, "content": {"content_type": "code", "language": "unknown", "text": "# To find out today's news, I'll perform a search.\nsearch(\"2023\u5e745\u670816\u65e5"}, "status": "in_progress", "end_turn": null, "weight": 1.0, "metadata": {"message_type": "next", "model_slug": "gpt-4-browsing"}, "recipient": "browser"}, "conversation_id": "3eade3ec-a3b7-4d04-941b-52347d533c80", "error": null}
      if (typeof text === 'string' && text.includes(`<<ImageDisplayed>>`)) {
        const imageFileUrl =
          rawMessage.message?.metadata?.aggregate_result?.messages?.[0]
            ?.image_url || ''
        const imageFileId = imageFileUrl.split('//')?.[1] || ''
        if (
          imageFileId &&
          !cache.displayImages.find((imageFileId) => imageFileId)
        ) {
          cache.displayImages.push(imageFileId)
        }
      }
      if (rawMessage.message?.content?.content_type === 'multimodal_text') {
        // 判断是不是gpt-4 dalle的图片
        if (
          (rawMessage.message.content.parts?.[0] as any)?.content_type ===
          'image_asset_pointer'
        ) {
          text = 'Creating image'
          const assetPointer =
            (
              rawMessage.message.content.parts?.[0] as any
            )?.asset_pointer?.split('//')?.[1] || ''
          if (assetPointer) {
            if (cache.displayImages.find((item) => item === assetPointer)) {
              return
            }
            cache.displayImages.push(assetPointer)
          }
        }
      }
      cache.text = text as string
      this.socketIdMessageMap.set(socketId, cache)
      onMessage({
        messageId,
        // 因为parentMessageId和messageId都会变，只有socketId不会变，所以在第一次socketIdMessageMap之后，就不能改parentMessageId
        parentMessageId: cache.parentMessageId,
        done: false,
        conversationId: rawMessage.conversation_id,
        text: cache.text,
        error: '',
        ChatGPTSocketRawData: chatGPTSocketServiceMessage,
        ChatGPTMessageRawData: rawMessage,
      })
    } catch (e) {
      console.error(e)
    }
  }
}

export function chatGPTWebappTransformData(
  Y: any,
  dataType: string,
): any | null {
  if (dataType === 'text') {
    if (typeof Y !== 'string') {
      throw new TypeError('Message must be a string when dataType is text')
    }
    return Y
  }
  if (dataType === 'json') {
    return Y
  }
  if (dataType !== 'binary' && dataType !== 'protobuf') {
    return null
  }

  // For binary or protobuf data types
  const buffer = Buffer.from(Y, 'base64')
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  )
}

export function chatGPTWebappHandleMessageText(body: string): string {
  try {
    let jsonText = atob(body).trim()
    if (jsonText.startsWith('data: ')) {
      jsonText = jsonText.replace('data: ', '')
    }
    return jsonText
  } catch (err) {
    console.error(err)
    return ''
  }
}

export function chatGPTWebappMergeBuffers(bufferList: Buffer[]): Buffer {
  let totalLength: number | undefined // 总长度，初始值为 undefined
  if (!Array.isArray(bufferList))
    throw new TypeError('"bufferList" argument must be an Array of Buffers')
  if (bufferList.length === 0) return Buffer.alloc(0) // 如果 bufferList 为空数组，则返回一个大小为 0 的新缓冲区
  if (typeof totalLength === 'undefined') {
    totalLength = 0
    for (let i = 0; i < bufferList.length; ++i)
      totalLength += bufferList[i].length // 计算所有缓冲区的总长度
  }
  const mergedBuffer = Buffer.allocUnsafe(totalLength) // 创建一个新的缓冲区用于存储合并后的结果
  let offset = 0 // 当前写入位置的偏移量
  for (let i = 0; i < bufferList.length; ++i) {
    let currentBuffer = bufferList[i]
    if (currentBuffer instanceof Uint8Array) {
      // 如果当前缓冲区是 Uint8Array 类型
      if (offset + currentBuffer.length > mergedBuffer.length) {
        // 如果写入当前缓冲区会导致溢出，则将其转换为 Buffer 类型并复制到合并缓冲区中
        if (!Buffer.isBuffer(currentBuffer))
          currentBuffer = Buffer.from(currentBuffer)
        currentBuffer.copy(mergedBuffer, offset)
      } else {
        // 如果不会导致溢出，则直接使用 Uint8Array.prototype.set 方法写入到合并缓冲区中
        Uint8Array.prototype.set.call(mergedBuffer, currentBuffer, offset)
      }
    } else if (Buffer.isBuffer(currentBuffer)) {
      // 如果当前缓冲区是 Buffer 类型，则直接复制到合并缓冲区中
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      currentBuffer.copy(mergedBuffer, offset)
    } else {
      // 如果当前缓冲区既不是 Uint8Array 也不是 Buffer 类型，则抛出类型错误
      throw new TypeError('"bufferList" argument must be an Array of Buffers')
    }
    offset += currentBuffer.length // 更新偏移量，以便追踪下一个缓冲区的写入位置
  }
  return mergedBuffer
}

class ChatGPTSocketManager {
  private static instance: ChatGPTSocketService
  public static get socketService(): ChatGPTSocketService {
    if (!ChatGPTSocketManager.instance) {
      ChatGPTSocketManager.instance = new ChatGPTSocketService()
    }
    return ChatGPTSocketManager.instance
  }
}

export default ChatGPTSocketManager
