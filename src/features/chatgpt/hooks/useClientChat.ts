import sum from 'lodash-es/sum'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidV4 } from 'uuid'

import { MAXAI_VISION_MODEL_UPLOAD_CONFIG } from '@/background/src/chat/constant'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useSummaryQuota from '@/features/chat-base/summary/hooks/useSummaryQuota'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  IAIProviderModel,
  IChatUploadFile,
  IUserChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import { createIndexedDBQuery } from '@/features/indexed_db/utils'
import { useShortCutsEngine } from '@/features/shortcuts/hooks/useShortCutsEngine'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import {
  calculateMaxHistoryQuestionResponseTokens,
  getTextTokensWithRequestIdle,
} from '@/features/shortcuts/utils/tokenizer'
import { getInputMediator } from '@/store/InputMediator'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

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
    shortCutsEngine,
    setShortCuts,
    runShortCuts,
    stopShortCuts,
    getParams,
  } = useShortCutsEngine()
  const { aiProviderRemoveAllFiles } = useAIProviderUpload()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const runShortCutsRef = useRef(runShortCuts)
  const setShortCutsRef = useRef(setShortCuts)
  const {
    currentConversationIdRef,
    clientConversation,
    pushPricingHookMessage,
    hideConversationLoading,
    showConversationLoading,
    getCurrentConversation,
    updateClientConversationLoading,
  } = useClientConversation()
  const { checkSummaryQuota } = useSummaryQuota()
  useEffect(() => {
    runShortCutsRef.current = runShortCuts
  }, [runShortCuts])
  useEffect(() => {
    setShortCutsRef.current = setShortCuts
  }, [setShortCuts])
  // 获取attachments
  const getAttachments = async (conversationId?: string) => {
    const port = new ContentScriptConnectionV2({
      runtime: 'client',
    })
    const attachments: IChatUploadFile[] =
      (
        await port.postMessage({
          event: 'Client_chatGetFiles',
          data: {
            conversationId:
              conversationId ||
              currentConversationIdRef.current ||
              shortCutsEngine!.conversationId,
          },
        })
      )?.data || []
    return attachments
  }

  const checkAttachments = async (files?: IChatUploadFile[]) => {
    // 1.在所有对话之前，确保先有conversationId
    const conversationId = shortCutsEngine!.conversationId
    const attachments = files || (await getAttachments(conversationId))
    if (attachments.length > 0) {
      // 如果有文件类型的附件，需要计算文件内容tokens的长度
      const extractText = attachments
        .map((attachment) => attachment?.extractedContent || '')
        .join('')
      const totalFileSizes = sum(
        attachments.map((attachment) => attachment.fileSize || 0),
      )
      if (totalFileSizes > MAXAI_VISION_MODEL_UPLOAD_CONFIG.maxFileSize) {
        // 如果文件总大小超过20MB
        await ClientConversationMessageManager.addMessages(conversationId, [
          {
            type: 'system',
            text: t(
              `client:provider__chatgpt__upload_file_error__total_too_large__text`,
            ),
            messageId: uuidV4(),
            conversationId,
            meta: {
              status: 'error',
            },
          },
        ])
        await aiProviderRemoveAllFiles()
        getInputMediator('chatBoxInputMediator').updateInputValue('')
        getInputMediator('floatingMenuInputMediator').updateInputValue('')
        return false
      }
      if (extractText) {
        // 因为我们没有对attachment的extractedContent进行限制，所以这里需要计算tokens的长度
        const conversationMaxTokens =
          (await getCurrentConversation())?.meta.maxTokens || 4096
        const maxAttachmentTokens =
          conversationMaxTokens -
          calculateMaxHistoryQuestionResponseTokens(conversationMaxTokens)
        const { isLimit: attachmentIsLimit } =
          await getTextTokensWithRequestIdle(extractText, {
            tokenLimit: maxAttachmentTokens,
          })
        if (attachmentIsLimit) {
          // 如果tokens长度超过限制
          await ClientConversationMessageManager.addMessages(conversationId, [
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
          ])
          await aiProviderRemoveAllFiles()
          getInputMediator('chatBoxInputMediator').updateInputValue('')
          getInputMediator('floatingMenuInputMediator').updateInputValue('')
          return false
        }
      }
    }
    return true
  }

  const askAIQuestion = async (
    question: IAskAIQuestion,
    options?: {
      beforeActions?: ISetActionsType
      afterActions?: ISetActionsType
    },
  ) => {
    const { beforeActions = [], afterActions = [] } = options || {}
    if (!question.meta?.attachments) {
      const attachments = await getAttachments(question.conversationId)
      if (attachments.length > 0) {
        await updateClientConversationLoading(true)
        if (!(await checkAttachments(attachments))) {
          await updateClientConversationLoading(false)
          return
        }
      } else if (question.text.trim() === '') {
        // 如果没有文本 && 没有附件
        await updateClientConversationLoading(false)
        return
      }
      const attachmentExtractedContents: Record<string, string> = {}
      attachments.forEach((attachment) => {
        attachmentExtractedContents[attachment.id] =
          attachment.extractedContent || ''
        delete attachment.extractedContent
      })
      question = mergeWithObject([
        question,
        {
          meta: {
            attachments,
          },
          extendContent: {
            attachmentExtractedContents,
          },
        },
      ])
    }
    // 如果有附件, 设置includeHistory=false
    if (question?.meta?.attachments?.length) {
      question.meta.includeHistory = false
    }
    await updateClientConversationLoading(true)
    console.log('beforeActions: ', beforeActions)
    const runActions: ISetActionsType = [
      ...beforeActions,
      {
        type: 'ASK_CHATGPT',
        parameters: {
          AskChatGPTActionQuestion: question as IUserChatMessage,
          isEnabledDetectAIResponseLanguage: false,
        },
      },
      ...afterActions,
    ]
    await askAIWIthShortcuts(runActions)
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
    const conversationId = shortCutsEngine!.conversationId
    // // 2.付费卡点判断
    // // PDF付费卡点
    // if (
    //   isMaxAIPDFPage() &&
    //   currentUserPlan.name === 'free' &&
    //   !currentUserPlan.isNewUser
    // ) {
    //   // 如果是PDF页面 &&
    //   // 如果是免费用户 &&
    //   // 如果不是新用户 &&
    //   // 如果有contextMenu
    //   // 则提示用户付费
    //   await pushPricingHookMessage('PDF_AI_VIEWER')
    //   return
    // }
    // 3. Model - 付费卡点
    const currentConversation = await getCurrentConversation(conversationId)
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
          await updateClientConversationLoading(false)
          return
        }
      }
    }

    // 判断是否有不保存最后运行的Shortcuts的Action存在
    const notSaveActionType: ActionIdentifier[] = ['SET_VARIABLES_MODAL']
    const isNeedSaveLastRunShortcuts = actions.find((action) => {
      return notSaveActionType.includes(action.type)
    })
    if (isSaveLastRunShortcuts && !isNeedSaveLastRunShortcuts) {
      // 4. 保存最后一次运行的shortcuts
      await saveLastRunShortcuts(
        conversationId,
        actions,
        overwriteParameters.length > 0
          ? overwriteParameters
          : getParams().shortCutsParameters,
      )
    }
    await updateClientConversationLoading(false)
    // 5. 运行shortcuts
    // setShortCutsRef.current(actions)
    // await runShortCutsRef.current(isOpenSidebarChatBox, overwriteParameters)
    setShortCuts(actions)
    await runShortCuts(isOpenSidebarChatBox, overwriteParameters)
  }
  /**
   * 重新生成最后一次运行的shortcuts
   */
  const regenerate = async () => {
    const currentConversationId = currentConversationIdRef.current
    if (!currentConversationId) return
    try {
      showConversationLoading(currentConversationId)

      const { lastRunActionsParams, lastRunActions, needDeleteMessageIds } =
        await getLastRunShortcuts(currentConversationId)

      if (clientConversation?.type === 'Summary') {
        // 如果重试的是summary message，需要判断用量
        const isSummaryActions = lastRunActions?.find((item) => {
          return (
            item.type === 'CHAT_MESSAGE' &&
            item.parameters.ActionChatMessageConfig?.originalMessage?.metadata
              ?.shareType === 'summary'
          )
        })
        if (
          isSummaryActions &&
          !(await checkSummaryQuota(clientConversation.meta.pageSummaryType!))
        ) {
          await pushPricingHookMessage('PAGE_SUMMARY')
          authEmitPricingHooksLog('show', 'PAGE_SUMMARY', {
            conversationId: currentConversationId,
            paywallType: 'RESPONSE',
          })
          return
        }
      }

      if (lastRunActions.length > 0) {
        console.log(needDeleteMessageIds)
        await ClientConversationMessageManager.deleteMessages(
          currentConversationId,
          needDeleteMessageIds,
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
        const messageIds = await ClientConversationMessageManager.getMessageIds(
          currentConversationId,
        )
        // 寻找最后一个user message
        const needDeleteIds: string[] = []
        let lastUserMessage: IUserChatMessage | null = null
        for (let i = messageIds.length - 1; i >= 0; i--) {
          needDeleteIds.push(messageIds[i])
          const message =
            await ClientConversationMessageManager.getMessageByMessageId(
              messageIds[i],
            )
          if (message?.type === 'user') {
            lastUserMessage = message as IUserChatMessage
            break
          }
        }
        if (lastUserMessage) {
          await ClientConversationMessageManager.deleteMessages(
            currentConversationId,
            needDeleteIds,
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
    } catch (e) {
      console.log('regenerate error: \t', e)
    } finally {
      hideConversationLoading(currentConversationId)
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

  return {
    shortCutsEngine,
    askAIQuestion,
    askAIWIthShortcuts,
    regenerate,
    stopGenerate,
    continueChat,
    checkAttachments,
    loading: smoothConversationLoading,
  }
}

/**
 * 保存最后一次运行的shortcuts
 * @param conversationId
 * @param actions
 * @param params
 */
export const saveLastRunShortcuts = async (
  conversationId: string,
  actions: ISetActionsType,
  params?: any[],
) => {
  const lastMessage =
    await ClientConversationMessageManager.getMessageByTimeFrame(
      conversationId,
      'latest',
    )
  const lastRunActionsMessageId = lastMessage?.messageId
  await createIndexedDBQuery('conversations')
    .conversationLocalStorage.put({
      conversationId,
      lastRunActions: actions,
      lastRunActionsParams: params,
      lastRunActionsMessageId,
    })
    .then()
}

/**
 * 获取最后一次运行的shortcuts
 * @param conversationId
 */
export const getLastRunShortcuts = async (
  conversationId: string,
): Promise<{
  lastRunActions: ISetActionsType
  lastRunActionsMessageId: string
  lastRunActionsParams?: any[]
  needDeleteMessageIds: string[]
}> => {
  const conversationLocalStorage = await createIndexedDBQuery('conversations')
    .conversationLocalStorage.get(conversationId)
    .then()
  let needDeleteMessageIds = []
  if (
    conversationLocalStorage?.lastRunActions &&
    conversationLocalStorage.lastRunActions.length > 0
  ) {
    if (conversationLocalStorage.lastRunActionsMessageId) {
      needDeleteMessageIds =
        await ClientConversationMessageManager.getDeleteMessageIds(
          conversationId,
          conversationLocalStorage.lastRunActionsMessageId,
          'latest',
        )
    } else {
      // 如果Chat是第一次对话，lastMessageId是没有的
      // 需要删除所有的message
      needDeleteMessageIds =
        await ClientConversationMessageManager.getMessageIds(conversationId)
    }
    return {
      lastRunActions: conversationLocalStorage.lastRunActions || [],
      lastRunActionsMessageId:
        conversationLocalStorage.lastRunActionsMessageId || '',
      lastRunActionsParams: conversationLocalStorage.lastRunActionsParams,
      needDeleteMessageIds,
    }
  }
  return {
    lastRunActions: [],
    lastRunActionsMessageId: '',
    lastRunActionsParams: undefined,
    needDeleteMessageIds: [],
  }
}
export default useClientChat
