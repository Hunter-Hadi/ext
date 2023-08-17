import BaseChat from '@/background/src/chat/BaseChat'
import {
  fetchBardRequestParams,
  parseBardResponse,
} from '@/background/src/chat/BardChat/utils'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import { getChromeExtensionOnBoardingData } from '@/background/utils'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { deserializeUploadFile } from '@/background/utils/uplpadFileProcessHelper'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'

function generateReqId() {
  return Math.floor(Math.random() * 900000) + 100000
}

class BardChat extends BaseChat {
  private token?: {
    atValue: string
    blValue: string
  }
  contextIds: [string, string, string] = ['', '', '']
  constructor() {
    super('BardChat')
    this.token = undefined
    this.init()
  }
  async init() {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    if (onBoardingData) {
      this.status = onBoardingData.ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_BARD
        ? 'success'
        : 'needAuth'
    }
  }
  async checkAuth() {
    this.active = true
    if (this.token) {
      await this.updateClientStatus('success')
    } else {
      await this.updateClientStatus('needAuth')
    }
  }
  async auth() {
    this.active = true
    if (!(await this.syncBardToken())) {
      // need Auth
      await this.updateClientStatus('needAuth')
      await Browser.tabs.create({
        url: 'https://bard.google.com/',
        active: true,
      })
    } else {
      await this.updateClientStatus('success')
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
      await this.updateClientStatus(this.status)
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
        'https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
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
      const { text, ids } = parseBardResponse(result)
      this.log.debug('result', result, text, ids)
      if (text && ids) {
        if (isAbort) {
          return
        }
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
    await this.updateClientStatus('needAuth')
    this.active = false
  }
}

export { BardChat }
