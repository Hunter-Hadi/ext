import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidV4 } from 'uuid'

import { IChatConversation } from '@/background/src/chatConversations'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import {
  IAIProviderModel,
  IChatUploadFile,
  IUserChatMessage,
} from '@/features/chatgpt/types'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { useShortCutsEngine } from '@/features/shortcuts/hooks/useShortCutsEngine'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import {
  calculateMaxHistoryQuestionResponseTokens,
  getTextTokens,
} from '@/features/shortcuts/utils/tokenizer'
import { getInputMediator } from '@/store/InputMediator'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { isMaxAIPDFPage } from '@/utils/dataHelper/websiteHelper'
export interface IAskAIQuestion
  extends Omit<IUserChatMessage, 'messageId' | 'conversationId'> {
  conversationId?: string
  messageId?: string
}

const useClientChat = () => {
  const { t } = useTranslation(['client'])
  const { currentUserPlan } = useUserInfo()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const {
    shortCutsEngineRef,
    setShortCuts,
    runShortCuts,
    stopShortCuts,
    getParams,
  } = useShortCutsEngine()
  const { aiProviderRemoveAllFiles } = useAIProviderUpload()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const runShortCutsRef = useRef(runShortCuts)
  const {
    currentConversationIdRef,
    createConversation,
    pushPricingHookMessage,
    hideConversationLoading,
    showConversationLoading,
    updateConversation,
    getCurrentConversation,
    getConversation,
  } = useClientConversation()
  useEffect(() => {
    runShortCutsRef.current = runShortCuts
  }, [runShortCuts])
  const askAIQuestion = async (question: IAskAIQuestion) => {
    // 1.在所有对话之前，确保先有conversationId
    let conversationId = currentConversationIdRef.current
    if (conversationId && (await getConversation(conversationId))?.id) {
      // 如果有conversationId && 如果conversationId存在
    } else {
      conversationId = await createConversation()
    }
    if (!question.meta?.attachments) {
      // 获取attachments
      const port = new ContentScriptConnectionV2({
        runtime: 'client',
      })
      const attachments: IChatUploadFile[] =
        (
          await port.postMessage({
            event: 'Client_chatGetFiles',
            data: {},
          })
        )?.data || []
      if (attachments.length > 0) {
        // 如果有文件类型的附件，需要计算文件内容tokens的长度
        const extractText = attachments
          .map((attachment) => attachment?.extractedContent || '')
          .join('')
        if (extractText) {
          // 因为我们没有对attachment的extractedContent进行限制，所以这里需要计算tokens的长度
          const conversationMaxTokens =
            (await getCurrentConversation())?.meta.maxTokens || 4096
          const maxAttachmentTokens =
            conversationMaxTokens -
            calculateMaxHistoryQuestionResponseTokens(conversationMaxTokens)
          if (getTextTokens(extractText).length > maxAttachmentTokens) {
            // 如果tokens长度超过限制
            await clientChatConversationModifyChatMessages(
              'add',
              conversationId,
              0,
              [
                {
                  type: 'system',
                  text: t(
                    `client:provider__chatgpt__upload_file_error__too_long__text`,
                  ),
                  messageId: uuidV4(),
                  conversationId,
                  meta: {
                    status: 'error',
                  },
                },
              ],
            )
            await aiProviderRemoveAllFiles()
            getInputMediator('chatBoxInputMediator').updateInputValue('')
            getInputMediator('floatingMenuInputMediator').updateInputValue('')
            return
          }
        }
      } else if (question.text.trim() === '') {
        // 如果没有文本 && 没有附件
        return
      }
      question = mergeWithObject([
        question,
        {
          meta: {
            attachments,
          },
        },
      ])
    }
    // 如果有附件, 设置includeHistory=false
    if (question?.meta?.attachments?.length) {
      question.meta.includeHistory = false
    }
    await askAIWIthShortcuts([
      {
        type: 'ASK_CHATGPT',
        parameters: {
          AskChatGPTActionQuestion: question as IUserChatMessage,
          isEnabledDetectAIResponseLanguage: false,
        },
      },
    ])
  }
  /**
   * 问AI问题
   * @param actions
   * @param options
   */
  const askAIWIthShortcuts = async (
    actions: ISetActionsType,
    options?: {
      // 本次运行的shortcuts的参数
      overwriteParameters?: IShortCutsParameter[]
      // 是否需要保存最后一次运行的shortcuts
      isSaveLastRunShortcuts?: boolean
      // 是否需要打开ChatBox
      isOpenSidebarChatBox?: boolean
    },
  ) => {
    const {
      overwriteParameters = [],
      isSaveLastRunShortcuts = true,
      isOpenSidebarChatBox = false,
    } = options || {}
    // 1.在所有对话之前，确保先有conversationId
    let conversationId = currentConversationIdRef.current
    if (conversationId && (await getConversation(conversationId))?.id) {
      // 如果有conversationId && 如果conversationId存在
    } else {
      conversationId = await createConversation()
    }
    // 2.付费卡点判断
    // PDF付费卡点
    if (
      isMaxAIPDFPage() &&
      currentUserPlan.name === 'free' &&
      !currentUserPlan.isNewUser
    ) {
      // 如果是PDF页面 &&
      // 如果是免费用户 &&
      // 如果不是新用户 &&
      // 如果有contextMenu
      // 则提示用户付费
      await pushPricingHookMessage('PDF_AI_VIEWER')
      return
    }
    // 3. Model - 付费卡点
    const currentConversation = await getCurrentConversation()
    // 如果 执行的 actions 中有 ASK_CHATGPT 的话，就判断是否有 付费卡点
    const hasAskChatGPT = actions.find(
      (action) => action.type === 'ASK_CHATGPT',
    )
    if (
      hasAskChatGPT &&
      currentConversation?.meta.AIProvider &&
      currentConversation?.meta.AIModel
    ) {
      const currentModelDetail: IAIProviderModel | undefined =
        AI_PROVIDER_MODEL_MAP[currentConversation.meta.AIProvider]?.find(
          (AIModel) => AIModel.value === currentConversation.meta.AIModel,
        )
      if (currentModelDetail?.permission) {
        if (
          !currentModelDetail.permission.roles.includes(currentUserPlan.name)
        ) {
          // 如果当前AIModel有权限限制
          // 则提示用户付费
          await pushPricingHookMessage(currentModelDetail.permission.sceneType)
          return
        }
      }
    }

    // 判断是否有不保存最后运行的Shortcuts的Action存在
    const isNeedSaveLastRunShortcuts = actions.find((action) => {
      const notSaveActionType: ActionIdentifier[] = ['SET_VARIABLES_MODAL']
      return notSaveActionType.includes(action.type)
    })
    if (isSaveLastRunShortcuts && !isNeedSaveLastRunShortcuts) {
      // 4. 保存最后一次运行的shortcuts
      await saveLastRunShortcuts(conversationId, actions, overwriteParameters)
    }
    // 5. 运行shortcuts
    setShortCuts(actions)
    await runShortCutsRef.current(isOpenSidebarChatBox, overwriteParameters)
  }
  /**
   * 重新生成最后一次运行的shortcuts
   */
  const regenerate = async () => {
    try {
      showConversationLoading()
      const currentConversationId = currentConversationIdRef.current
      if (currentConversationId) {
        const {
          conversation,
          lastRunActionsMessageId,
          lastRunActionsParams,
          lastRunActions,
        } = await getLastRunShortcuts(currentConversationId)
        let needDeleteCount = 0
        if (conversation && lastRunActions.length > 0) {
          // 删除消息
          // 1. 找到最后一次运行的shortcuts的messageId
          const messages = conversation?.messages || []
          if (lastRunActionsMessageId) {
            for (let i = messages.length - 1; i >= 0; i--) {
              if (messages[i].messageId === lastRunActionsMessageId) {
                break
              }
              needDeleteCount++
            }
          }
          // 2. 删除消息
          await clientChatConversationModifyChatMessages(
            'delete',
            currentConversationId,
            // 因为第一条消息才会没有lastRunActionsMessageId, 此时需要删除全部
            lastRunActionsMessageId === '' ? messages.length : needDeleteCount,
            [],
          )
          const waitRunActions = lastRunActions.map((action) => {
            if (
              action.type === 'ASK_CHATGPT' &&
              action.parameters?.AskChatGPTActionQuestion?.meta
            ) {
              action.parameters.AskChatGPTActionQuestion.meta.regenerate = true
            }
            return action
          })
          await askAIWIthShortcuts(waitRunActions, {
            overwriteParameters: lastRunActionsParams,
            isSaveLastRunShortcuts: false,
            isOpenSidebarChatBox: false,
          })
        } else {
          // 理论上不会进来, 兼容旧代码用的
          console.log('regenerate actions is empty')
          const currentConversation = await clientGetConversation(
            currentConversationId,
          )
          const messages = currentConversation?.messages || []
          // 寻找最后一个user message
          let needDeleteCount = 0
          let lastUserMessage: IUserChatMessage | null = null
          for (let i = messages.length - 1; i >= 0; i--) {
            needDeleteCount++
            if (messages[i].type === 'user') {
              lastUserMessage = messages[i] as IUserChatMessage
              break
            }
          }
          if (lastUserMessage) {
            await clientChatConversationModifyChatMessages(
              'delete',
              currentConversationId,
              needDeleteCount,
              [],
            )
            await askAIWIthShortcuts([
              {
                type: 'ASK_CHATGPT',
                parameters: {
                  AskChatGPTActionQuestion: {
                    ...lastUserMessage,
                    meta: {
                      ...lastUserMessage.meta,
                      regenerate: true,
                    },
                  },
                },
              },
            ])
          }
        }
      }
    } catch (e) {
      console.log('regenerate error: \t', e)
    } finally {
      hideConversationLoading()
    }
  }

  const stopGenerate = async () => {
    await stopShortCuts()
  }
  const continueChat = async (conversationId: string = '') => {
    await askAIQuestion({
      type: 'user',
      text: 'Continue',
      conversationId,
      meta: {
        includeHistory: true,
      },
    })
  }

  /**
   * 保存最后一次运行的shortcuts
   * @param conversationId
   * @param actions
   * @param params
   */
  const saveLastRunShortcuts = async (
    conversationId: string,
    actions: ISetActionsType,
    params?: any[],
  ) => {
    const conversation = await clientGetConversation(conversationId)
    const messages = conversation?.messages || []
    const lastRunActionsMessageId =
      messages.length > 0 ? messages[messages.length - 1].messageId : ''
    await updateConversation(
      {
        meta: {
          lastRunActions: actions,
          lastRunActionsParams: params || getParams().shortCutsParameters,
          lastRunActionsMessageId,
        },
      },
      conversationId,
      false,
    )
  }
  /**
   * 获取最后一次运行的shortcuts
   * @param conversationId
   */
  const getLastRunShortcuts = async (
    conversationId: string,
  ): Promise<{
    lastRunActions: ISetActionsType
    lastRunActionsMessageId: string
    lastRunActionsParams?: any[]
    conversation: IChatConversation | null
  }> => {
    const conversation = await clientGetConversation(conversationId)
    if (conversation?.meta.lastRunActions) {
      return {
        lastRunActions: conversation.meta.lastRunActions || [],
        lastRunActionsMessageId:
          conversation.meta.lastRunActionsMessageId || '',
        conversation,
        lastRunActionsParams: conversation.meta.lastRunActionsParams,
      }
    }
    return {
      lastRunActions: [],
      lastRunActionsMessageId: '',
      lastRunActionsParams: undefined,
      conversation: null,
    }
  }

  return {
    shortCutsEngineRef,
    askAIQuestion,
    askAIWIthShortcuts,
    regenerate,
    stopGenerate,
    continueChat,
    loading: smoothConversationLoading,
  }
}
export default useClientChat
