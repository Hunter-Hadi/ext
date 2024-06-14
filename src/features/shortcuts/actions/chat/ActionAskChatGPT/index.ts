import lodashGet from 'lodash-es/get'
import last from 'lodash-es/last'
import { v4 as uuidV4 } from 'uuid'

import {
  checkIsThirdPartyAIProvider,
  clientAskAIQuestion,
} from '@/background/src/chat/util'
import {
  authEmitPricingHooksLog,
  generateQuestionAnalyticsData,
} from '@/features/auth/utils/log'
import { isPermissionCardSceneType } from '@/features/auth/utils/permissionHelper'
import { getAIProviderChatFiles } from '@/features/chatgpt'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { increaseChatGPTRequestCount } from '@/features/chatgpt/utils/chatRequestRecorder'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
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
  // clientFetchAPI,
  clientFetchMaxAIAPI,
} from '@/features/shortcuts/utils'
import getContextMenuNamePrefixWithHost from '@/features/shortcuts/utils/getContextMenuNamePrefixWithHost'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
// import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
// import defaultEditAssistantComposeReplyContextMenuJson from '@/background/defaultPromptsData/defaultEditAssistantComposeReplyContextMenuJson'
// import defaultInputAssistantComposeNewContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantComposeNewContextMenuJson'
// import defaultInputAssistantRefineDraftContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantRefineDraftContextMenuJson'
// import { IContextMenuItem } from '@/features/contextMenu/types'
//
// const tempMergeJson: IContextMenuItem[] = []
//   .concat(defaultContextMenuJson)
//   .concat(defaultEditAssistantComposeReplyContextMenuJson)
//   .concat(defaultInputAssistantComposeNewContextMenuJson)
//   .concat(defaultInputAssistantRefineDraftContextMenuJson)

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
        clientConversationEngine?.currentConversationId ||
        ''
      const text = String(
        this.parameters.AskChatGPTActionQuestion?.text ||
          this.parameters.compliedTemplate ||
          params.LAST_ACTION_OUTPUT ||
          '',
      )
      const messageId =
        this.parameters.AskChatGPTActionQuestion?.messageId || uuidV4()
      // 设置请求的Prompt action
      const MaxAIPromptActionConfig =
        this.parameters.MaxAIPromptActionConfig ||
        this.question?.meta?.MaxAIPromptActionConfig
      if (params.MAXAI_SUGGESTION_AI_MODEL) {
        // 正常的聊天，但是用户点了suggest AI model
        if (!MaxAIPromptActionConfig) {
          debugger
        } else {
          // 如果是MaxAI prompt action，需要设置AIModel
          MaxAIPromptActionConfig.AIModel = params.MAXAI_SUGGESTION_AI_MODEL
        }
      }
      this.question = {
        type: 'user',
        ...this.parameters.AskChatGPTActionQuestion,
        conversationId,
        messageId,
        text,
      }
      /**
       * 因为会被parametersParserDecorator处理，所以这里要把attachmentExtractedContents的值转换成string
       */
      if (this.question.extendContent?.attachmentExtractedContents) {
        Object.keys(
          this.question.extendContent.attachmentExtractedContents,
        ).forEach((key) => {
          if (
            typeof this.question!.extendContent!.attachmentExtractedContents![
              key
            ] !== 'string'
          ) {
            this.question!.extendContent!.attachmentExtractedContents![key] =
              JSON.stringify(
                this.question!.extendContent!.attachmentExtractedContents![key],
              )
          }
        })
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
        const messageIds = await ClientConversationMessageManager.getMessageIds(
          conversationId,
        )
        this.question.parentMessageId = last(messageIds) || ''
      }
      // 如果没有meta，则生成一个meta
      if (!this.question.meta) {
        this.question.meta = {}
      }
      // 设置attachments
      this.question.meta.attachments = this.question.meta.attachments?.length
        ? this.question.meta.attachments
        : await getAIProviderChatFiles(this.question.conversationId)
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
      if (contextMenu?.id && this.question.meta.includeHistory === undefined) {
        this.question.meta.includeHistory = false
      }
      if (!contexts) {
        let questionPrompt = this.question.text
        if (
          MaxAIPromptActionConfig &&
          MaxAIPromptActionConfig.variables.length > 0
        ) {
          questionPrompt = MaxAIPromptActionConfig.variables
            .map((variable) => `{{${variable.VariableName}}}`)
            .join('\n')
          questionPrompt =
            ((await this.parseTemplate(questionPrompt, params))
              .data as string) || this.question.text
        }
        this.question.meta.contexts = generateUserMessageContexts(
          engine.shortcutsEngine?.getVariables() || {},
          questionPrompt,
        )
      }
      const conversation =
        (await clientConversationEngine?.getCurrentConversation()) || null
      const AIModel = conversation?.meta?.AIModel
      const AIProvider = conversation?.meta?.AIProvider
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
            // 如果是AI response language相关的变量，需要把默认值设置为空
            if (
              variable.VariableName === 'AI_RESPONSE_WRITING_STYLE' ||
              variable.VariableName === 'AI_RESPONSE_TONE'
            ) {
              if (variable.defaultValue === 'Default') {
                variable.defaultValue = ''
              }
            }
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
        if (conversation) {
          if (!AIProvider || checkIsThirdPartyAIProvider(AIProvider)) {
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
              // NOTE: 本地测试用，不要提交
              // let parent3: IContextMenuItem | undefined = tempMergeJson.find(
              //   (item) => item.id === MaxAIPromptActionConfig.promptId,
              // )
              // let parent2: IContextMenuItem | undefined = parent3
              //   ? tempMergeJson.find((item) => item.id === parent3?.parent)
              //   : undefined
              // let parent1: IContextMenuItem | undefined = parent2
              //   ? tempMergeJson.find((item) => item.id === parent2?.parent)
              //   : undefined
              // clientFetchAPI('http://localhost:3030/log', {
              //   method: 'POST',
              //   headers: {
              //     'Content-Type': 'application/json',
              //   },
              //   body: JSON.stringify({
              //     parent1: parent1?.text || '',
              //     parent2: parent2?.text || '',
              //     parent3: parent3?.text || '',
              //     promptId: MaxAIPromptActionConfig.promptId,
              //     promptName: MaxAIPromptActionConfig.promptName,
              //     promptActionType: MaxAIPromptActionConfig.promptActionType,
              //     variables: MaxAIPromptActionConfig.variables,
              //     output: MaxAIPromptActionConfig.output,
              //     prompt: this.question.text,
              //   }),
              // })
              //   .then()
              //   .catch()
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
        const {
          data: additionalText,
          addPosition,
          AIOutputLanguage,
        } = await generatePromptAdditionalText(params)
        // 如果用户设置了Auto，前端之前会检测Context的语言，让AI以这个语言输出
        // 现在要把检测到的语言给到MaxAIPromptActionConfig，也就是给到后端
        if (AIOutputLanguage && MaxAIPromptActionConfig) {
          MaxAIPromptActionConfig.variables.forEach((variable) => {
            if (variable.VariableName === 'AI_RESPONSE_LANGUAGE') {
              variable.defaultValue = AIOutputLanguage
            }
          })
        }
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
      } else {
        if (MaxAIPromptActionConfig) {
          // 如果开启了自定义AI response language，那么就不需要检测语言或者使用用户设置的语言
          MaxAIPromptActionConfig.variables.forEach((variable) => {
            if (variable.VariableName === 'AI_RESPONSE_LANGUAGE') {
              variable.defaultValue = ''
            }
          })
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
      this.question.meta.analytics = await generateQuestionAnalyticsData(
        this.question,
        contextMenu?.id,
      )
      if (
        clientConversationEngine &&
        clientMessageChannelEngine &&
        shortcutsMessageChannelEngine
      ) {
        // 1. 记录 call api
        const fallbackId = {
          Chat: 'chat',
          Summary: 'summary_chat',
          Search: 'search_chat',
          Art: 'art',
          FAQ: 'faq',
          Memo: 'memo',
          ContextMenu: 'context_menu',
        }[clientConversationEngine.currentSidebarConversationType]
        console.log(
          `contextMenu show Text finally: [${
            contextMenu?.text || fallbackId
          }]-[${contextMenu?.id || fallbackId}]`,
        )
        /**
         * 前端不再依赖call_api来触发paywall付费卡点了
         * call_api主要是用来做log记录的，让我们自己能看到、分析用户的使用情况
         */
        clientMessageChannelEngine
          .postMessage({
            event: 'Client_logCallApiRequest',
            data: {
              name: contextMenu?.text || fallbackId,
              id: contextMenu?.id || fallbackId,
              type: this.question.meta.analytics.promptType,
              featureName: this.question.meta.analytics.featureName,
              host: getCurrentDomainHost(),
              conversationId: clientConversationEngine.currentConversationId,
              url: location.href,
            },
          })
          .then()
          .catch()

        // 2. 判断是否是第三方AI provider， 是的话需要判断是否已经达到每日使用上限
        if (AIProvider && checkIsThirdPartyAIProvider(AIProvider)) {
          // 如果是第三方AI provider，需要判断是否已经达到每日使用上限
          const { data: logThirdPartyResult } =
            await clientMessageChannelEngine.postMessage({
              event: 'Client_logThirdPartyDailyUsage',
              data: {},
            })

          if (logThirdPartyResult.hasReachedLimit) {
            // 到达第三方provider的每日使用上限
            // 触达 用量上限向用户展示提示信息
            await clientConversationEngine.pushPricingHookMessage(
              'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
            )
            // 记录日志
            // 第三方 webapp 模型，用 MAXAI_FAST_TEXT_MODEL 记录
            authEmitPricingHooksLog(
              'show',
              'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
              {
                conversationId,
                AIProvider,
                AIModel,
                paywallType: 'RESPONSE',
              },
            )
            // 展示sidebar
            // showChatBox()
            // 触发用量上限时 更新 user subscription info
            await clientMessageChannelEngine.postMessage({
              event: 'Client_updateUserSubscriptionInfo',
              data: {},
            })

            this.error = 'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT'
            return
          }
        }

        // 3. 插入用户消息
        if (
          askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
          askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_QUESTION'
        ) {
          await ClientConversationMessageManager.addMessages(conversationId, [
            this.question,
          ])
        }
        // 4. 开始提问
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
        // 需要更新的AI response的消息
        let outputMessage: IChatMessage | null = null
        if (outputMessageId) {
          outputMessage =
            await ClientConversationMessageManager.getMessageByMessageId(
              outputMessageId,
            )
        }
        try {
          debugger
          await clientAskAIQuestion(this.question!, {
            onMessage: async (message) => {
              this.log.info('message', message)
              // 从2024-06-14起，AI response的消息会在originalMessage里
              this.answer = {
                messageId: (message.messageId as string) || uuidV4(),
                parentMessageId:
                  (message.parentMessageId as string) || uuidV4(),
                text: '',
                type: 'ai' as const,
                originalMessage: mergeWithObject([
                  {
                    liteMode: message.originalMessage?.liteMode !== true,
                    content: {
                      text: message.text,
                      contentType: 'text',
                    },
                  },
                  message.originalMessage || {},
                ]),
              }
              if (message.conversationId) {
                AIConversationId = message.conversationId
              }
              if (message.sourceCitations?.length) {
                this.answer.originalMessage = {
                  ...this.answer.originalMessage,
                  // 这个字段代表本条消息不是rich message
                  // 目前sourceCitations只会在chat的时候输出
                  // 如果后续要在outputMessage里添加sourceCitations要额外处理
                  liteMode: true,
                  metadata: {
                    ...this.answer.originalMessage?.metadata,
                    sourceCitations: message.sourceCitations,
                  },
                }
              }
              this.output =
                this.answer.originalMessage?.content?.text || this.answer.text
              // 如果有AI response的消息Id，则需要把AI response添加到指定的Message
              if (outputMessage && this.status === 'running') {
                // 如果是AI response的消息，并且有originalMessage，则更新originalMessage.content.text
                if (
                  isAIMessage(outputMessage) &&
                  outputMessage.originalMessage
                ) {
                  await ClientConversationMessageManager.updateMessagesWithChanges(
                    conversationId,
                    [
                      {
                        key: outputMessageId || '',
                        changes: {
                          'originalMessage.content.text': message.text,
                          'originalMessage.metadata.sourceCitations':
                            message.sourceCitations,
                        } as any,
                      },
                    ],
                    {
                      syncMessageToDB: false,
                    },
                  )
                } else {
                  // TODO 这里只有更新，其实要区别更新/覆盖
                  await ClientConversationMessageManager.updateMessagesWithChanges(
                    conversationId,
                    [
                      {
                        key: outputMessageId || '',
                        changes: {
                          text: outputMessage.text + '\n\n' + message.text,
                        },
                      },
                    ],
                    {
                      syncMessageToDB: false,
                    },
                  )
                }
              } else if (
                askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
                askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_ANSWER' &&
                this.status === 'running'
              ) {
                // 更新客户端的writing message
                clientConversationEngine.updateClientWritingMessage(this.answer)
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
                  errorMessage = `Too many requests. Try again later, or use premium AI models managed by MaxAI instead to ensure reliable and high-quality AI performance and user experience.
                ![switch-provider](${getChromeExtensionAssetsURL(
                  '/images/on-boarding/switch-AI-model.gif',
                )})`
                }
              }
            },
          })
          if (this.status !== 'running') {
            return
          }
          if (
            outputMessage &&
            isAIMessage(outputMessage) &&
            outputMessage.originalMessage
          ) {
            await ClientConversationMessageManager.updateMessagesWithChanges(
              conversationId,
              [
                {
                  key: outputMessageId || '',
                  changes: {
                    'originalMessage.metadata.isComplete': true,
                  } as any,
                },
              ],
            )
          }
          if (
            this.answer &&
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN' &&
            askChatGPTType !== 'ASK_CHAT_GPT_HIDDEN_ANSWER'
          ) {
            if (outputMessageId) {
              // 如果有outputMessageId,到这里就结束了
              return
            }
            // 如果没有AI response的消息Id，需要把stop的消息插入到对话中
            await clientConversationEngine.pushMessage(
              this.answer,
              conversationId,
            )
            // 移除AI writing message
            // TODO 这里临时解决，因为上方的pushMessage是异步添加到分页的message里的，这里过早改为null会有闪烁问题
            setTimeout(() => {
              clientConversationEngine.updateClientWritingMessage(
                (prevMessage) => {
                  if (prevMessage?.messageId === this.answer?.messageId) {
                    return null
                  }
                  return prevMessage
                },
              )
            }, 200)
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
            // 如果报错信息是 PermissionCardSceneType，说明触发了付费卡点
            if (isPermissionCardSceneType(errorMessage)) {
              const sceneType = errorMessage
              // 触达 用量上限向用户展示提示信息
              await clientConversationEngine.pushPricingHookMessage(sceneType)

              // 记录日志
              authEmitPricingHooksLog('show', sceneType, {
                conversationId,
                inContextMenu:
                  clientConversationEngine.clientConversation?.type ===
                  'ContextMenu',
                paywallType: 'RESPONSE',
              })
              // 展示sidebar
              // showChatBox()
              // 触发用量上限时 更新 user subscription info
              await clientMessageChannelEngine.postMessage({
                event: 'Client_updateUserSubscriptionInfo',
                data: {},
              })
              this.error = sceneType
              return
            } else {
              await ClientConversationMessageManager.addMessages(
                conversationId,
                [
                  {
                    type: 'system',
                    messageId: uuidV4(),
                    parentMessageId: this.question?.messageId,
                    text: errorMessage,
                    meta: {
                      status: 'error',
                    },
                  } as ISystemChatMessage,
                ],
              )
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

  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    if (
      params.engine.clientMessageChannelEngine &&
      this.question?.conversationId
    ) {
      await Promise.race([
        await params.engine.clientMessageChannelEngine.postMessage({
          event: 'Client_abortAskChatGPTQuestion',
          data: {
            conversationId: this.question?.conversationId,
            messageId: this.question?.messageId,
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 3 * 1000)),
      ])
    }
    if (this.question?.conversationId) {
      const messageIds = await ClientConversationMessageManager.getMessageIds(
        this.question.conversationId,
      )
      const lastMessageId = last(messageIds)
      if (lastMessageId) {
        let needStopAIMessage: IChatMessage | null = null
        // 如果有outputMessageId，则找到outputMessage
        if (this.question.meta?.outputMessageId) {
          needStopAIMessage =
            await ClientConversationMessageManager.getMessageByMessageId(
              this.question!.meta!.outputMessageId,
            )
        }
        // 如果 outputMessageId 没有找到，则找到最后一条AI消息
        if (!needStopAIMessage) {
          await ClientConversationMessageManager.getMessageByMessageId(
            lastMessageId,
          )
        }
        // 如果是originalMessage更新消息的isComplete/sources.status
        if (
          needStopAIMessage &&
          isAIMessage(needStopAIMessage) &&
          needStopAIMessage.originalMessage
        ) {
          // 更新消息的isComplete/sources.status
          await ClientConversationMessageManager.updateMessagesWithChanges(
            this.question.conversationId,
            [
              {
                key: needStopAIMessage.messageId,
                changes: {
                  'originalMessage.metadata.isComplete': true,
                } as any,
              },
            ],
          )
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
