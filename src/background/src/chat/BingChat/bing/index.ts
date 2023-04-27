import { createConversation } from './api'
import {
  BingConversationStyle,
  ChatResponseMessage,
  ConversationInfo,
  InvocationEventType,
  SendMessageParams,
} from './types'
import { convertMessageToMarkdown, websocketUtils } from './utils'
import WebSocketAsPromised from 'websocket-as-promised'

const styleOptionMap: Record<BingConversationStyle, string> = {
  [BingConversationStyle.Balanced]: 'harmonyv3',
  [BingConversationStyle.Creative]: 'h3imaginative',
  [BingConversationStyle.Precise]: 'h3precise',
}

export class BingWebBot {
  private conversationContext?: ConversationInfo

  private buildChatRequest(conversation: ConversationInfo, message: string) {
    const styleOption = styleOptionMap[conversation.conversationStyle]
    return {
      arguments: [
        {
          source: 'cib',
          optionsSets: [
            'deepleo',
            'nlu_direct_response_filter',
            'disable_emoji_spoken_text',
            'responsible_ai_policy_235',
            'enablemm',
            'dtappid',
            'rai253',
            'dv3sugg',
            styleOption,
          ],
          allowedMessageTypes: ['Chat', 'InternalSearchQuery'],
          isStartOfSession: conversation.invocationId === 0,
          message: {
            author: 'user',
            inputMethod: 'Keyboard',
            text: message,
            messageType: 'Chat',
          },
          conversationId: conversation.conversationId,
          conversationSignature: conversation.conversationSignature,
          participant: { id: conversation.clientId },
        },
      ],
      invocationId: conversation.invocationId.toString(),
      target: 'chat',
      type: InvocationEventType.StreamInvocation,
    }
  }

  async doSendMessage(params: SendMessageParams) {
    if (!this.conversationContext) {
      try {
        const conversation = await createConversation()
        const bingConversationStyle = BingConversationStyle.Balanced
        this.conversationContext = {
          conversationId: conversation.conversationId,
          conversationSignature: conversation.conversationSignature,
          clientId: conversation.clientId,
          invocationId: 0,
          conversationStyle: bingConversationStyle,
        }
      } catch (e) {
        params.onEvent({
          type: 'ERROR',
          error: (e as any).message || e,
        })
        return
      }
    }
    const conversation = this.conversationContext!
    const wsp = new WebSocketAsPromised(
      'wss://sydney.bing.com/sydney/ChatHub',
      {
        packMessage: websocketUtils.packMessage,
        unpackMessage: websocketUtils.unpackMessage,
      },
    )
    wsp.onUnpackedMessage.addListener((events: any) => {
      console.log(JSON.stringify(events), 'bing')
      for (const event of events) {
        if (JSON.stringify(event) === '{}') {
          wsp.sendPacked({ type: 6 })
          wsp.sendPacked(this.buildChatRequest(conversation, params.prompt))
          conversation.invocationId += 1
        } else if (event.type === 6) {
          wsp.sendPacked({ type: 6 })
        } else if (event.type === 3) {
          params.onEvent({
            type: 'DONE',
            data: {
              conversationId: conversation.conversationId,
            },
          })
          wsp.removeAllListeners()
          wsp.close()
        } else if (event.type === 1) {
          const text = convertMessageToMarkdown(event.arguments[0]?.messages[0])
          if (text) {
            params.onEvent({
              type: 'UPDATE_ANSWER',
              data: { text, conversationId: conversation.conversationId },
            })
          }
        } else if (event.type === 2) {
          const messages = event.item.messages as ChatResponseMessage[]
          const limited = messages.some(
            (message) => message.contentOrigin === 'TurnLimiter',
          )
          if (limited) {
            params.onEvent({
              type: 'ERROR',
              error: `Sorry, you have reached chat turns limit in this conversation.`,
            })
          }
        }
      }
    })

    wsp.onClose.addListener(() => {
      params.onEvent({
        type: 'DONE',
        data: { conversationId: conversation.conversationId },
      })
    })

    params.signal?.addEventListener('abort', () => {
      wsp.removeAllListeners()
      wsp.close()
      params.onEvent({
        type: 'ERROR',
        error: 'manual aborted request.',
      })
    })
    await wsp.open()
    wsp.sendPacked({ protocol: 'json', version: 1 })
  }

  resetConversation() {
    this.conversationContext = undefined
  }
}
