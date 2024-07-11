/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import cloneDeep from 'lodash-es/cloneDeep'
import { useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { AuthState } from '@/features/auth/store'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useSummaryQuota from '@/features/chat-base/summary/hooks/useSummaryQuota'
import {
  getPageSummaryConversationId,
  getPageSummaryType,
  getSummaryNavItemByType,
} from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { getContextMenuByNavMetadataKey } from '@/features/chat-base/summary/utils/summaryActionHelper'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import CitationFactory from '@/features/citation/core/CitationFactory'
import { useContextMenuList } from '@/features/contextMenu'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  checkRemoteConversationIsExist,
  clientDownloadConversationToLocal,
} from '@/features/indexed_db/conversations/clientService'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { SidebarPageSummaryNavKeyState } from '@/features/sidebar/store'

const usePageSummary = () => {
  const { updateSidebarSettings, updateSidebarSummaryConversationId } =
    useSidebarSettings()
  const {
    getWritingMessageState,
    showConversationLoading,
    hideConversationLoading,
  } = useClientConversation()
  const [currentPageSummaryKey, setCurrentPageSummaryKey] = useRecoilState(
    SidebarPageSummaryNavKeyState,
  )
  const { isLogin } = useRecoilValue(AuthState)

  const { askAIWIthShortcuts } = useClientChat()
  const { createConversation, pushPricingHookMessage, currentConversationId } =
    useClientConversation()
  const { originContextMenuList } = useContextMenuList(
    'sidebarSummaryButton',
    '',
    false,
  )
  const { checkSummaryQuota } = useSummaryQuota()
  const isGeneratingPageSummaryRef = useRef(false)
  const createPageSummary = async () => {
    if (isGeneratingPageSummaryRef.current) {
      return
    }
    isGeneratingPageSummaryRef.current = true
    console.log('新版Conversation 创建pageSummary')
    console.log('simply createPageSummary')

    // 每次重新创建前清理citation缓存
    CitationFactory.destroyCitationService()

    const userId = await getMaxAIChromeExtensionUserId()
    const pageSummaryConversationId = getPageSummaryConversationId({ userId })
    const clientWritingMessage = await getWritingMessageState(
      pageSummaryConversationId,
    )

    updateSidebarSummaryConversationId(pageSummaryConversationId)

    const currentPageSummaryType = getPageSummaryType()
    const writingLoading = clientWritingMessage.loading

    // 当前conversation正在loading
    if (writingLoading) {
      isGeneratingPageSummaryRef.current = false
      return
    }

    showConversationLoading(pageSummaryConversationId)
    if (pageSummaryConversationId) {
      // 看看有没有已经存在的conversation
      let pageSummaryConversation =
        await ClientConversationManager.getConversationById(
          pageSummaryConversationId,
        )

      //如果没有，那么去remote看看有没有
      const localMessages = pageSummaryConversation
        ? await ClientConversationMessageManager.getMessageIds(
            pageSummaryConversation.id,
          )
        : []
      if (
        localMessages.length === 0 &&
        (await checkRemoteConversationIsExist(pageSummaryConversationId))
      ) {
        // 如果有，那么就同步一下
        const conversations = await clientDownloadConversationToLocal(
          pageSummaryConversationId,
        )
        pageSummaryConversation = conversations?.[0] || null
        if (pageSummaryConversation) {
          await ClientConversationManager.addOrUpdateConversation(
            pageSummaryConversationId,
            pageSummaryConversation,
          )
          // 下载10条消息
          const result = await clientFetchMaxAIAPI<{
            current_page: number
            current_page_size: number
            data: IChatMessage[]
            msg: string
            status: string
            total_page: number
          }>(`/conversation/get_messages_after_datetime`, {
            conversation_id: pageSummaryConversation.id,
            page: 0,
            page_size: 10,
          })
          if (result?.data?.data) {
            await ClientConversationMessageManager.diffRemoteConversationMessagesData(
              pageSummaryConversation.id,
              result.data.data,
            )
          }
        }
      }
      // 如果已经存在了，并且有AI消息，那么就不用创建了
      if (pageSummaryConversation?.id) {
        await updateSidebarSettings({
          summary: {
            conversationId: pageSummaryConversationId,
          },
        })
        const aiMessage =
          await ClientConversationMessageManager.getMessageByMessageType(
            pageSummaryConversationId,
            'ai',
            'earliest',
          )
        let isValidAIMessage =
          aiMessage &&
          aiMessage?.originalMessage &&
          aiMessage?.originalMessage.metadata?.isComplete &&
          aiMessage?.originalMessage.content?.text
        if (
          aiMessage &&
          aiMessage?.originalMessage &&
          aiMessage?.originalMessage.metadata?.navMetadata
        ) {
          const summaryNavKey =
            aiMessage.originalMessage.metadata.navMetadata.key
          const systemSummaryNavItem = getSummaryNavItemByType(
            currentPageSummaryType,
            summaryNavKey,
          )
          if (!systemSummaryNavItem) {
            const summaryActionContextMenuItem = originContextMenuList.find(
              (menuItem) => {
                return menuItem.id === summaryNavKey
              },
            )
            if (!summaryActionContextMenuItem) {
              isValidAIMessage = false
            }
          }
        }

        if (isValidAIMessage) {
          hideConversationLoading(pageSummaryConversationId)
          isGeneratingPageSummaryRef.current = false
          return
        }

        // 如果没有AI消息，那么清空所有消息，然后添加AI消息
        await ClientConversationMessageManager.deleteMessages(
          pageSummaryConversationId,
          await ClientConversationMessageManager.getMessageIds(
            pageSummaryConversationId,
          ),
        )
      }
      try {
        console.log('新版Conversation pageSummary开始创建')
        // 进入loading
        await createConversation('Summary')
        // 检测当前用量是否超出
        if (!(await checkSummaryQuota(currentPageSummaryType))) {
          await ClientConversationMessageManager.deleteMessages(
            pageSummaryConversationId,
            await ClientConversationMessageManager.getMessageIds(
              pageSummaryConversationId,
            ),
          )
          await pushPricingHookMessage('PAGE_SUMMARY')
          // TODO 这里临时这样解决，因为现在没登录会显示登录的界面，但是其他逻辑有可能会触发这个mixpanel
          if (isLogin) {
            authEmitPricingHooksLog('show', 'PAGE_SUMMARY', {
              conversationId: currentConversationId,
              paywallType: 'RESPONSE',
            })
          }
          hideConversationLoading(pageSummaryConversationId)
          isGeneratingPageSummaryRef.current = false
          return
        }

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
      } finally {
        hideConversationLoading(pageSummaryConversationId)
      }
    }
  }

  const resetPageSummary = () => {
    isGeneratingPageSummaryRef.current = false
  }

  return { resetPageSummary, createPageSummary }
}

export default usePageSummary
