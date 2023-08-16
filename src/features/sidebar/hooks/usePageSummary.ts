/**
 * 初始化页面摘要
 * @since - 2023-08-15
 * @doc - https://ikjt09m6ta.larksuite.com/docx/LzzhdnFbsov11axfXwwuZGeasLg
 */
import { useRef } from 'react'
import {
  generateInitPageSummaryData,
  IInitPageSummaryData,
  PAGE_SUMMARY_CONTEXT_MENU_MAP,
} from '@/features/sidebar/utils/pageSummaryHelper'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import cloneDeep from 'lodash-es/cloneDeep'

const usePageSummary = () => {
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const isInitPageSummary = useRef(false)
  const initPageSummaryDataRef = useRef<IInitPageSummaryData | null>(null)
  const initPageSummaryConversationId = async (): Promise<string> => {
    if (isInitPageSummary.current) {
      return initPageSummaryDataRef.current?.id || ''
    }
    isInitPageSummary.current = true
    initPageSummaryDataRef.current = await generateInitPageSummaryData()
    return initPageSummaryDataRef.current?.id || ''
  }
  const createPageSummary = async () => {
    if (initPageSummaryDataRef.current) {
      const contextMenu = cloneDeep(
        PAGE_SUMMARY_CONTEXT_MENU_MAP[initPageSummaryDataRef.current?.type],
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
    }
  }
  return {
    initPageSummaryDataRef,
    initPageSummaryConversationId,
    createPageSummary,
  }
}

export default usePageSummary
