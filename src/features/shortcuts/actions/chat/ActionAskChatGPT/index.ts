import lodashGet from 'lodash-es/get'
import last from 'lodash-es/last'
import { v4 as uuidV4 } from 'uuid'

import {
  OUTPUT_CHAT_COMPLETE,
  VARIABLE_AI_RESPONSE_LANGUAGE,
  VARIABLE_AI_RESPONSE_TONE,
  VARIABLE_AI_RESPONSE_WRITING_STYLE,
} from '@/background/defaultPromptsData/systemVariables'
import {
  checkIsThirdPartyAIProvider,
  clientAskAIQuestion,
} from '@/background/src/chat/util'
import { CHAT__AI_MODEL__SUGGESTION__PROMPT_ID } from '@/constants'
import {
  authEmitPricingHooksLog,
  generateQuestionAnalyticsData,
} from '@/features/auth/utils/log'
import { isPermissionCardSceneType } from '@/features/auth/utils/permissionHelper'
import { getAIProviderChatFiles } from '@/features/chatgpt'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { increaseChatGPTRequestCount } from '@/features/chatgpt/utils/chatRequestRecorder'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessage,
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

  @parametersParserDecorator(['outputTemplate'])
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
      let isEnableAIResponseLanguage =
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
      let MaxAIPromptActionConfig =
        this.parameters.MaxAIPromptActionConfig ||
        this.question?.meta?.MaxAIPromptActionConfig
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
      // question设置完之后，再来设置MaxAIPromptActionConfig
      /**
       * 用户点击的推荐的AI model
       */
      const MaxAISuggestionAIModel = params.MAXAI_SUGGESTION_AI_MODEL
      if (MaxAISuggestionAIModel) {
        // 如果用户直接打字聊天，isEnableAIResponseLanguage是false
        // 如果用户用prompt，isEnableAIResponseLanguage有可能是false, 例如English/Chinese/Spanish等
        // 此时点击了suggest AI model，并且没有用prompt, 需要设置成true，需要检测/使用用户设置的AI response language
        if (!contextMenu?.id) {
          isEnableAIResponseLanguage = true
        }
        // 正常的聊天，但是用户点了suggest AI model
        if (!MaxAIPromptActionConfig) {
          // 设置成Freestyle的MaxAI prompt action
          MaxAIPromptActionConfig = {
            promptId: CHAT__AI_MODEL__SUGGESTION__PROMPT_ID,
            promptName: 'GetLLMResponse',
            promptActionType: 'chat_complete',
            variables: [
              {
                VariableName: 'CURRENT_PROMPT',
                label: 'the input prompt for the LLM',
                valueType: 'Text',
                placeholder: 'the input prompt for the LLM',
                defaultValue: '',
                systemVariable: true,
                hidden: true,
              },
              VARIABLE_AI_RESPONSE_LANGUAGE,
              VARIABLE_AI_RESPONSE_WRITING_STYLE,
              VARIABLE_AI_RESPONSE_TONE,
            ],
            output: [OUTPUT_CHAT_COMPLETE],
            AIModel: MaxAISuggestionAIModel,
          }
        } else {
          // 如果是MaxAI prompt action，需要设置AIModel
          MaxAIPromptActionConfig.AIModel = MaxAISuggestionAIModel
        }
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
            const originDefaultValue = variable.defaultValue
            variable.defaultValue = lodashGet(
              params,
              variable.VariableName,
              variable.defaultValue || '',
            )
            // 如果VariableName在params里面没有找到对应的值，但是有默认值，需要把默认值设置到variable上
            // 例如: defaultValue: '123', 此时variable.defaultValue会被lodashGet设置为''
            // 所以需要把默认值设置到variable上
            if (originDefaultValue && !variable.defaultValue) {
              variable.defaultValue = originDefaultValue
            }
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
            const originDefaultValue = variable.defaultValue
            variable.defaultValue = lodashGet(
              params,
              variable.VariableName,
              variable.defaultValue || '',
            )
            // 如果VariableName在params里面没有找到对应的值，但是有默认值，需要把默认值设置到variable上
            // 例如: defaultValue: '123', 此时variable.defaultValue会被lodashGet设置为''
            // 所以需要把默认值设置到variable上
            if (originDefaultValue && !variable.defaultValue) {
              variable.defaultValue = originDefaultValue
            }
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
          // 如果显示的文本本身是空的，附加上文本的话，就会导致显示的是错误的additionalText,
          // 所以要用空格代替
          if (messageVisibleText === '') {
            messageVisibleText = ' '
          }
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
          // 如果没开启自定义AI response language，那么就不需要检测语言或者使用用户设置的语言
          // 例如用了English\Spanish\Chinese等prompt，需要把AI_RESPONSE_LANGUAGE设置为空
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
          const outputTemplate = this.parameters.outputTemplate || ''
          await clientAskAIQuestion(this.question!, {
            onMessage: async (AIResponseMessage) => {
              this.log.info('message', AIResponseMessage)
              const AIResponseMessageText =
                AIResponseMessage.originalMessage?.content?.text ||
                AIResponseMessage.text ||
                ''
              // 渲染最终的AI response的消息和Action的结果
              const outputMessageText = outputTemplate
                ? (
                    await this.parseTemplate(outputTemplate, {
                      ...params,
                      ACTION_OUTPUT: AIResponseMessageText,
                    })
                  ).data
                : AIResponseMessageText
              // 从2024-06-14起，AI response的消息会在originalMessage里
              this.answer = {
                messageId: (AIResponseMessage.messageId as string) || uuidV4(),
                parentMessageId:
                  (AIResponseMessage.parentMessageId as string) || uuidV4(),
                text: '',
                type: 'ai' as const,
                originalMessage: mergeWithObject([
                  // 大部分情况下没有，只有指定了outputMessageId并且outputMessage是type: ai才有
                  outputMessage?.originalMessage || {},
                  // 大部分情况下也没有，只有返回了sources citation/related questions等额外需要展示的信息才有
                  AIResponseMessage.originalMessage || {},
                  // 如果有推荐的AI model，需要把AI model传给后端
                  MaxAISuggestionAIModel
                    ? {
                        metadata: {
                          AIModel: MaxAISuggestionAIModel,
                        },
                      }
                    : {},
                  {
                    content: {
                      text: outputMessageText,
                      contentType: 'text',
                    },
                  },
                ]),
              }
              // AI response里可能会返回docId，后续如需增加更改conversationMeta的字段会放进此对象里
              if (AIResponseMessage.conversationMeta) {
                await ClientConversationManager.addOrUpdateConversation(
                  conversationId,
                  { meta: AIResponseMessage.conversationMeta },
                  {
                    syncConversationToDB: false,
                  },
                )
              }
              if (this.answer.conversationId) {
                AIConversationId = this.answer.conversationId
              }
              if (this.answer.originalMessage) {
                //  如果只有sourceCitations,deepDive，也当作liteMode显示
                // TODO 后续会去掉liteMode，渲染的时候以有无对应属性去显示组件
                const liteModeKeys: Array<
                  keyof Required<IAIResponseOriginalMessage>['metadata']
                > = ['deepDive', 'sourceCitations', 'AIModel']
                // 有效的metadata数量
                const validMetadataCount = Object.keys(
                  this.answer.originalMessage.metadata || {},
                ).filter(
                  (metaDataKey: any) => !liteModeKeys.includes(metaDataKey),
                ).length
                this.answer.originalMessage.liteMode = validMetadataCount === 0
              }
              this.output = outputMessageText
              // 如果有指定的output的消息Id，则需要把AI response添加到指定的Message
              if (outputMessage && this.status === 'running') {
                // 如果是AI message，则更新originalMessage.content.text
                if (isAIMessage(outputMessage)) {
                  await ClientConversationMessageManager.updateMessage(
                    conversationId,
                    {
                      messageId: outputMessageId,
                      originalMessage: this.answer.originalMessage,
                    },
                    {
                      syncMessageToDB: false,
                    },
                  )
                } else {
                  await ClientConversationMessageManager.updateMessage(
                    conversationId,
                    {
                      messageId: outputMessageId,
                      text: outputMessageText,
                    },
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
                console.log(`test222:`, this.answer)
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
          // 结束的时候需要更改isComplete为true
          if (this.answer?.originalMessage) {
            this.answer = {
              ...this.answer,
              originalMessage: {
                ...this.answer.originalMessage,
                metadata: {
                  ...this.answer.originalMessage.metadata,
                  isComplete: true,
                },
              },
            }
          }
          if (this.status !== 'running') {
            return
          }
          if (
            outputMessage &&
            isAIMessage(outputMessage) &&
            this.answer?.originalMessage
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
        needStopAIMessage =
          await ClientConversationMessageManager.getMessageByTimeFrame(
            this.question.conversationId,
            'latest',
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
