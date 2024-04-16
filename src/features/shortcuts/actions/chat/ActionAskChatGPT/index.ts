import lodashGet from 'lodash-es/get'
import last from 'lodash-es/last'
import { v4 as uuidV4 } from 'uuid'

import {
  checkISThirdPartyAIProvider,
  clientAskAIQuestion,
} from '@/background/src/chat/util'
import { isPermissionCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import {
  ContentScriptConnectionV2,
  getAIProviderChatFiles,
} from '@/features/chatgpt'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import {
  IAIResponseMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { increaseChatGPTRequestCount } from '@/features/chatgpt/utils/chatRequestRecorder'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import {
  IShortcutEngineExternalEngine,
  withLoadingDecorators,
} from '@/features/shortcuts'
import generatePromptAdditionalText from '@/features/shortcuts/actions/chat/ActionAskChatGPT/generatePromptAdditionalText'
import generateUserMessageContexts from '@/features/shortcuts/actions/chat/ActionAskChatGPT/generateUserMessageContexts'
import Action from '@/features/shortcuts/core/Action'
import {
  clearUserInput,
  parametersParserDecorator,
  templateParserDecorator,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  chatGPTCommonErrorInterceptor,
  clientFetchMaxAIAPI,
} from '@/features/shortcuts/utils'
import getContextMenuNamePrefixWithHost from '@/features/shortcuts/utils/getContextMenuNamePrefixWithHost'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export class ActionAskChatGPT extends Action {
  static type: ActionIdentifier = 'ASK_CHATGPT'
  private question?: IUserChatMessage
  private answer?: IAIResponseMessage
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @parametersParserDecorator()
  @templateParserDecorator()
  @clearUserInput(true)
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const {
        clientConversationEngine,
        shortcutsMessageChannelEngine,
        clientMessageChannelEngine,
      } = engine
      const askChatGPTType =
        this.parameters.AskChatGPTActionType || 'ASK_CHAT_GPT'
      // 是否启用了Response指定语言语言
      const isEnableAIResponseLanguage =
        this.parameters.isEnabledDetectAIResponseLanguage !== false
      const conversationId =
        this.parameters.AskChatGPTActionQuestion?.conversationId ||
        clientConversationEngine?.currentConversationIdRef?.current ||
        ''
      const text = String(
        this.parameters.AskChatGPTActionQuestion?.text ||
          this.parameters.compliedTemplate ||
          params.LAST_ACTION_OUTPUT ||
          '',
      )
      const messageId =
        this.parameters.AskChatGPTActionQuestion?.messageId || uuidV4()
      this.question = {
        type: 'user',
        ...this.parameters.AskChatGPTActionQuestion,
        conversationId,
        messageId,
        text,
      }
      // 如果没有messageId，则生成一个messageId
      if (!this.question.messageId) {
        this.question.messageId = uuidV4()
      }
      // 如果没有conversationId，则生成一个conversationId
      if (!this.question.conversationId) {
        this.question.conversationId = conversationId
      }
      // 如果没有parentMessageId，则生成一个parentMessageId
      if (!this.question.parentMessageId) {
        const conversation = await clientGetConversation(conversationId)
        const messages = conversation?.messages || []
        this.question.parentMessageId = last(messages)?.messageId || ''
      }
      // 如果没有meta，则生成一个meta
      if (!this.question.meta) {
        this.question.meta = {}
      }
      // 设置attachments
      this.question.meta.attachments = this.question.meta.attachments?.length
        ? this.question.meta.attachments
        : await getAIProviderChatFiles()
      // Question的Meta信息
      const {
        // contextMenu的信息
        contextMenu,
        // AI response的消息Id
        outputMessageId,
        // 上下文
        contexts,
      } = this.question.meta
      // 设置includeHistory
      if (contextMenu?.id) {
        this.question.meta.includeHistory = false
      }
      if (!contexts) {
        this.question.meta.contexts = generateUserMessageContexts(
          engine.shortcutsEngine?.getVariables() || {},
          this.question.text,
        )
      }
      // 设置请求的Prompt
      const MaxAIPromptActionConfig =
        this.parameters.MaxAIPromptActionConfig ||
        this.question?.meta?.MaxAIPromptActionConfig
      // 发消息之前判断是不是MaxAI prompt action, 如果是的话判断是不是third party AI provider
      if (MaxAIPromptActionConfig) {
        // 更新variables和output的值
        MaxAIPromptActionConfig.variables =
          MaxAIPromptActionConfig.variables.map((variable) => {
            variable.defaultValue = lodashGet(
              params,
              variable.VariableName,
              variable.defaultValue || '',
            )
            return variable
          })
        MaxAIPromptActionConfig.output = MaxAIPromptActionConfig.output.map(
          (variable) => {
            variable.defaultValue = lodashGet(
              params,
              variable.VariableName,
              variable.defaultValue || '',
            )
            return variable
          },
        )
        this.question.meta.MaxAIPromptActionConfig = MaxAIPromptActionConfig
        const conversation =
          (await clientConversationEngine?.getCurrentConversation()) || null
        if (conversation) {
          const AIModel = conversation.meta?.AIModel
          const AIProvider = conversation.meta?.AIProvider
          if (!AIProvider || checkISThirdPartyAIProvider(AIProvider)) {
            // 确认是third-party AI provider, 需要获取默认的prompt
            const result = await clientFetchMaxAIAPI<{
              data?: {
                prompt_template: string
              }
              status: string
            }>(`/gpt/render_prompt_action`, {
              prompt_id: MaxAIPromptActionConfig.promptId,
              model_name: AIModel,
            })
            if (
              result.data?.status === 'OK' &&
              result.data.data?.prompt_template
            ) {
              // 更新提问的prompt
              this.question.text = (
                await this.parseTemplate(
                  result.data.data.prompt_template,
                  params,
                )
              ).data
            }
          }
        }
      }
      // 末尾加上的和AI response language有关的信息，比如说写作风格，语气等需要隐藏
      // 用于用户看到的信息
      let messageVisibleText = this.question.text
      // 所以要设置messageVisibleText
      if (isEnableAIResponseLanguage) {
        // this.question += await this.generateAdditionalText(params)
        const { data: additionalText, addPosition } =
          await generatePromptAdditionalText(params)
        if (additionalText) {
          if (
            this.question.text.startsWith(
              'Ignore all previous instructions. ',
            ) &&
            addPosition === 'start'
          ) {
            this.question.text = this.question.text.replace(
              'Ignore all previous instructions. ',
              'Ignore all previous instructions.\n' + additionalText + '\n\n',
            )
          } else {
            if (addPosition === 'start') {
              this.question.text = additionalText + '\n\n' + this.question.text
            } else {
              this.question.text += '\n\n' + additionalText
            }
          }
        }
      }
      // 如果用的是contextMenu，则直接使用contextMenu的名字
      if (contextMenu?.text) {
        if (askChatGPTType === 'ASK_CHAT_GPT_WITH_PREFIX') {
          messageVisibleText =
            getContextMenuNamePrefixWithHost() + contextMenu.text
        } else {
          messageVisibleText = contextMenu.text
        }
      }
      this.question.meta.messageVisibleText = messageVisibleText
      if (
        clientConversationEngine &&
        clientMessageChannelEngine &&
        shortcutsMessageChannelEngine
      ) {
        // 判断是否触达dailyUsageLimited开始:
        const fallbackId = {
          Chat: 'chat',
          Summary: 'summary_chat',
          Search: 'search_chat',
          Art: 'art',
        }[clientConversationEngine.currentSidebarConversationType]
        console.log(
          `contextMenu show Text finally: [${
            contextMenu?.text || fallbackId
          }]-[${contextMenu?.id || fallbackId}]`,
        )
        const { data: isDailyUsageLimit } =
          await clientMessageChannelEngine.postMessage({
            event: 'Client_logCallApiRequest',
            data: {
              name: contextMenu?.text || fallbackId,
              id: contextMenu?.id || fallbackId,
              host: getCurrentDomainHost(),
            },
          })
        if (isDailyUsageLimit) {
          // 触达dailyUsageLimited，向用户展示提示信息
          await clientConversationEngine.pushPricingHookMessage(
            'TOTAL_CHAT_DAILY_LIMIT',
          )
          // 记录日志
          authEmitPricingHooksLog('show', 'TOTAL_CHAT_DAILY_LIMIT')
          // 展示sidebar
          showChatBox()
          this.error = 'TOTAL_CHAT_DAILY_LIMIT'
          return
        }
        // 插入用户消息
        if (
          askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
          askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_QUESTION'
        ) {
          await clientChatConversationModifyChatMessages(
            'add',
            conversationId,
            0,
            [this.question],
          )
        }
        // 开始提问
        // 发消息之前记录总数
        await increaseChatGPTRequestCount('total')
        // 发消息之前记录prompt/chat
        await increaseChatGPTRequestCount('prompt', {
          name: contextMenu?.text || 'chat',
          id: contextMenu?.id || 'chat',
          host: getCurrentDomainHost(),
        })
        // 第三方AI provider的conversationId
        let AIConversationId = ''
        let errorMessage = ''
        try {
          await clientAskAIQuestion(this.question!, {
            onMessage: async (message) => {
              this.log.info('message', message)
              this.answer = {
                messageId: (message.messageId as string) || uuidV4(),
                parentMessageId:
                  (message.parentMessageId as string) || uuidV4(),
                text: (message.text as string) || '',
                type: 'ai' as const,
                originalMessage: message.originalMessage,
              }
              if (message.conversationId) {
                AIConversationId = message.conversationId
              }
              this.output = this.answer.text
              // 如果有AI response的消息Id，则需要把AI response添加到指定的Message
              if (outputMessageId && this.status === 'running') {
                await clientChatConversationModifyChatMessages(
                  'update',
                  conversationId,
                  0,
                  isAIMessage(this.answer)
                    ? [
                        mergeWithObject([
                          message,
                          {
                            messageId: outputMessageId,
                            originalMessage: {
                              content: {
                                text: message.text,
                              },
                            },
                          } as IAIResponseMessage,
                        ]),
                      ]
                    : [message],
                )
              } else if (
                askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
                askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_ANSWER' &&
                this.status === 'running'
              ) {
                // 更新客户端的writing message
                await clientConversationEngine.updateClientWritingMessage(
                  this.answer,
                )
              }
            },
            onError: async (error: any) => {
              this.log.error(`send question error`, error)
              errorMessage =
                error?.message || error || 'Error detected. Please try again.'
              if (typeof errorMessage !== 'string') {
                errorMessage = 'Network error. Please try again.'
              }
              const is403Error =
                typeof error === 'string' && error?.trim() === '403'
              if (is403Error) {
                errorMessage = `Log into ChatGPT web app and pass Cloudflare check. We recommend enabling our new [ChatGPT Stable Mode](key=options&query=#chatgpt-stable-mode) to avoid frequent interruptions and network errors.`
              }
              if (errorMessage === 'manual aborted request.') {
                errorMessage = ''
                // 手动取消的请求不计入错误
                return
              } else {
                if (errorMessage.startsWith('Too many requests in 1 hour')) {
                  errorMessage = `Too many requests in 1 hour. Try again later, or use our new AI provider for free by selecting "MaxAI.me" from the AI Provider options at the top of the sidebar.
                ![switch-provider](https://www.maxai.me/assets/chrome-extension/switch-provider.png)`
                }
              }
            },
          })
          if (this.status !== 'running') {
            return
          }
          if (outputMessageId) {
            await clientChatConversationModifyChatMessages(
              'update',
              conversationId,
              0,
              [
                {
                  messageId: outputMessageId,
                  originalMessage: {
                    metadata: {
                      isComplete: true,
                    },
                  },
                } as IAIResponseMessage,
              ],
            )
          }
          if (
            this.answer &&
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_ANSWER'
          ) {
            // 如果没有AI response的消息Id，需要把stop的消息插入到对话中
            await clientConversationEngine.pushMessage(
              this.answer,
              conversationId,
            )
            // 移除AI writing message
            clientConversationEngine.updateClientWritingMessage(null)
          }

          // 如果是 smart search，并且报错了需要用 messageVisibleText 做 fallback 处理
          if (
            this.question.meta.contextMenu?.text === '[Search] smart query' &&
            errorMessage &&
            !this.answer
          ) {
            this.output = this.question.meta.messageVisibleText || ''
            errorMessage = ''
          }

          if (errorMessage) {
            if (isPermissionCardSceneType(errorMessage)) {
              await clientConversationEngine.pushPricingHookMessage(
                errorMessage,
              )
            } else {
              await clientConversationEngine.pushMessage({
                type: 'system',
                messageId: uuidV4(),
                parentMessageId: this.question?.messageId,
                text: errorMessage,
                meta: {
                  status: 'error',
                },
              } as ISystemChatMessage)
            }
          }

          // 如果第三方AI provider的conversationId
          if (AIConversationId) {
            // 更新第三方AI provider的conversationId
            await clientConversationEngine.updateConversation(
              {
                meta: {
                  AIConversationId,
                },
              },
              conversationId,
              false,
            )
          }
        } catch (e) {
          this.log.error(`send question error`, e)
          this.error = `Something went wrong. Please try again.`
        }
      }
      this.log.info('question', this.question)
    } catch (e) {
      this.error = chatGPTCommonErrorInterceptor((e as any).toString())
    }
  }
  async stop() {
    const port = new ContentScriptConnectionV2({
      runtime: 'client',
    })
    await port.postMessage({
      event: 'Client_abortAskChatGPTQuestion',
      data: {
        messageId: this.question?.messageId,
      },
    })
    if (this.question?.conversationId && this.question.meta?.outputMessageId) {
      // 因为整个过程不一定是成功的
      // 更新消息的isComplete/sources.status
      await clientChatConversationModifyChatMessages(
        'update',
        this.question?.conversationId,
        0,
        [
          {
            type: 'ai',
            messageId: this.question.meta.outputMessageId,
            originalMessage: {
              metadata: {
                sources: {
                  status: 'complete',
                },
                isComplete: true,
              },
            },
          } as any,
        ],
      )
    } else if (this.question?.conversationId) {
      const messages = (
        await clientGetConversation(this.question?.conversationId)
      )?.messages
      if (messages) {
        const lastMessage = messages[messages.length - 1]
        if (isAIMessage(lastMessage)) {
          if (lastMessage.originalMessage) {
            await clientChatConversationModifyChatMessages(
              'update',
              this.question?.conversationId,
              0,
              [
                {
                  type: 'ai',
                  messageId: lastMessage.messageId,
                  originalMessage: {
                    metadata: {
                      sources: {
                        status: 'complete',
                      },
                      isComplete: true,
                    },
                  },
                } as any,
              ],
            )
          }
        }
      }
    }
    return true
  }
  reset() {
    console.log('reset')
    super.reset()
    this.question = undefined
    this.answer = undefined
    console.log(this.question)
    console.log(this.answer)
  }
}
