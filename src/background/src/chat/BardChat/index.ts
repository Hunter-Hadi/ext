import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'

import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import {
  fetchBardRequestParams,
  parseBardResponse,
} from '@/background/src/chat/BardChat/utils'
import BaseChat from '@/background/src/chat/BaseChat'
import { deserializeUploadFile } from '@/background/utils/uplpadFileProcessHelper'
import { IChatUploadFile } from '@/features/chatgpt/types'

function generateReqId() {
  return Math.floor(Math.random() * 900000) + 100000
}

class BardChat extends BaseChat {
  private token?: {
    atValue: string
    blValue: string
  }
  contextIds: string[] = ['', '', '']
  constructor() {
    super('BardChat')
    this.token = undefined
    this.init()
  }
  async init() {
    this.status = 'success'
  }
  async checkAuth() {
    this.active = true
    if (this.token) {
      await this.updateStatus('success')
    } else {
      await this.updateStatus('needAuth')
    }
  }
  async auth() {
    this.active = true
    if (!(await this.syncBardToken())) {
      // need Auth
      await this.updateStatus('needAuth')
      await Browser.tabs.create({
        url: 'https://gemini.google.com/',
        active: true,
      })
    } else {
      await this.updateStatus('success')
    }
  }
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
      max_history_message_cnt?: number
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
    if (!this.conversation) {
      await super.createConversation({
        meta: {
          AIProvider: 'BARD',
          AIModel: BARD_MODELS[0].value,
          maxTokens: BARD_MODELS[0].maxTokens,
        },
      })
    }
    const {
      taskId,
      // include_history = false,
      // streaming = true,
      // regenerate = false,
      // max_history_message_cnt = 0,
    } = options || {}
    if (!this.token) {
      const authResult = await this.syncBardToken()
      if (!authResult) {
        // need Auth
      }
      this.status = 'needAuth'
      await this.updateStatus(this.status)
      onMessage?.({
        type: 'error',
        done: true,
        error:
          'Please log into [gemini.google.com](https://gemini.google.com) and try again.',
        data: {
          text: '',
          conversationId: '',
        },
      })
      return
    }
    const controller = new AbortController()
    const signal = controller.signal
    let isAbort = false
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    try {
      const imageFile = this.chatFiles?.[0]
      const payload = [
        null,
        JSON.stringify([
          [
            JSON.stringify(question),
            0,
            null,
            imageFile?.uploadedUrl
              ? [[[imageFile.uploadedUrl, 1], imageFile.fileName]]
              : [],
          ],
          null,
          this.contextIds,
        ]),
      ]
      const result = await ofetch(
        'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
        {
          method: 'POST',
          signal: signal,
          query: {
            bl: this.token.blValue,
            _reqid: generateReqId(),
            rt: 'c',
          },
          body: new URLSearchParams({
            at: this.token.atValue,
            'f.req': JSON.stringify(payload),
          }),
          parseResponse: (txt) => txt,
        },
      )
        .catch((err) => {
          if (err?.message.includes('The user aborted a request.')) {
            isAbort = true
            onMessage &&
              onMessage({
                type: 'error',
                error: 'manual aborted request.',
                done: true,
                data: { text: '', conversationId: '' },
              })
            return
          }
        })
        .finally(() => {
          this.clearFiles()
        })
      const { text, ids, error } = parseBardResponse(result)
      this.log.debug('result', result, text, ids)
      if (ids) {
        if (isAbort) {
          return
        }
        if (error) {
          onMessage &&
            onMessage({
              type: 'message',
              done: true,
              error: error,
              data: {
                text: '',
                conversationId: this.conversation?.id || '',
              },
            })
        } else if (text) {
          onMessage &&
            onMessage({
              type: 'message',
              done: false,
              error: '',
              data: {
                text,
                conversationId: this.conversation?.id || '',
              },
            })
          onMessage &&
            onMessage({
              type: 'message',
              done: true,
              error: '',
              data: {
                text,
                conversationId: this.conversation?.id || '',
              },
            })
          this.contextIds = ids
        }
      } else {
        onMessage &&
          onMessage({
            type: 'error',
            done: true,
            error: 'BardChat: Unknown Error',
            data: {
              text: '',
              conversationId: this.conversation?.id || '',
            },
          })
      }
    } catch (e) {
      this.log.error(e)
    }
  }
  async syncBardToken() {
    const { atValue, blValue } = await fetchBardRequestParams()
    if (!atValue || !blValue) {
      this.token = undefined
      return false
    }
    this.token = { atValue, blValue }
    return true
  }
  reset() {
    this.contextIds = ['', '', '']
  }
  async uploadFiles(files: IChatUploadFile[]) {
    this.chatFiles = files
    this.chatFiles = await Promise.all(
      files.map(async (file) => {
        if (file.uploadStatus !== 'success') {
          const [fileUnit8Array, type] = deserializeUploadFile(file.file as any)
          const blob = new Blob([fileUnit8Array], { type })
          const headers = {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'push-id': 'feeds/mcudyrk2a4khkz',
            'x-goog-upload-header-content-length': file.fileSize.toString(),
            'x-goog-upload-protocol': 'resumable',
            'x-tenant-id': 'bard-storage',
          }
          const resp = await ofetch.raw(
            'https://content-push.googleapis.com/upload/',
            {
              method: 'POST',
              headers: {
                ...headers,
                'x-goog-upload-command': 'start',
              },
              body: new URLSearchParams({
                [`File name: ${file.fileName}`]: '',
              }),
            },
          )
          const uploadUrl = resp.headers.get('x-goog-upload-url')
          this.log.debug('Bard upload url', uploadUrl)
          if (!uploadUrl) {
            file.uploadErrorMessage = 'Failed to get upload url'
            file.uploadStatus = 'error'
            return file
          }
          const uploadResult = await ofetch.raw(uploadUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'x-goog-upload-command': 'upload, finalize',
              'x-goog-upload-offset': '0',
            },
            body: blob,
          })
          this.log.debug('Bard upload result', uploadResult?._data)
          if (uploadResult.status === 200) {
            file.uploadedUrl = uploadResult._data
            file.uploadStatus = 'success'
          } else {
            file.uploadErrorMessage = 'Failed to upload file'
            file.uploadStatus = 'error'
          }
          return file
        }
        return file
      }),
    )
  }
  async destroy() {
    await this.clearFiles()
    await this.updateStatus('needAuth')
    this.active = false
  }
}

export { BardChat }
