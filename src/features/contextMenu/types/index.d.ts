import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { CONTEXT_MENU_DRAFT_TYPES } from '@/features/contextMenu/constants'
import { IVisibilitySetting } from '@/background/utils/chromeExtensionStorage/types'

export type ContextMenuDraftType = keyof typeof CONTEXT_MENU_DRAFT_TYPES

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

export interface ISelectionElement {
  virtual: boolean
  tagName: string
  // 因为iframe是无法拿到dom的
  target?: HTMLElement
  targetRect: IRangyRect
  selectionRect: IRangyRect
  selectionHTML: string
  selectionText: string
  eventType: 'mouseup' | 'keyup'
  isEmbedPage: boolean
  isEditableElement: boolean
  startMarkerId: string
  endMarkerId: string
  caretOffset?: number
  id?: string
  className?: string
  // editableElementSelectionText 是因为需要兼顾用户在editableElement中选中文本和没选中时候直接cmd+j的情况
  editableElementSelectionText?: string
  // TODO - 预留
  editableElementSelectionHTML?: string
}

export interface IVirtualIframeSelectionElement extends ISelectionElement {
  iframeId: string
  windowRect: IRangyRect
  iframeSelectionRect: IRangyRect
  iframePosition: number[]
}

export type IContextMenuItem = {
  id: string | 'root'
  parent: string
  droppable: boolean
  text: string
  data: {
    editable: boolean
    type: 'group' | 'shortcuts'
    icon?: string
    searchText?: string
    actions?: ISetActionsType
    visibility?: IVisibilitySetting
  }
}
export type IContextMenuItemWithChildren = IContextMenuItem & {
  children: IContextMenuItemWithChildren[]
}
export type ISelection = {
  selectionText: string
  selectionHTML: string
  selectionRect: IRangyRect
  selectionInputAble: boolean
  activeElement: HTMLElement
  selectionElement?: ISelectionElement
}
