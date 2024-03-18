/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import { useCallback, useRef } from 'react'
import { useSetRecoilState } from 'recoil'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ClientWritingMessageState } from '@/features/sidebar/store'
import {
  getContextMenuActionsByPageSummaryType,
  getPageSummaryConversationId,
  getPageSummaryType,
  getSummaryNavItemByType,
} from '@/features/sidebar/utils/pageSummaryHelper'

import { SummaryParamsPromptType } from '../utils/pageSummaryNavPrompt'

const usePageSummary = () => {
  const {
    updateSidebarSettings,
    currentSidebarConversationId,
    currentSidebarConversationType,
  } = useSidebarSettings()
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const updateClientWritingMessage = useSetRecoilState(
    ClientWritingMessageState,
  )
  const { currentUserPlan } = useUserInfo()

  const { askAIWIthShortcuts } = useClientChat()
  const { createConversation, pushPricingHookMessage } = useClientConversation()
  const isFetchingRef = useRef(false)
  const currentPageSummaryKey = useRef<
    { [key in string]: SummaryParamsPromptType | undefined }
  >({}) //储存Summary nav key

  const lastMessageIdRef = useRef('')

  const createPageSummary = async () => {
    if (isFetchingRef.current) {
      return
    }
    console.log('新版Conversation 创建pageSummary')
    const pageSummaryConversationId = getPageSummaryConversationId()
    updateClientWritingMessage((prevState) => {
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
      const currentPageSummaryType =
        pageSummaryConversation?.meta.pageSummaryType
      // 如果已经存在了，并且有AI消息，那么就不用创建了
      if (pageSummaryConversation?.id) {
        console.log('新版Conversation pageSummary已经存在')
        //拿取当前页面summary page的summary nav的key 保持状态
        const lastRunActionTitle = (pageSummaryConversation?.meta
          ?.lastRunActions?.[0]?.parameters
          .ActionChatMessageConfig as IAIResponseMessage)?.originalMessage
          ?.metadata?.title?.title
        if (lastRunActionTitle && currentPageSummaryType) {
          const newSummaryNavKey = getSummaryNavItemByType(
            currentPageSummaryType,
            lastRunActionTitle,
            'title',
          )?.key
          currentPageSummaryKey.current[
            currentPageSummaryType
          ] = newSummaryNavKey
        }
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
          updateClientWritingMessage((prevState) => {
            return {
              ...prevState,
              loading: false,
            }
          })
          updateConversationMap((prevState) => {
            return {
              ...prevState,
              [pageSummaryConversation.id]: pageSummaryConversation,
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
        updateClientWritingMessage((prevState) => {
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
            await pushPricingHookMessage('PAGE_SUMMARY')
            authEmitPricingHooksLog('show', 'PAGE_SUMMARY')
            return
          }
        }
        const paramsPageSummaryTypeData = await getContextMenuActionsByPageSummaryType(
          getPageSummaryType(),
          currentPageSummaryKey.current[currentPageSummaryType],
        )
        if (paramsPageSummaryTypeData) {
          currentPageSummaryKey.current[currentPageSummaryType] =
            paramsPageSummaryTypeData.summaryNavKey
          lastMessageIdRef.current = paramsPageSummaryTypeData.messageId
          runPageSummaryActions(paramsPageSummaryTypeData.actions)
        }
      } catch (e) {
        console.log('创建Conversation失败', e)
      }
    }
  }

  const runPageSummaryActions = useCallback(
    (actions: ISetActionsType) => {
      if (
        actions.length > 0 &&
        !isFetchingRef.current &&
        currentSidebarConversationType === 'Summary' &&
        currentSidebarConversationId
      ) {
        isFetchingRef.current = true
        // debugger
        askAIWIthShortcuts(actions)
          .then()
          .catch()
          .finally(() => {
            isFetchingRef.current = false
          })
      }
    },
    [
      askAIWIthShortcuts,
      currentSidebarConversationType,
      currentSidebarConversationId,
    ],
  )

  return {
    createPageSummary,
  }
}

export default usePageSummary
