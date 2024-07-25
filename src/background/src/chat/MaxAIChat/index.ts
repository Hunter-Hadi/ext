import Browser from 'webextension-polyfill'

import { ConversationStatusType } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import Log from '@/utils/Log'

const log = new Log('Background/Chat/MaxAIFreeChat')

class MaxAIChat extends BaseChat {
  status: ConversationStatusType = 'success'
  private lastActiveTabId?: number
  private token?: string
  constructor() {
    super('MaxAIFreeChat')
    this.init()
  }
  private init() {
    log.info('init')
  }
  async preAuth() {
    this.active = true
    this.status = 'success'
    await this.updateClientConversationChatStatus()
    // await this.checkTokenAndUpdateStatus()
  }
  async auth(authTabId: number) {
    this.active = true
    this.lastActiveTabId = authTabId
    await this.checkTokenAndUpdateStatus()
    if (this.status === 'needAuth') {
      // 引导去登陆
      await Browser.tabs.create({
        active: true,
        url: APP_USE_CHAT_GPT_HOST,
      })
    }
    await this.updateClientConversationChatStatus()
  }
  async checkTokenAndUpdateStatus() {
    const prevStatus = this.status
    this.token = await this.getToken()
    this.status = this.token ? 'success' : 'needAuth'
    if (prevStatus !== this.status) {
      log.info('checkTokenAndUpdateStatus', this.status, this.lastActiveTabId)
      // 本来要切回去chat页面,流程改了，不需要这个变量来切换了
      this.lastActiveTabId = undefined
    }
    await this.updateClientConversationChatStatus()
  }

  async destroy() {
    log.info('destroy')
    this.status = 'needAuth'
    // await this.updateClientStatus()
    this.active = false
  }
  private async getToken() {
    return await getMaxAIChromeExtensionAccessToken()
  }
}
export { MaxAIChat }
