import { createConversation } from './api'
import {
  BingConversationStyle,
  ChatResponseMessage,
  ConversationInfo,
  InvocationEventType,
  SendMessageParams,
} from './types'
import { convertMessageToMarkdown } from './utils'
import { getThirdProviderSettings } from '@/background/src/chat/util'
import { v4 as uuidV4 } from 'uuid'
import { ClientProxyWebSocket } from '@/background/utils/clientProxyWebsocket/background'

const styleOptionMap: Record<BingConversationStyle, string> = {
  [BingConversationStyle.Balanced]: '',
  [BingConversationStyle.Creative]: 'h3imaginative',
  [BingConversationStyle.Precise]: 'h3precise',
}

const OPTIONS_SETS = [
  'nlu_direct_response_filter',
  'deepleo',
  'disable_emoji_spoken_text',
  'responsible_ai_policy_235',
  'enablemm',
  'dv3sugg',
  'iyxapbing',
  'iycapbing',
  'galileo',
  'saharagenconv5',
  'log2sph',
  'savememfilter',
  'uprofgen',
  'uprofupd',
  'uprofupdasy',
  'vidsumsnip',
]

const SLICE_IDS = [
  'tnaenableux',
  'adssqovr',
  'tnaenable',
  'arankc_1_9_3',
  'rankcf',
  '0731ziv2s0',
  '926buffall',
  'inosanewsmob',
  'wrapnoins',
  'prechr',
  'sydtransl',
  '806log2sph',
  '927uprofasy',
  '919vidsnip',
  '829suggtrims0',
]

export class BingWebBot {
  private conversationContext?: ConversationInfo

  private buildChatRequest(
    conversation: ConversationInfo,
    message: string,
    imageUrl?: string,
  ) {
    const requestId = uuidV4()
    const styleOption = styleOptionMap[conversation.conversationStyle]
    const optionsSets = OPTIONS_SETS.concat(styleOption || [])
    return {
      arguments: [
        {
          source: 'cib',
          optionsSets,
          allowedMessageTypes: [
            'Chat',
            'InternalSearchQuery',
            'Disengaged',
            'InternalLoaderMessage',
            'SemanticSerp',
            'GenerateContentQuery',
            'SearchQuery',
          ],
          sliceIds: SLICE_IDS,
          verbosity: 'verbose',
          scenario: 'SERP',
          plugins: [],
          isStartOfSession: conversation.invocationId === 0,
          message: {
            timestamp: new Date().toISOString(),
            author: 'user',
            inputMethod: 'Keyboard',
            text: message,
            imageUrl,
            messageType: 'Chat',
            requestId,
            messageId: requestId,
          },
          requestId,
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
        const bingSettings = await getThirdProviderSettings('BING')
        this.conversationContext = {
          conversationId: conversation.conversationId,
          conversationSignature: conversation.conversationSignature,
          encryptedConversationSignature:
            conversation.encryptedConversationSignature,
          clientId: conversation.clientId,
          invocationId: 0,
          conversationStyle:
            bingSettings?.conversationStyle || BingConversationStyle.Balanced,
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
    const wsp = new ClientProxyWebSocket('wss://sydney.bing.com/sydney/ChatHub')
    await wsp.init(params.clientTabId)
    // const wsp = new WebSocketAsPromised(
    //   'wss://sydney.bing.com/sydney/ChatHub',
    //   {
    //     packMessage: websocketUtils.packMessage,
    //     unpackMessage: websocketUtils.unpackMessage,
    //   },
    // )
    wsp.onUnpackedMessage.addListener((events: any) => {
      console.log(JSON.stringify(events), 'bing')
      for (const event of events) {
        if (JSON.stringify(event) === '{}') {
          wsp.sendPacked({ type: 6 })
          wsp.sendPacked(
            this.buildChatRequest(conversation, params.prompt, params.imageUrl),
          )
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
          const message = event.arguments[0]?.messages?.[0]
          const text = message ? convertMessageToMarkdown(message) : ''
          if (text) {
            params.onEvent({
              type: 'UPDATE_ANSWER',
              data: { text, conversationId: conversation.conversationId },
            })
          }
        } else if (event.type === 2) {
          const messages =
            (event?.item?.messages as ChatResponseMessage[]) || []
          const errorMessage = event?.item?.result?.error
          let hasError = false
          const limited = messages.some(
            (message) => message.contentOrigin === 'TurnLimiter',
          )
          if (limited) {
            hasError = true
            params.onEvent({
              type: 'ERROR',
              error: `Sorry, you have reached chat turns limit in this conversation.`,
            })
          }
          // 触发微软验证码了
          if (errorMessage === 'User needs to solve CAPTCHA to continue.') {
            hasError = true
            const bingChallengeUrl = `\n\nPlease visit [bing.com/turing/captcha/challenge](https://www.bing.com/turing/captcha/challenge), complete any required verifications, then try again.`
            params.onEvent({
              type: 'ERROR',
              error: errorMessage + bingChallengeUrl,
            })
          }
          if (messages.length === 0) {
            if (event?.item?.result?.value === 'UnauthorizedRequest') {
              hasError = true
              params.onEvent({
                type: 'ERROR',
                error:
                  errorMessage +
                  `\n\nPlease sign in to [bing.com](http://bing.com/), complete any required verifications, then try again.`,
              })
              return
            }
          }
          if (hasError) {
            this.conversationContext = undefined
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
    await wsp.open('bing')
    await wsp.sendPacked({ protocol: 'json', version: 1 })
  }

  resetConversation() {
    this.conversationContext = undefined
  }
}
