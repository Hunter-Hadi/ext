import Browser from 'webextension-polyfill'
import {
  checkChatGPTProxyInstance,
  createDaemonProcessTab,
} from '@/background/src/chat/util'
import Log from '@/utils/Log'
import { ChatStatus } from '@/background/provider/chat'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
  getChromeExtensionSettings,
} from '@/background/utils'
import { IOpenAIChatListenTaskEvent } from '@/background/eventType'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import BaseChat from '@/background/src/chat/BaseChat'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { updateChatGPTWhiteListModelAsync } from '@/background/src/chat/OpenAiChat/utils'

const log = new Log('ChatGPT/OpenAIChat')

class OpenAIChat extends BaseChat {
  status: ChatStatus = 'needAuth'
  private cacheLastTimeChatGPTProxyInstance?: Browser.Tabs.Tab
  private chatGPTProxyInstance?: Browser.Tabs.Tab
  private lastActiveTabId?: number
  private isAnswering = false
  // 当前问答中的 taskId
  private currentTaskId?: string
  private questionSender?: Browser.Runtime.MessageSender
  constructor() {
    super('OpenAIChat')
    this.init()
  }
  private init() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'daemon_process') {
        switch (event) {
          case 'OpenAIDaemonProcess_daemonProcessExist': {
            if (!this.active) break
            let isExist =
              (this.chatGPTProxyInstance &&
                (await checkChatGPTProxyInstance(this.chatGPTProxyInstance))) ||
              false
            if (isExist && sender.tab?.id) {
              // 如果是同一个tab，不算存在
              isExist = !(sender.tab.id === this.chatGPTProxyInstance?.id)
              log.info(
                'OpenAIDaemonProcess_daemonProcessExist',
                '是否同一个tab',
                sender.tab.id === this.chatGPTProxyInstance?.id,
              )
            }
            log.info('OpenAIDaemonProcess_daemonProcessExist', isExist)
            return {
              success: true,
              message: '',
              data: {
                isExist,
              },
            }
          }
          case 'OpenAIDaemonProcess_setDaemonProcess':
            {
              if (!this.active) break
              log.info('OpenAIDaemonProcess_setDaemonProcess')
              this.chatGPTProxyInstance = sender.tab
              this.status = 'success'
              await this.updateClientStatus()
              this.listenDaemonProcessTab()
              if (this.lastActiveTabId && this.lastActiveTabId > 0) {
                // active
                await Browser.tabs.update(this.lastActiveTabId, {
                  active: true,
                })
                this.lastActiveTabId = undefined
                // await this.minimizedDaemonProcessWindow()
              }
              return {
                success: true,
                message: '',
                data: {},
              }
            }
            break
          case 'OpenAIDaemonProcess_taskResponse':
            {
              if (!this.active) break
              log.info('OpenAIDaemonProcess_taskResponse', data)
              const { taskId, data: answer, done, error } = data
              if (this.questionSender && data) {
                const { tab } = this.questionSender
                if (tab && tab.id) {
                  this.currentTaskId = taskId
                  await Browser.tabs.sendMessage(tab.id, {
                    id: CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'Client_askChatGPTQuestionResponse',
                    data: {
                      taskId,
                      data: answer,
                      done,
                      error,
                    },
                  })
                  if (done) {
                    this.isAnswering = false
                    this.currentTaskId = undefined
                  }
                }
              }
            }
            break
          case 'OpenAIDaemonProcess_daemonProcessSessionExpired': {
            log.info('OpenAIDaemonProcess_daemonProcessSessionExpired')
            this.status = 'needAuth'
            await this.updateClientStatus()
            return {
              success: true,
              message: '',
              data: {},
            }
            break
          }
          case 'OpenAIDaemonProcess_pong':
            {
              log.info('DaemonProcess_pong', this.chatGPTProxyInstance)
              return {
                success: true,
                message: '',
                data: {},
              }
            }
            break
          default:
            break
        }
      }
      return undefined
    })
  }
  async preAuth() {
    debugger
    this.active = true
    // 如果状态 status 不为 needAuth 说明之前的auth已经完成，不需要再次auth
    if (
      this.status !== 'needAuth' &&
      this.cacheLastTimeChatGPTProxyInstance &&
      this.cacheLastTimeChatGPTProxyInstance.id
    ) {
      const cacheLastTimeTab = await Browser.tabs.get(
        this.cacheLastTimeChatGPTProxyInstance.id,
      )
      if (
        cacheLastTimeTab &&
        cacheLastTimeTab.id &&
        cacheLastTimeTab?.url?.startsWith('https://chat.openai.com')
      ) {
        const result = await Browser.tabs.sendMessage(cacheLastTimeTab.id, {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'OpenAIDaemonProcess_ping',
        })
        if (result && result.success) {
          this.chatGPTProxyInstance = cacheLastTimeTab
          this.status = 'success'
        } else {
          this.cacheLastTimeChatGPTProxyInstance = undefined
          this.status = 'needAuth'
        }
      }
    } else {
      this.status = 'needAuth'
    }
    await this.updateClientStatus()
  }
  async auth(authTabId: number) {
    this.lastActiveTabId = authTabId
    this.active = true
    this.status = 'loading'
    await this.updateClientStatus()
    if (!this.chatGPTProxyInstance) {
      if (
        this.cacheLastTimeChatGPTProxyInstance &&
        this.cacheLastTimeChatGPTProxyInstance.id
      ) {
        const cacheTab = await Browser.tabs.get(
          this.cacheLastTimeChatGPTProxyInstance.id,
        )
        this.chatGPTProxyInstance = cacheTab
          ? cacheTab
          : await createDaemonProcessTab()
      } else {
        this.chatGPTProxyInstance = await createDaemonProcessTab()
      }
    }
    if (this.chatGPTProxyInstance) {
      const windowId = this.chatGPTProxyInstance.windowId
      if (windowId) {
        try {
          await Browser.windows.update(windowId, {
            focused: true,
          })
        } catch (error) {
          console.log('error', error)
        }
      }
      await Browser.tabs.update(this.chatGPTProxyInstance.id, {
        active: true,
      })
      await Browser.tabs.reload(this.chatGPTProxyInstance.id)

      this.status = 'complete'
      this.listenDaemonProcessTab()
      await this.updateClientStatus()
      this.keepAlive()
    }
  }
  async createConversation() {
    const cache = await getChromeExtensionSettings()
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_createConversation',
      {
        conversationId: cache.conversationId || '',
        model: cache.currentModel || '',
      },
    )
    log.info('createConversation', result)
    if (result.success) {
      return result.data.conversationId
    }
    return ''
  }
  async removeConversation(conversationId: string) {
    if (!conversationId) {
      return true
    }
    log.info('removeConversation', conversationId)
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_removeConversation',
      {
        conversationId,
      },
    )
    return result.success
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    if (!this.isAnswering) {
      // 获取model的白名单，因为要动态禁用一些model
      updateChatGPTWhiteListModelAsync().then().catch()
      this.questionSender = sender
      this.isAnswering = true
      const settings = await getChromeExtensionSettings()
      if (settings.currentModel === 'gpt-4-code-interpreter') {
        const successFile = this.chatFiles.find(
          (file) => file.uploadStatus === 'success',
        )
        if (successFile && successFile.uploadedUrl) {
          if (!options.meta) {
            options.meta = {}
          }
          options.meta.attachments = [
            {
              name: successFile.fileName,
              url: successFile.uploadedUrl,
            } as any,
          ]
          this.chatFiles = []
          console.log('Client_chatUploadFilesChange', this.chatFiles)
          backgroundSendAllClientMessage('Client_listenUploadFilesChange', {
            files: this.chatFiles,
          })
        }
      }
      await this.sendDaemonProcessTask(
        'OpenAIDaemonProcess_askChatGPTQuestion',
        {
          taskId,
          question,
          options,
        },
      )
    }
  }
  async abortAskQuestion(messageId: string) {
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_abortAskChatGPTQuestion',
      {
        messageId,
      },
    )
    this.isAnswering = false
    return result.success
  }
  async destroy() {
    log.info('destroy')
    this.clearFiles()
    // this.status = 'needAuth'
    // await this.updateClientStatus()

    if (this.chatGPTProxyInstance && this.chatGPTProxyInstance.id) {
      // await Browser.tabs.remove(this.chatGPTProxyInstance.id)
      this.cacheLastTimeChatGPTProxyInstance = this.chatGPTProxyInstance
    }
    // this.chatGPTProxyInstance = undefined

    this.active = false
    // this.removeListener()
    return
  }
  async sendDaemonProcessTask(event: IOpenAIChatListenTaskEvent, data: any) {
    if (this.chatGPTProxyInstance) {
      if (
        (await checkChatGPTProxyInstance(this.chatGPTProxyInstance)) &&
        this.chatGPTProxyInstance.id
      ) {
        const result = await Browser.tabs.sendMessage(
          this.chatGPTProxyInstance.id,
          {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event,
            data,
          },
        )
        log.info('sendDaemonProcessTask', result)
        return result
      }
    }
    // 不存在守护进程，重新创建
    // TODO: 重新创建守护进程
    await this.destroy()
    return {
      success: false,
      data: {},
      message: 'daemon process not exist',
    }
  }
  async updateClientStatus() {
    if (this.active) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
  // 守护进程定时发送心跳
  async keepAlive(): Promise<void> {
    if (this.chatGPTProxyInstance) {
      if (
        (await checkChatGPTProxyInstance(this.chatGPTProxyInstance)) &&
        this.chatGPTProxyInstance.id
      ) {
        log.info('keepAliveDaemonProcess')
        Browser.tabs.sendMessage(this.chatGPTProxyInstance.id, {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'OpenAIDaemonProcess_ping',
        })
      }
    }
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))
    await delay(20 * 1000)
    if (this.active) {
      await this.keepAlive()
    }
  }
  async tabRemoveListener(tabId: number) {
    if (
      this.chatGPTProxyInstance?.id &&
      tabId === this.chatGPTProxyInstance.id
    ) {
      log.info('守护进程关闭')
      // 如果问答中需要 手动停止
      if (this.questionSender && this.isAnswering) {
        const { tab } = this.questionSender
        if (tab && tab.id && this.currentTaskId) {
          await Browser.tabs.sendMessage(tab.id, {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event: 'Client_askChatGPTQuestionResponse',
            data: {
              taskId: this.currentTaskId,
              data: null,
              done: true,
              error: 'manual aborted request.',
            },
          })
        }
      }
      this.isAnswering = false
      this.chatGPTProxyInstance = undefined
      this.cacheLastTimeChatGPTProxyInstance = undefined
      this.status = 'needAuth'
      await this.updateClientStatus()
    }
  }
  async tabUpdateListener(
    tabId: number,
    changeInfo: Browser.Tabs.OnUpdatedChangeInfoType,
  ) {
    if (tabId === this.chatGPTProxyInstance?.id) {
      const isNotOpenAI = !changeInfo.url?.includes('https://chat.openai.com')
      const isUrlInOpenAIAuth = changeInfo.url?.includes(
        'https://chat.openai.com/auth',
      )
      if (changeInfo.url && (isNotOpenAI || isUrlInOpenAIAuth)) {
        log.info('守护进程url发生变化，守护进程关闭')
        this.cacheLastTimeChatGPTProxyInstance = this.chatGPTProxyInstance
        this.chatGPTProxyInstance = undefined
        this.status = 'needAuth'
        await this.updateClientStatus()
      }
      // 守护进程 tab 更新时，如果 active 中就正常更新状态
      // 如果不是 active 就直接关闭守护进程
      if (this.active) {
        if (
          changeInfo.status === 'loading' ||
          changeInfo.status === 'complete'
        ) {
          log.info('守护进程url状态更新', changeInfo.status)
          this.status = changeInfo.status
          await this.updateClientStatus()
          await this.pingAwaitSuccess()
        }
      } else {
        this.cacheLastTimeChatGPTProxyInstance = this.chatGPTProxyInstance
        this.chatGPTProxyInstance = undefined
        this.status = 'needAuth'
        await this.updateClientStatus()
      }
    }
  }
  async pingAwaitSuccess() {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))
    if (this.chatGPTProxyInstance?.id && this.active) {
      log.info('start ping await success')
      let isOk = false
      for (let i = 0; i < 20; i++) {
        if (isOk) {
          break
        }
        if (!this.chatGPTProxyInstance?.id) {
          break
        }
        Browser.tabs
          .sendMessage(this.chatGPTProxyInstance.id, {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event: 'OpenAIDaemonProcess_ping',
          })
          .then((result) => {
            if (result && result.success) {
              log.info('ping await success')
              this.status = 'success'
              this.updateClientStatus()
              isOk = true
            }
          })
        await delay(1000)
      }
    }
  }
  listenDaemonProcessTab() {
    Browser.tabs.onRemoved.addListener(this.tabRemoveListener.bind(this))
    Browser.tabs.onUpdated.addListener(this.tabUpdateListener.bind(this))
  }
  removeListener() {
    Browser.tabs.onRemoved.removeListener(this.tabRemoveListener.bind(this))
    Browser.tabs.onUpdated.removeListener(this.tabUpdateListener.bind(this))
  }
  async minimizedDaemonProcessWindow() {
    if (this.chatGPTProxyInstance?.windowId) {
      await Browser.windows.update(this.chatGPTProxyInstance.windowId, {
        state: 'minimized',
      })
    }
  }
  async uploadFiles(files: IChatUploadFile[]) {
    this.chatFiles = files
    if (files.filter((file) => file.uploadStatus !== 'success').length > 0) {
      // 这里主要有几个步骤，因为chatgpt的上传文件走的是arkose
      // 1. 确保/pages/chatgpt/codeinterpreter.js被注入到页面中，且页面是codeInterpreter页面
      // 2. 发送文件上传请求
      const result = await this.sendDaemonProcessTask(
        'OpenAIDaemonProcess_pingFilesUpload',
        {},
      )
      if (!result.success) {
        this.chatFiles = this.chatFiles.map((file) => {
          file.uploadStatus = 'error'
          file.uploadErrorMessage = `Your previous upload didn't go through as the Code Interpreter was initializing. It's now ready for your file. Please try uploading it again.`
          return file
        })
        const processTabId = this.chatGPTProxyInstance?.id
        if (processTabId) {
          // 说明ping失败了，需要重新打开一个code_interpreter页面
          const settings = await getChromeExtensionSettings()
          if (
            settings.models?.find(
              (model) => model.slug === 'gpt-4-code-interpreter',
            )
          ) {
            // 说明用户有权限
            Browser.tabs.get(processTabId).then((tab) => {
              if (tab) {
                Browser.tabs.update(tab.id, {
                  url: 'https://chat.openai.com/?model=gpt-4-code-interpreter',
                })
              }
            })
          } else {
            // 说明用户没有权限
            Browser.tabs.get(processTabId).then((tab) => {
              if (tab) {
                Browser.tabs.update(tab.id, {
                  url: 'https://chat.openai.com/?model=gpt-4',
                })
              }
            })
          }
        }
        return
      }
      this.chatFiles = this.chatFiles.map((file) => {
        file.uploadStatus = 'uploading'
        return file
      })
      // 说明ping成功了，且当前页面在code_interpreter页面
      // 发送文件上传请求
      await this.sendDaemonProcessTask('OpenAIDaemonProcess_filesUpload', {
        files,
      })
    }
  }
}

export { OpenAIChat }
