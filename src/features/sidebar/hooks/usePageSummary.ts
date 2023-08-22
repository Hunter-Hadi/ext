/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import {
  getContextMenuActionsByPageSummaryType,
  getPageSummaryConversationId,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { useSetRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  SidebarSettingsState,
} from '@/features/sidebar'
import { useEffect, useRef, useState } from 'react'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { getPermissionCardMessageByPermissionCardSettings } from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'

const usePageSummary = () => {
  const setSidebarSettings = useSetRecoilState(SidebarSettingsState)
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  const permissionCardMap = usePermissionCardMap()
  const { currentUserPlan } = useUserInfo()
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const [runActions, setRunActions] = useState<ISetActionsType>([])
  const { createConversation } = useClientConversation()
  const isFetchingRef = useRef(false)
  const createPageSummary = async () => {
    if (isFetchingRef.current) {
      return
    }
    const pageSummaryConversationId = getPageSummaryConversationId()
    if (pageSummaryConversationId) {
      // 看看有没有已经存在的conversation
      const pageSummaryConversation = await clientGetConversation(
        pageSummaryConversationId,
      )
      if (pageSummaryConversation?.id) {
        setSidebarSettings((prevState) => {
          return {
            ...prevState,
            summaryConversationId: pageSummaryConversationId,
          }
        })
        return
      }
      try {
        updateConversation((prevState) => {
          return {
            ...prevState,
            loading: true,
          }
        })
        // 进入loading
        await createConversation()
        updateConversation((prevState) => {
          return {
            ...prevState,
            loading: false,
          }
        })
        if (currentUserPlan.name !== 'pro') {
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
            [
              getPermissionCardMessageByPermissionCardSettings(
                permissionCardMap['PAGE_SUMMARY'],
              ),
            ],
          )
          return
        }
        const actions = getContextMenuActionsByPageSummaryType(
          getPageSummaryType(),
        )
        setRunActions(actions)
      } catch (e) {
        console.log('创建Conversation失败', e)
      }
    }
  }
  useEffect(() => {
    if (runActions.length > 0 && !isFetchingRef.current) {
      isFetchingRef.current = true
      if (setShortCuts(runActions)) {
        runShortCuts()
          .then()
          .catch()
          .finally(() => {
            isFetchingRef.current = false
            setRunActions([])
          })
      } else {
        setRunActions([])
        isFetchingRef.current = false
      }
    }
  }, [runShortCuts, setRunActions, runActions])
  return {
    createPageSummary,
  }
}

export default usePageSummary
