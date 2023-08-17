/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import {
  getPageSummaryConversationId,
  getPageSummaryType,
  PAGE_SUMMARY_CONTEXT_MENU_MAP,
} from '@/features/sidebar/utils/pageSummaryHelper'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import cloneDeep from 'lodash-es/cloneDeep'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { useSetRecoilState } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { useRef } from 'react'

const usePageSummary = () => {
  const setSidebarSettings = useSetRecoilState(SidebarSettingsState)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
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
      if (pageSummaryConversation) {
        setSidebarSettings((prevState) => {
          return {
            ...prevState,
            summaryConversationId: pageSummaryConversationId,
          }
        })
        return
      }
      try {
        isFetchingRef.current = true
        const contextMenu = cloneDeep(
          PAGE_SUMMARY_CONTEXT_MENU_MAP[getPageSummaryType()],
        )
        if (
          setShortCuts([
            {
              type: 'ASK_CHATGPT',
              parameters: {
                template: contextMenu.data.actions?.[0].parameters.template,
                AskChatGPTActionMeta: {
                  contextMenu: contextMenu,
                },
              },
            },
          ])
        ) {
          await runShortCuts()
        }
      } catch (e) {
        console.log('usePageSummary error', e)
      } finally {
        isFetchingRef.current = false
      }
    }
  }
  return {
    createPageSummary,
  }
}

export default usePageSummary
