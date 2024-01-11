import { IChatConversation } from '@/background/src/chatConversations'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { IUserChatMessage } from '@/features/chatgpt/types'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { isMaxAIPDFPage } from '@/utils/dataHelper/websiteHelper'

export interface IAskAIQuestion
  extends Omit<IUserChatMessage, 'messageId' | 'conversationId'> {
  conversationId?: string
  messageId?: string
}

const useClientChat = () => {
  const { currentUserPlan } = useUserInfo()
  const {
    setShortCuts,
    runShortCuts,
    stopShortCuts,
    getParams,
  } = useShortCutsWithMessageChat()
  const {
    currentConversationIdRef,
    createConversation,
    pushPricingHookMessage,
    hideConversationLoading,
    showConversationLoading,
    updateConversation,
  } = useClientConversation()
  const askAIQuestion = async (question: IAskAIQuestion) => {
    await askAIWIthShortcuts([
      {
        type: 'ASK_CHATGPT',
        parameters: {
          AskChatGPTActionQuestion: question as IUserChatMessage,
        },
      },
    ])
  }
  /**
   * 问AI问题
   * @param actions
   * @param params
   */
  const askAIWIthShortcuts = async (
    actions: ISetActionsType,
    params?: IShortCutsParameter[],
  ) => {
    // 1.在所有对话之前，确保先有conversationId
    let conversationId = currentConversationIdRef.current
    if (!conversationId) {
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
    // 3. 保存最后一次运行的shortcuts
    await saveLastRunShortcuts(conversationId, actions, params)
    // 4. 运行shortcuts
    setShortCuts(actions)
    await runShortCuts(false, params)
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
          const messages = conversation?.messages || []
          if (lastRunActionsMessageId) {
            for (let i = messages.length - 1; i >= 0; i--) {
              if (messages[i].messageId === lastRunActionsMessageId) {
                break
              }
              needDeleteCount++
            }
          }
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
          setShortCuts(waitRunActions)
          await saveLastRunShortcuts(
            currentConversationId,
            waitRunActions,
            lastRunActionsParams,
          )
          await runShortCuts(false, lastRunActionsParams)
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
    askAIQuestion,
    askAIWIthShortcuts,
    regenerate,
    stopGenerate,
    continueChat,
  }
}
export default useClientChat
