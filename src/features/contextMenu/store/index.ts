import { atom, selector } from 'recoil'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { IVisibilitySetting } from '@/background/types/Settings'

export type IContextMenuItem = {
  id: string | 'root'
  parent: string
  droppable: boolean
  text: string
  data: {
    icon?: string
    searchText?: string
    editable: boolean
    type: 'group' | 'shortcuts'
    actions?: ISetActionsType
    // TODO - 之前的版本没有这个字段, 为了兼容老版本, 先不加required
    visibility?: IVisibilitySetting
  }
}
export type IContextMenuItemWithChildren = IContextMenuItem & {
  children: IContextMenuItemWithChildren[]
}

export type IRangyRect = {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}
export type ISelection = {
  selectionText: string
  selectionHtml: string
  selectionRect: IRangyRect
  selectionInputAble: boolean
  activeElement: HTMLElement
}

export const ContextMenuSettingsState = atom<{
  closeBeforeRefresh: boolean
}>({
  key: 'ContextMenuSettingsState',
  default: {
    // 在重新开启网页之前都不展示popup button
    closeBeforeRefresh: false,
  },
})

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
