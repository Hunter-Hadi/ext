/**
 * 用于生成所有系统提示的i18n文件
 */
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/background/defaultPromptsData/defaultGmailToolbarContextMenuJson'
import { CONTEXT_MENU_DRAFT_LIST } from '@/features/contextMenu/constants'
const allSystemPromptList: any = ([] as any[])
  // text-select-popup
  .concat(defaultContextMenuJson)
  // gmail assistant button
  .concat(defaultGmailToolbarContextMenuJson)
  // draft list
  .concat(CONTEXT_MENU_DRAFT_LIST)
  .map((item) => {
    return {
      [item.id]: item.text,
    }
  })
export default allSystemPromptList
