import { v4 as uuidV4 } from 'uuid'
import { fetchSSE } from './fetch-sse'
import { mappingToMessages } from '@/features/chatgpt/core/util'
import {
  CHAT_GPT_GPT4_ARKOSE_TOKEN,
  CHAT_GPT_GPT4_ARKOSE_TOKEN_KEY,
  CHAT_GPT_PROVIDER,
} from '@/constants'
import { getChromeExtensionSettings } from '@/background/utils'
import {
  IChatGPTModelType,
  IChatGPTPluginType,
} from '@/background/types/Settings'
import Browser from 'webextension-polyfill'

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

const getLocalArkoseToken = async () => {
  const cache = await Browser.storage.local.get(CHAT_GPT_GPT4_ARKOSE_TOKEN)
  const data = JSON.parse(cache[CHAT_GPT_GPT4_ARKOSE_TOKEN] || '{}')
  if (data.token) {
    return data as {
      token: string
      date: number
    }
  } else {
    return undefined
  }
}
export const waitArkoseTokenIframeLoaded = async () => {
  const key = CHAT_GPT_GPT4_ARKOSE_TOKEN_KEY
  // find script
  const scripts = document.querySelectorAll('script')
  const script = Array.from(scripts).find((script) => {
    return script.src.includes(key)
  })
  if (!script) {
    // not found
    // 'https://chat.openai.com/?model=gpt-4'
    location.href = 'https://chat.openai.com/?model=gpt-4'
    throw new Error('Network error.')
  }
  // max wait 10s
  const timeout = 10000
  const start = Date.now()
  let count = 0
  while (Date.now() - start < timeout) {
    const iframes = document.querySelectorAll('iframe')
    const iframe = Array.from(iframes).find((iframe) => {
      return iframe.src.includes(key)
    })
    if (iframe) {
      if (count > 0) {
        console.log('waitArkoseTokenIframeLoaded', count)
        // 说明不是第一次就找到，给点时间让content script加载
        await new Promise((resolve) => {
          setTimeout(resolve, 3000)
        })
      }
      return iframe
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    count++
  }
  return undefined
}
export const mockSendPostMessage = () => {
  const iframes = document.querySelectorAll('iframe')
  for (let i = 0; i < iframes.length; i++) {
    const frame = iframes[i]
    const data = {
      data: undefined,
      key: CHAT_GPT_GPT4_ARKOSE_TOKEN_KEY,
      message: 'show enforcement',
      type: 'emit',
    }
    // post message
    if (frame.contentWindow && frame.contentWindow.postMessage) {
      frame.contentWindow.postMessage(JSON.stringify(data), '*')
    }
  }
}

export const generateArkoseToken = async (model: string) => {
  const needArkoseToken = [
    // 'text-davinci-002-render-sha',
    // 'text-davinci-002-render-sha-mobile',
    'gpt-4',
    'gpt-4-code-interpreter',
    'gpt-4-browsing',
    'gpt-4-plugins',
    'gpt-4-mobile',
  ].includes(model)
  if (!needArkoseToken) {
    return ''
  }
  console.log('wait generateArkose Iframe loaded')
  await waitArkoseTokenIframeLoaded()
  console.log('generateArkoseToken', model)
  const currentToken = await getLocalArkoseToken()
  mockSendPostMessage()
  return new Promise((resolve) => {
    const intervalDelay = 100
    const maxLoop = (10 * 1000) / intervalDelay
    let loop = 0
    const timer = setInterval(async () => {
      const newToken = await getLocalArkoseToken()
      if (newToken && newToken.token !== currentToken?.token) {
        clearInterval(timer)
        resolve(newToken.token)
      }
      if (loop > maxLoop) {
        clearInterval(timer)
        resolve('')
      }
      loop++
    }, intervalDelay)
  })
}

class ChatGPTConversation {
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
    const settings = await getChromeExtensionSettings()
    let arkoseToken = undefined
    try {
      arkoseToken = await generateArkoseToken(this.model)
    } catch (e) {
      params.onEvent({
        type: 'error',
        data: { message: (e as any).message || 'Network error.', detail: '' },
      })
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
    } as any
    if (this.conversationId) {
      postMessage.conversation_id = this.conversationId
    }
    if (arkoseToken) {
      // NOTE: 只有gpt-4相关的模型需要传入arkoseToken
      postMessage.arkose_token = arkoseToken
    }
    if (params.meta) {
      // NOTE: 目前只用在了gpt-4-code-interpreter
      postMessage.messages[0].metadata = params.meta
    }
    if (
      settings.currentPlugins &&
      !this.conversationId &&
      this.model === 'gpt-4-plugins'
    ) {
      // NOTE: 只有创建新的对话时才需要传入插件
      postMessage.plugin_ids = settings.currentPlugins
    }
    await fetchSSE(`${CHAT_GPT_PROXY_HOST}/backend-api/conversation`, {
      provider: CHAT_GPT_PROVIDER.OPENAI,
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(Object.assign(postMessage)),
      onMessage: (message: string) => {
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
          // 解析resultText中的markdown链接
          const markdownLinks = newResultText.match(/\[.*?\]\(.*?\)/g)
          if (
            this.conversationId &&
            markdownLinks &&
            markdownLinks.length > 0
          ) {
            Promise.all(
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
                return {
                  original: markdownLink,
                  new: `[${text}](${downloadFile.data})`,
                } as {
                  original: string
                  new: string
                }
              }),
            )
              .then((replaceDataList) => {
                if (replaceDataList) {
                  replaceDataList.forEach((replaceData) => {
                    if (replaceData) {
                      newResultText = newResultText.replace(
                        replaceData.original,
                        replaceData.new,
                      )
                    }
                  })
                }
                params.onEvent({
                  type: 'answer',
                  data: {
                    text: newResultText,
                    messageId: resultMessageId,
                    conversationId: this.conversationId!,
                    parentMessageId: questionId,
                  },
                })
                setTimeout(() => {
                  params.onEvent({ type: 'done' })
                }, 100)
              })
              .catch((e) => {
                console.error(e)
                params.onEvent({ type: 'done' })
              })
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
        const text =
          data.message?.content?.parts?.[0] || data.message?.content?.text
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
        }
      },
    })
      .then()
      .catch((err) => {
        try {
          if (err?.message === 'The user aborted a request.') {
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
    const resp = await chatGptRequest(token, 'GET', '/backend-api/models').then(
      (r) => r.json(),
    )
    if (resp?.models && resp.models.length > 0) {
      this.models = resp.models
    }
    return resp.models
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
      return this.conversations[0]
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
