/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import { useEffect, useRef, useState } from 'react'
import { useSetRecoilState } from 'recoil'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { permissionCardToChatMessage } from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import {
  getContextMenuActionsByPageSummaryType,
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'

const usePageSummary = () => {
  const {
    updateSidebarSettings,
    currentSidebarConversationId,
    currentSidebarConversationType,
  } = useSidebarSettings()
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  const permissionCardMap = usePermissionCardMap()
  const { currentUserPlan } = useUserInfo()
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const [runActions, setRunActions] = useState<ISetActionsType>([])
  const { createConversation } = useClientConversation()
  const isFetchingRef = useRef(false)
  const lastMessageIdRef = useRef('')
  const createPageSummary = async () => {
    if (isFetchingRef.current) {
      return
    }
    console.log('新版Conversation 创建pageSummary')
    //切换至summary的时候把ChatGPT（MaxAI）的provider的onboarding check设置为true
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_USE_CHAT_GPT_PLUS',
      true,
    )
    const pageSummaryConversationId = getPageSummaryConversationId()
    updateConversation((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    })
    if (pageSummaryConversationId) {
      // 看看有没有已经存在的conversation
      const pageSummaryConversation = await clientGetConversation(
        pageSummaryConversationId,
      )
      // 如果已经存在了，并且有AI消息，那么就不用创建了
      if (pageSummaryConversation?.id) {
        console.log('新版Conversation pageSummary已经存在')
        await updateSidebarSettings({
          summary: {
            conversationId: pageSummaryConversationId,
          },
        })
        const aiMessage = pageSummaryConversation.messages?.find((message) =>
          isAIMessage(message),
        ) as IAIResponseMessage
        if (
          aiMessage &&
          aiMessage?.originalMessage &&
          aiMessage?.originalMessage.metadata?.isComplete
        ) {
          updateConversation((prevState) => {
            return {
              ...prevState,
              loading: false,
            }
          })
          return
        } else {
          // 如果没有AI消息，那么清空所有消息，然后添加AI消息
          await clientChatConversationModifyChatMessages(
            'clear',
            pageSummaryConversationId,
            0,
            [],
          )
        }
      }
      try {
        console.log('新版Conversation pageSummary开始创建')
        // 进入loading
        await createConversation()
        updateConversation((prevState) => {
          return {
            ...prevState,
            loading: false,
          }
        })
        // 如果是免费用户
        if (
          currentUserPlan.name !== 'pro' &&
          currentUserPlan.name !== 'elite'
        ) {
          // 判断lifetimes free trial是否已经用完
          const summaryLifetimesQuota =
            Number(
              (await getChromeExtensionOnBoardingData())
                .ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_TIMES,
            ) || 0
          if (summaryLifetimesQuota > 0) {
            // 如果没有用完，那么就减一
            await setChromeExtensionOnBoardingData(
              'ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_TIMES',
              summaryLifetimesQuota - 1,
            )
          } else {
            await clientChatConversationModifyChatMessages(
              'clear',
              pageSummaryConversationId,
              0,
              [],
            )
            await clientChatConversationModifyChatMessages(
              'add',
              pageSummaryConversationId,
              0,
              [permissionCardToChatMessage(permissionCardMap['PAGE_SUMMARY'])],
            )
            authEmitPricingHooksLog('show', 'PAGE_SUMMARY')
            return
          }
        }
        const { actions, messageId } = getContextMenuActionsByPageSummaryType(
          getPageSummaryType(),
        )
        lastMessageIdRef.current = messageId
        setRunActions(actions)
      } catch (e) {
        console.log('创建Conversation失败', e)
      }
    }
  }
  useEffect(() => {
    if (
      runActions.length > 0 &&
      !isFetchingRef.current &&
      currentSidebarConversationType === 'Summary' &&
      currentSidebarConversationId
    ) {
      isFetchingRef.current = true
      if (setShortCuts(runActions)) {
        setRunActions([])
        runShortCuts()
          .then()
          .catch()
          .finally(() => {
            isFetchingRef.current = false
            const conversationId = getPageSummaryConversationId()
            if (conversationId && lastMessageIdRef.current) {
              // 因为整个过程不一定是成功的
              // 更新消息的isComplete/sources.status
              clientChatConversationModifyChatMessages(
                'update',
                conversationId,
                0,
                [
                  {
                    messageId: lastMessageIdRef.current,
                    originalMessage: {
                      status: 'complete',
                      metadata: {
                        sources: {
                          status: 'complete',
                        },
                        isComplete: true,
                      },
                    },
                  } as IAIResponseMessage,
                ],
              )
                .then()
                .catch()
            }
          })
      } else {
        setRunActions([])
        isFetchingRef.current = false
      }
    }
  }, [
    runShortCuts,
    setRunActions,
    currentSidebarConversationType,
    currentSidebarConversationId,
    runActions,
  ])
  return {
    createPageSummary,
  }
}

export default usePageSummary
