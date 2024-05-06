/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import { cloneDeep } from 'lodash-es'
import { useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { useContextMenuList } from '@/features/contextMenu'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { SidebarPageSummaryNavKeyState } from '@/features/sidebar/store'
import {
  getContextMenuByNavMetadataKey,
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'

const usePageSummary = () => {
  const { updateSidebarSettings, updateSidebarSummaryConversationId } =
    useSidebarSettings()
  const updateConversationMap = useSetRecoilState(ClientConversationMapState)
  const { clientWritingMessage, updateClientConversationLoading } =
    useClientConversation()
  const [currentPageSummaryKey, setCurrentPageSummaryKey] = useRecoilState(
    SidebarPageSummaryNavKeyState,
  )
  const { isPayingUser } = useUserInfo()

  const { askAIWIthShortcuts } = useClientChat()
  const { createConversation, pushPricingHookMessage, currentConversationId } =
    useClientConversation()
  const { originContextMenuList } = useContextMenuList(
    'sidebarSummaryButton',
    '',
    false,
  )
  const isGeneratingPageSummaryRef = useRef(false)
  const lastMessageIdRef = useRef('')
  const clientWritingMessageRef = useRef(clientWritingMessage)
  clientWritingMessageRef.current = clientWritingMessage

  const createPageSummary = async () => {
    if (isGeneratingPageSummaryRef.current) {
      return
    }
    isGeneratingPageSummaryRef.current = true
    console.log('新版Conversation 创建pageSummary')
    console.log('simply createPageSummary')
    const pageSummaryConversationId = getPageSummaryConversationId()
    updateSidebarSummaryConversationId(pageSummaryConversationId)

    const writingLoading = clientWritingMessageRef.current.loading

    updateClientConversationLoading(true)
    if (pageSummaryConversationId) {
      // 看看有没有已经存在的conversation
      const pageSummaryConversation = await clientGetConversation(
        pageSummaryConversationId,
      )
      // 如果已经存在了，并且有AI消息，那么就不用创建了
      if (pageSummaryConversation?.id) {
        await updateSidebarSettings({
          summary: {
            conversationId: pageSummaryConversationId,
          },
        })
        const aiMessage = pageSummaryConversation.messages?.find((message) =>
          isAIMessage(message),
        ) as IAIResponseMessage
        if (writingLoading) {
          updateClientConversationLoading(false)
          updateConversationMap((prevState) => {
            return {
              ...prevState,
              [pageSummaryConversation.id]: pageSummaryConversation,
            }
          })
          isGeneratingPageSummaryRef.current = false
          return
        }
        if (
          aiMessage &&
          aiMessage?.originalMessage &&
          aiMessage?.originalMessage.metadata?.isComplete
        ) {
          updateClientConversationLoading(false)
          updateConversationMap((prevState) => {
            return {
              ...prevState,
              [pageSummaryConversation.id]: pageSummaryConversation,
            }
          })
          isGeneratingPageSummaryRef.current = false
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
        await createConversation('Summary')
        // 如果是免费用户
        if (!isPayingUser) {
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
            authEmitPricingHooksLog('show', 'PAGE_SUMMARY', {
              conversationId: currentConversationId,
            })
            isGeneratingPageSummaryRef.current = false
            updateClientConversationLoading(false)
            return
          }
        }

        const currentPageSummaryType = getPageSummaryType()
        const summaryNavMetadataKey = cloneDeep(currentPageSummaryKey)[
          currentPageSummaryType
        ]

        const contextMenu = await getContextMenuByNavMetadataKey(
          currentPageSummaryType,
          summaryNavMetadataKey,
          originContextMenuList,
        )

        if (contextMenu) {
          setCurrentPageSummaryKey((summaryKeys) => {
            return {
              ...summaryKeys,
              [currentPageSummaryType]: contextMenu.summaryNavKey,
            }
          })
          lastMessageIdRef.current = contextMenu.messageId
          await askAIWIthShortcuts(contextMenu.actions)
            .then()
            .finally(() => {
              isGeneratingPageSummaryRef.current = false
            })
        }

        // const paramsPageSummaryTypeData =
        //   await getContextMenuActionsByPageSummaryType(
        //     currentPageSummaryType,
        //     nowCurrentPageSummaryKey[currentPageSummaryType],
        //   )
        // if (paramsPageSummaryTypeData) {
        //   setCurrentPageSummaryKey((summaryKeys) => {
        //     return {
        //       ...summaryKeys,
        //       [currentPageSummaryType]: paramsPageSummaryTypeData.summaryNavKey,
        //     }
        //   })
        //   lastMessageIdRef.current = paramsPageSummaryTypeData.messageId
        //   await askAIWIthShortcuts(paramsPageSummaryTypeData.actions)
        //     .then()
        //     .finally(() => {
        //       isGeneratingPageSummaryRef.current = false
        //     })
        // }
      } catch (e) {
        console.log('创建Conversation失败', e)
        isGeneratingPageSummaryRef.current = false
      }
    }
  }

  const resetPageSummary = () => {
    isGeneratingPageSummaryRef.current = false
  }
  return { resetPageSummary, createPageSummary, isGeneratingPageSummaryRef }
}

export default usePageSummary
