import { ofetch } from 'ofetch'

import BaseChat from '@/background/src/chat/BaseChat'
import { BingWebBot } from '@/background/src/chat/BingChat/bing'
import { Event } from '@/background/src/chat/BingChat/bing/types'
import { requestHostPermission } from '@/background/utils'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class BingChat extends BaseChat {
  private bingLib: BingWebBot
  constructor() {
    super('BingChat')
    this.bingLib = new BingWebBot()
    this.status = 'success'
    this.init()
  }
  async init() {
    this.log.info('init')
    this.status = 'success'
  }
  async auth() {
    this.active = true
    await this.updateStatus('success')
  }
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
      max_history_message_cnt?: number
      clientTabId?: number
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
    const { taskId, clientTabId } = options || {}
    this.log.info('askChatGPT')
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    const file = this.chatFiles?.[0]
    if (!(await requestHostPermission('wss://*.bing.com/'))) {
      onMessage?.({
        type: 'error',
        done: true,
        error: 'Missing bing.com permission',
        data: {
          text: 'Missing bing.com permission',
          conversationId: '',
        },
      })
    }
    await this.bingLib.doSendMessage({
      clientTabId,
      prompt: question,
      imageUrl: file?.uploadedUrl,
      signal,
      onEvent: (event: Event) => {
        console.log(`bingLib onEvent`, event)
        if (event.type === 'ERROR') {
          onMessage?.({
            type: 'error',
            done: true,
            error: event.error,
            data: {
              text: '',
              conversationId: '',
            },
          })
          if (taskId) {
            this.abortTask(taskId)
            this.bingLib.resetConversation()
          }
        } else if (event.type === 'UPDATE_ANSWER') {
          onMessage?.({
            type: 'message',
            done: false,
            error: '',
            data: {
              text: event.data.text,
              conversationId: event.data.conversationId,
            },
          })
        } else if (event.type === 'DONE') {
          onMessage?.({
            type: 'message',
            done: true,
            error: '',
            data: {
              text: '',
              conversationId: event.data.conversationId,
            },
          })
        }
      },
    })
    await this.clearFiles()
  }
  async uploadFiles(files: IChatUploadFile[]) {
    this.chatFiles = files
    this.chatFiles = await Promise.all(
      files.map(async (file) => {
        if (file.uploadStatus !== 'success' && file.base64Data) {
          try {
            const formData = new FormData()
            formData.append(
              'knowledgeRequest',
              JSON.stringify({
                imageInfo: {},
                knowledgeRequest: {
                  invokedSkills: ['ImageById'],
                  subscriptionId: 'Bing.Chat.Multimodal.Underside',
                  invokedSkillsRequestData: { enableFaceBlur: true },
                  convoData: { convoid: '', convotone: 'Balanced' },
                },
              }),
            )
            formData.append(
              'imageBase64',
              file.base64Data.replace('data:', '').replace(/^.+,/, ''),
            )
            const response = await ofetch<{ blobId: string }>(
              'https://www.bing.com/images/kblob',
              {
                method: 'POST',
                body: formData,
              },
            )
            if (response?.blobId) {
              file.uploadedUrl = `https://www.bing.com/images/blob?bcid=${response.blobId}`
              file.uploadStatus = 'success'
            } else {
              file.uploadStatus = 'error'
              file.uploadErrorMessage = `Failed to upload image`
            }
            this.log.info('uploadFiles', file)
          } catch (e) {
            file.uploadStatus = 'error'
            file.uploadErrorMessage = `Failed to upload image`
            this.log.error('uploadFiles', e, file)
          }
          return file
        }
        return file
      }),
    )
  }

  async removeConversation() {
    this.bingLib.resetConversation()
    return Promise.resolve(true)
  }
  async destroy(): Promise<void> {
    this.bingLib.resetConversation()
    await this.clearFiles()
  }
}
export { BingChat }
