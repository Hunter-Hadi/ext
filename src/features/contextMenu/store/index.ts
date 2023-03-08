import { atom } from 'recoil'
import { ISetActionsType } from '@/features/shortcuts'

export type IContextMenuItem = {
  id: string | 'root'
  parent: string
  droppable: boolean
  text: string
  data: {
    editable: boolean
    type: 'group' | 'shortcuts'
    actions?: ISetActionsType
  }
}
export type IContextMenuItemWithChildren = IContextMenuItem & {
  children: IContextMenuItemWithChildren[]
}
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
  position: {
    x: number
    y: number
  }
  show: boolean
  selectionInputAble: boolean
  lastSelectionRanges: any | null
  tempSelectionRanges: any | null
}>({
  key: 'RangyState',
  default: {
    position: {
      x: 0,
      y: 0,
    },
    show: false,
    selectionInputAble: false,
    lastSelectionRanges: null,
    tempSelectionRanges: null,
  },
})
