import WebSocketAsPromised from 'websocket-as-promised'
import Browser from 'webextension-polyfill'
export async function requestHostPermission(host: string) {
  return Browser.permissions.request({ origins: [host] })
}

import {
  GRAPHQL_QUERIES,
  PoeSettings,
  getChatId,
  getPoeSettings,
  gqlRequest,
} from './api'
import { SendMessageParams } from '@/background/src/chat/BingChat/bing/types'
import { PoeModel } from '@/background/src/chat/PoeChat/type'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'

interface ChatMessage {
  id: string
  author: string
  text: string
  state: 'complete' | 'incomplete'
  messageId: number
}

interface WebsocketMessage {
  message_type: 'subscriptionUpdate'
  payload: {
    subscription_name: 'messageAdded'
    unique_id: string
    data: {
      messageAdded: ChatMessage
    }
  }
}

interface ConversationContext {
  poeSettings: PoeSettings
  botId: string // bot model id
  chatId: number // user specific chat id for the bot
  wsp: WebSocketAsPromised
}

export class PoeWebBot {
  private conversationContext?: ConversationContext

  async doSendMessage(params: SendMessageParams) {
    if (!(await requestHostPermission('https://*.poe.com/'))) {
      params.onEvent({
        type: 'ERROR',
        error: 'Missing poe.com permission.',
      })
      return
    }

    if (!this.conversationContext) {
      const appLocalStorage = await getChromeExtensionLocalStorage()
      const { poeModel: botId } = {
        poeModel:
          appLocalStorage.thirdProviderSettings?.CLAUDE?.model ||
          PoeModel.ClaudeInstant,
      }
      console.log('Using poe model', botId)
      try {
        const { poeSettings, chatId } = await this.getChatInfo(botId)
        const wsp = await this.connectWebsocket(poeSettings)
        await this.subscribe(poeSettings)
        this.conversationContext = { botId, chatId, poeSettings, wsp }
      } catch (e) {
        params.onEvent({
          type: 'ERROR',
          error: (e as any).message,
        })
        return
      }
    }

    const wsp = this.conversationContext.wsp

    const onUnpackedMessageListener = (data: any) => {
      console.debug('onUnpackedMessage', data)
      const messages: WebsocketMessage[] = data.messages.map((s: string) =>
        JSON.parse(s),
      )
      for (const m of messages) {
        if (
          m.message_type === 'subscriptionUpdate' &&
          m.payload.subscription_name === 'messageAdded'
        ) {
          const chatMessage = m.payload.data.messageAdded
          console.log(chatMessage)
          params.onEvent({
            type: 'UPDATE_ANSWER',
            data: {
              text: chatMessage.text,
              conversationId: String(this.conversationContext?.chatId || ''),
            },
          })
          if (chatMessage.state === 'complete') {
            params.onEvent({
              type: 'DONE',
              data: {
                conversationId: String(this.conversationContext?.chatId || ''),
              },
            })
            wsp.onUnpackedMessage.removeAllListeners()
          }
        }
      }
    }

    wsp.onUnpackedMessage.addListener(onUnpackedMessageListener)
    try {
      await wsp.open()
    } catch (e) {
      wsp.removeAllListeners()
      wsp.close()
      params.onEvent({
        type: 'ERROR',
        error:
          "Please ensure [you've logged into poe.com](https://www.poe.com) and retry.",
      })
      return
    }

    try {
      await this.sendMessageRequest(params.prompt)
    } catch (err) {
      wsp.removeAllListeners()
      wsp.close()
      params.onEvent({
        type: 'ERROR',
        error: (err as any).message,
      })
    }
  }

  resetConversation() {
    console.log('Using poe mod clear!')
    if (!this.conversationContext) {
      return
    }
    const wsp = this.conversationContext.wsp
    wsp.removeAllListeners()
    wsp.close()
    this.sendChatBreak()
    this.conversationContext = undefined
  }

  private async getChatInfo(botId: string) {
    const poeSettings = await getPoeSettings()
    const chatId = await getChatId(botId, poeSettings)
    return { poeSettings, chatId }
  }

  private async sendMessageRequest(message: string) {
    const { poeSettings, botId, chatId } = this.conversationContext!
    const resp = await gqlRequest(
      'SendMessageMutation',
      {
        bot: botId,
        chatId,
        query: message,
        source: null,
        withChatBreak: false,
      },
      poeSettings,
    )
    if (!resp.data.messageEdgeCreate.message) {
      throw new Error(
        'You’ve reached the daily free message limit for this model',
      )
    }
  }

  private async sendChatBreak() {
    const { chatId, poeSettings } = this.conversationContext!
    await gqlRequest('AddMessageBreakMutation', { chatId }, poeSettings)
  }

  private async subscribe(poeSettings: PoeSettings) {
    await gqlRequest(
      'SubscriptionsMutation',
      {
        subscriptions: [
          {
            subscriptionName: 'messageAdded',
            query: GRAPHQL_QUERIES.MessageAddedSubscription,
          },
        ],
      },
      poeSettings,
    )
  }

  private async getWebsocketUrl(poeSettings: PoeSettings) {
    const domain = `tch${Math.floor(Math.random() * 1000000) + 1}`
    const channel = poeSettings.tchannelData
    return `wss://${domain}.tch.${channel.baseHost}/up/${channel.boxName}/updates?min_seq=${channel.minSeq}&channel=${channel.channel}&hash=${channel.channelHash}`
  }

  private async connectWebsocket(poeSettings: PoeSettings) {
    const wsUrl = await this.getWebsocketUrl(poeSettings)
    console.debug('ws url', wsUrl)

    const wsp = new WebSocketAsPromised(wsUrl, {
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data as string),
    })

    return wsp
  }
}
