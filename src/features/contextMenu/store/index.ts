import { atom, selector } from 'recoil'

import { IRangyRect, ISelection } from '@/features/contextMenu/types'
import { AppDBStorageState } from '@/store'

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
  /**
   * content menu是否显示
   */
  open: boolean
  /**
   * selection的rect
   */
  rootRect: IRangyRect | null
  showModelSelector: boolean
}>({
  key: 'FloatingDropdownMenuState',
  default: {
    open: false,
    rootRect: null,
    showModelSelector: false,
  },
})

export const ContextMenuOpenSelector = selector<boolean>({
  key: 'ContextMenuOpenSelector',
  get(opts) {
    return opts.get(FloatingDropdownMenuState).open
  },
})

/**
 * 记录会话是否已经接管到Sidebar了，目前只对always处理
 */
export const ContextMenuPinedToSidebarState = atom({
  key: 'ContextMenuPinedToSidebarState',
  default: false,
})

export const ContextMenuConversationState = atom<{
  conversationId: string
}>({
  key: 'ContextMenuConversationState',
  default: {
    conversationId: '',
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
export const ContextWindowDraftContextMenuState = atom<{
  selectedDraftContextMenuId: string | null
  lastOutput: string
}>({
  key: 'ContextWindowDraftContextMenuState',
  default: {
    selectedDraftContextMenuId: null,
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

export const PinToSidebarState = atom({
  key: 'PinToSiderbarState',
  default: {
    once: false,
    always: false,
  },
})

export const AlwaysPinToSidebarSelector = selector<boolean>({
  key: 'AlwaysPinToSidebarSelector',
  get({ get }) {
    return get(AppDBStorageState).userSettings?.alwaysContinueInSidebar || false
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

export const FloatingContextWindowChangesState = atom<{
  contextWindowMode:
    | 'READ'
    | 'EDITED_VARIABLES'
    | 'EDIT_VARIABLES'
    | 'AI_RESPONSE'
    | 'CUSTOM_INPUT'
    | 'LOADING'
  discardChangesModalVisible: boolean
}>({
  key: 'FloatingContextWindowModeState',
  default: {
    contextWindowMode: 'READ',
    discardChangesModalVisible: false,
  },
})

export const FloatingImageMiniMenuState = atom({
  key: 'FloatingImageMiniMenuState',
  default: {
    show: false,
    position: { top: '0px', left: '0px' },
  },
})
