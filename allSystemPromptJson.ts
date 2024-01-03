/**
 * 用于生成所有系统提示的i18n文件
 */
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import defaultEditAssistantComposeReplyContextMenuJson from '@/background/defaultPromptsData/defaultEditAssistantComposeReplyContextMenuJson'
import defaultInputAssistantComposeNewContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantComposeNewContextMenuJson'
import defaultInputAssistantRefineDraftContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantRefineDraftContextMenuJson'
import { CONTEXT_MENU_DRAFT_LIST } from '@/features/contextMenu/constants'
const allSystemPromptList: any = ([] as any[])
  // text-select-popup
  .concat(defaultContextMenuJson)
  // input assistant
  .concat(defaultInputAssistantRefineDraftContextMenuJson)
  .concat(defaultInputAssistantComposeNewContextMenuJson)
  .concat(defaultEditAssistantComposeReplyContextMenuJson)
  // draft list
  .concat(CONTEXT_MENU_DRAFT_LIST)
  .concat([
    {
      text: 'Preset prompts',
      id: 'PRESET_PROMPT_ID',
      parent: 'root',
      droppable: false,
      data: {
        type: 'shortcuts',
        editable: false,
      },
    },
  ])
  .map((item) => {
    return {
      [item.id]: item.text,
    }
  })
export default allSystemPromptList
