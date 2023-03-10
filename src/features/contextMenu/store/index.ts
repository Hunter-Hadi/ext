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

export const RangyState = atom<{
  show: boolean
  selectionInputAble: boolean
  lastSelectionRanges: any | null
  tempSelectionRanges: any | null
  tempSelectRangeRect: IRangyRect | null
}>({
  key: 'RangyState',
  default: {
    show: false,
    tempSelectRangeRect: null,
    selectionInputAble: false,
    lastSelectionRanges: null,
    tempSelectionRanges: null,
  },
})