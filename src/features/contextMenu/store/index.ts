import { atom, selector } from 'recoil'
import { IRangyRect, ISelection } from '@/features/contextMenu/types'
import {
  ChatGPTConversationState,
  SidebarChatConversationMessagesSelector,
} from '@/features/sidebar'
import { IChatMessage } from '@/features/chatgpt/types'

export const ContextMenuSettingsState = atom<{
  closeBeforeRefresh: boolean
}>({
  key: 'ContextMenuSettingsState',
  default: {
    // 在重新开启网页之前都不展示popup button
    closeBeforeRefresh: false,
  },
})
// rangy lib
export const RangyCoreState = atom<{
  loaded: boolean
  rangy: any | null
}>({
  key: 'RangyCoreState',
  default: {
    loaded: false,
    rangy: null,
  },
})
// 悬浮按钮菜单
export const RangyState = atom<{
  show: boolean
  tempSelection: ISelection | null
  currentSelection: ISelection | null
}>({
  key: 'RangyState',
  default: {
    show: false,
    tempSelection: null,
    currentSelection: null,
  },
})

// ai input dropdown menu
export const FloatingDropdownMenuState = atom<{
  open: boolean
  rootRect: IRangyRect | null
}>({
  key: 'FloatingDropdownMenuState',
  default: {
    open: false,
    rootRect: null,
  },
})

export const FloatingDropdownMenuLastFocusRangeState = atom<{
  range: Range | null
  selectionText: string | null
}>({
  key: 'FloatingDropdownMenuLastFocusRangeState',
  default: {
    range: null,
    selectionText: null,
  },
})

// AI input下拉菜单的继续操作内容选项
// AI input dropdown menu system items
export const FloatingDropdownMenuSystemItemsState = atom<{
  selectContextMenuId: string | null
  lastOutput: string
}>({
  key: 'FloatingDropdownMenuSystemItemsState',
  default: {
    selectContextMenuId: null,
    lastOutput: '',
  },
})

// AI input的下拉菜单选项
// AI input down menu items
export const FloatingDropdownMenuSelectedItemState = atom<{
  hoverContextMenuIdMap: {
    [key: string]: string
  }
  lastHoverContextMenuId: string | null
  selectedContextMenuId: string | null
}>({
  key: 'FloatingDropdownMenuSelectedItemState',
  default: {
    hoverContextMenuIdMap: {},
    selectedContextMenuId: null,
    lastHoverContextMenuId: null,
  },
})
export const FloatingDropdownMenuItemsSelector = selector<string[]>({
  key: 'FloatingDropdownMenuItemsSelector',
  get: ({ get }) => {
    const hoverIdMap = get(
      FloatingDropdownMenuSelectedItemState,
    ).hoverContextMenuIdMap
    return Object.values(hoverIdMap).filter((id) => id)
  },
})
/**
 * AI草稿状态
 */
export const FloatingContextMenuDraftState = atom<{
  lastAIMessageId: string
}>({
  key: 'FloatingContextMenuDraftState',
  default: {
    lastAIMessageId: '',
  },
})

/**
 * AI持续生成的草稿
 */
export const FloatingContextMenuDraftSelector = selector<string>({
  key: 'FloatingContextMenuDraftSelector',
  get: ({ get }) => {
    const messages = get(SidebarChatConversationMessagesSelector)
    const aiWritingMessage = get(ChatGPTConversationState)
    const aiMessages: IChatMessage[] = []
    const lastAIMessageId = get(FloatingContextMenuDraftState).lastAIMessageId
    if (!lastAIMessageId) {
      return ''
    }
    // 从后往前找，直到找到最近的AI message
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      if (message.messageId === lastAIMessageId) {
        break
      }
      if (message.type === 'ai') {
        // 因为是从后往前找，所以插入到最前面
        aiMessages.unshift(message)
      }
    }
    if (aiWritingMessage.writingMessage) {
      if (aiWritingMessage.writingMessage.type === 'ai') {
        aiMessages.push(aiWritingMessage.writingMessage)
      }
    }
    console.log('AiInput aiMessages', lastAIMessageId, aiMessages, messages)
    const draft = aiMessages
      .map((message) => message.text)
      .join('\n\n')
      .replace(/\n{2,}/, '\n\n')
    return draft
  },
})
