import Browser from 'webextension-polyfill'

import { IOpenAIChatListenTaskEvent } from '@/background/eventType'
import { ConversationStatusType } from '@/background/provider/chat'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import BaseChat from '@/background/src/chat/BaseChat'
import ChatGPTSocketManager from '@/background/src/chat/OpenAIChat/socket'
import {
  checkChatGPTProxyInstance,
  createDaemonProcessTab,
  getAIProviderSettings,
} from '@/background/src/chat/util'
import ConversationManager from '@/background/src/chatConversations'
import {
  backgroundSendAllClientMessage,
  backgroundSendClientMessage,
  createBackgroundMessageListener,
  safeGetBrowserTab,
} from '@/background/utils'
import {
  CHATGPT_WEBAPP_HOST,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'
import { wait } from '@/utils'
import Log from '@/utils/Log'

const log = new Log('ChatGPT/OpenAIChat')

class OpenAIChat extends BaseChat {
  status: ConversationStatusType = 'needAuth'
  private cacheLastTimeChatGPTProxyInstance?: Browser.Tabs.Tab
  private chatGPTProxyInstance?: Browser.Tabs.Tab
  private lastActiveTabId?: number
  private isAnswering = false
  // 当前问答中的 taskId
  private currentTaskId?: string
  private questionSender?: Browser.Runtime.MessageSender
  private token?: string
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
              const { token } = data
              if (token) {
                this.token = token
              }
              log.info('OpenAIDaemonProcess_setDaemonProcess')
              this.chatGPTProxyInstance = sender.tab
              this.status = 'success'
              await this.updateClientConversationChatStatus()
              this.listenDaemonProcessTab()
              if (this.lastActiveTabId && this.lastActiveTabId > 0) {
                await backgroundSendClientMessage(
                  this.lastActiveTabId,
                  'Client_updateAppSettings',
                  {},
                )
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
                    id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
            if (!this.active) break
            await this.updateClientConversationChatStatus()
            // active sender tab
            if (sender.tab) {
              const { tab } = sender
              if (tab && tab.id) {
                await Browser.tabs.update(tab.id, {
                  active: true,
                })
                if (tab.windowId) {
                  await Browser.windows.update(tab.windowId, {
                    focused: true,
                    state: 'normal',
                  })
                }
              }
            }
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
    this.active = true
    // 如果状态 status 不为 needAuth 说明之前的auth已经完成，不需要再次auth
    if (
      this.status !== 'needAuth' &&
      this.cacheLastTimeChatGPTProxyInstance &&
      this.cacheLastTimeChatGPTProxyInstance.id
    ) {
      const cacheLastTimeTab = await safeGetBrowserTab(
        this.cacheLastTimeChatGPTProxyInstance.id,
      )
      if (
        cacheLastTimeTab &&
        cacheLastTimeTab.id &&
        cacheLastTimeTab?.url?.startsWith(`https://${CHATGPT_WEBAPP_HOST}`)
      ) {
        const result = await Browser.tabs.sendMessage(cacheLastTimeTab.id, {
          id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
    await this.updateClientConversationChatStatus()
  }
  async auth(authTabId: number) {
    this.lastActiveTabId = authTabId
    this.active = true
    this.status = 'loading'
    await this.updateClientConversationChatStatus()
    if (!this.chatGPTProxyInstance) {
      if (
        this.cacheLastTimeChatGPTProxyInstance &&
        this.cacheLastTimeChatGPTProxyInstance.id
      ) {
        const cacheTab = await safeGetBrowserTab(
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
      await this.updateClientConversationChatStatus()
      this.cacheLastTimeChatGPTProxyInstance = this.chatGPTProxyInstance
      this.keepAlive()
    }
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    const currentModel =
      initConversationData.meta?.AIModel ||
      (await getAIProviderSettings('OPENAI'))?.model
    const conversationId = await super.createConversation({
      ...initConversationData,
      meta: {
        ...initConversationData.meta,
        AIModel: currentModel,
      },
    })
    this.conversation = await ConversationManager.getConversationById(
      conversationId,
    )
    await this.sendDaemonProcessTask('OpenAIDaemonProcess_createConversation', {
      conversationId: this.conversation?.meta?.AIConversationId || '',
      model: this.conversation?.meta?.AIModel || '',
    })
    return this.conversation?.id || ''
  }
  async removeConversation(conversationId: string) {
    if (this.conversation) {
      // 更新conversation, 获取实际的ChatGPT conversation id
      this.conversation = await ConversationManager.getConversationById(
        this.conversation.id,
      )
    }
    if (!this.conversation?.meta.AIConversationId) {
      await this.removeConversationWithCache()
      return true
    }
    log.info('removeConversation', conversationId)
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_removeConversation',
      {
        conversationId: this.conversation.meta.AIConversationId,
      },
    )
    await this.removeConversationWithCache()
    return result.success
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    const meta = question.meta || {}
    if (!this.isAnswering) {
      this.questionSender = sender
      this.isAnswering = true
      const model = this.conversation?.meta.AIModel || ''
      if (model === 'gpt-4-code-interpreter' || model === 'gpt-4') {
        const successFiles = this.chatFiles.filter(
          (file) => file.uploadStatus === 'success' && file.uploadedFileId,
        )
        if (successFiles.length > 0) {
          meta.attachments = successFiles.map((successFile) => {
            return {
              name: successFile.fileName,
              id: successFile.uploadedFileId,
              size: successFile.fileSize,
              type: successFile.fileType,
            } as any
          })
          this.chatFiles = []
          backgroundSendAllClientMessage('Client_listenUploadFilesChange', {
            conversationId: this.conversation?.id,
            files: this.chatFiles,
          })
        }
      }
      meta.ChatGPTAIModel = this.conversation?.meta?.AIModel
      // 初始化socket
      ChatGPTSocketManager.socketService.init(this.token || '')
      // 判断是否是socket
      const isSocket =
        await ChatGPTSocketManager.socketService.detectChatGPTWebappIsSocket()
      if (isSocket) {
        // 如果是socket, 在提问之前先连接socket
        const isConnectSuccess =
          await ChatGPTSocketManager.socketService.connect()
        if (isConnectSuccess) {
          // 如果连接成功，监听question.messageId的消息
          ChatGPTSocketManager.socketService.onMessageIdListener(
            question.messageId,
            async (messageId, event) => {
              console.log('ChatGPTSocketManager', event)
              if (this.questionSender?.tab?.id) {
                if (!this.isAnswering) {
                  // 说明手动结束了
                  await Browser.tabs.sendMessage(this.questionSender.tab.id, {
                    id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'Client_askChatGPTQuestionResponse',
                    data: {
                      taskId,
                      data: {
                        messageId: event.messageId,
                        parentMessageId: event.parentMessageId,
                        conversationId: event.conversationId,
                        text: event.text,
                      },
                      done: true,
                      error: event.error,
                    },
                  })
                  return
                }
                // messageId: string
                // parentMessageId: string
                // conversationId: string
                // text: string
                // originalMessage?: IAIResponseOriginalMessage
                await Browser.tabs.sendMessage(this.questionSender.tab.id, {
                  id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
                  event: 'Client_askChatGPTQuestionResponse',
                  data: {
                    taskId,
                    data: {
                      messageId: event.messageId,
                      parentMessageId: event.parentMessageId,
                      conversationId: event.conversationId,
                      text: event.text,
                    },
                    done: event.done,
                    error: event.error,
                  },
                })
              }
              if (event.done) {
                this.isAnswering = false
              }
            },
          )
          // 发送真正的conversationID
          if (this.conversation?.meta.AIConversationId) {
            question.conversationId = this.conversation.meta.AIConversationId
          }
          this.sendDaemonProcessTask('OpenAIDaemonProcess_askChatGPTQuestion', {
            taskId,
            question,
            meta: meta,
            isWebSocket: true,
          })
        } else if (this.questionSender.tab?.id) {
          // 如果连接失败，直接返回错误
          await Browser.tabs.sendMessage(this.questionSender.tab.id, {
            id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
            event: 'Client_askChatGPTQuestionResponse',
            data: {
              taskId,
              data: null,
              done: true,
              error: 'socket connect failed',
            },
          })
        }
      } else {
        await this.sendDaemonProcessTask(
          'OpenAIDaemonProcess_askChatGPTQuestion',
          {
            taskId,
            question,
            meta: meta,
            isWebSocket: false,
          },
        )
      }
    }
  }
  async abortAskQuestion(messageId: string) {
    // 目前ChatGPT webapp就是啥也没做，直接stop
    if (ChatGPTSocketManager.socketService.isSocketService) {
      this.isAnswering = false
      return true
    }
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
    ChatGPTSocketManager.socketService.disconnect()
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
            id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
            event,
            data,
          },
        )
        log.info('sendDaemonProcessTask', result)
        return result
      }
    }
    // 不存在守护进程，重新创建
    await this.destroy()
    return {
      success: false,
      data: {},
      message: 'daemon process not exist',
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
          id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'OpenAIDaemonProcess_ping',
        })
      }
    }
    await wait(20 * 1000)
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
            id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
      await this.updateClientConversationChatStatus()
    }
  }
  async tabUpdateListener(
    tabId: number,
    changeInfo: Browser.Tabs.OnUpdatedChangeInfoType,
  ) {
    if (tabId === this.chatGPTProxyInstance?.id) {
      const isNotOpenAI = !changeInfo.url?.includes(
        `https://${CHATGPT_WEBAPP_HOST}`,
      )
      const isUrlInOpenAIAuth = changeInfo.url?.includes(
        `https://${CHATGPT_WEBAPP_HOST}/auth`,
      )
      if (changeInfo.url && (isNotOpenAI || isUrlInOpenAIAuth)) {
        log.info('守护进程url发生变化，守护进程关闭')
        this.cacheLastTimeChatGPTProxyInstance = this.chatGPTProxyInstance
        this.chatGPTProxyInstance = undefined
        this.status = 'needAuth'
        await this.updateClientConversationChatStatus()
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
          await this.updateClientConversationChatStatus()
          await this.pingAwaitSuccess()
        }
      } else {
        this.cacheLastTimeChatGPTProxyInstance = this.chatGPTProxyInstance
        this.chatGPTProxyInstance = undefined
        this.status = 'needAuth'
        await this.updateClientConversationChatStatus()
      }
    }
  }
  async pingAwaitSuccess() {
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
            id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
            event: 'OpenAIDaemonProcess_ping',
          })
          .then((result) => {
            if (result && result.success) {
              log.info('ping await success')
              this.status = 'success'
              this.updateClientConversationChatStatus()
              isOk = true
            }
          })
        await wait(1000)
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
      // 1. 确保/pages/chatgpt/codeinterpreter.js被注入到页面中，且页面是codeInterpreter页面，确保有conversation
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
          const settings = await getAIProviderSettings('OPENAI')
          if (
            settings?.modelOptions?.find(
              (model) => model.slug === 'gpt-4-code-interpreter',
            )
          ) {
            // 说明用户有权限
            safeGetBrowserTab(processTabId).then((tab) => {
              if (tab) {
                Browser.tabs.update(tab.id, {
                  url: `https://${CHATGPT_WEBAPP_HOST}/?model=gpt-4-code-interpreter`,
                })
              }
            })
          } else {
            // 说明用户没有权限
            safeGetBrowserTab(processTabId).then((tab) => {
              if (tab) {
                Browser.tabs.update(tab.id, {
                  url: `https://${CHATGPT_WEBAPP_HOST}/?model=gpt-4`,
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
        MaxAIConversationId: this.conversation?.id,
      })
    }
  }
}

export { OpenAIChat }
