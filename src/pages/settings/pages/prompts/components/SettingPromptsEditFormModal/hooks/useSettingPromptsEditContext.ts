import { IContextMenuItem } from '@/features/contextMenu/types'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export type ISettingPromptsEditContextType = {
  node: IContextMenuItem
  editNode: IContextMenuItem
  editButtonKey?: IChromeExtensionButtonSettingKey | null
  selectedIcon?: IContextMenuIconKey
  setEditNode: Dispatch<SetStateAction<IContextMenuItem>>
  setSelectedIcon: Dispatch<SetStateAction<IContextMenuIconKey | undefined>>
  generateSaveActions: () => ISetActionsType
  generatePreviewActions: () => ISetActionsType
  onSave?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  onCancel?: () => void
}

const emptyNode = {
  id: 'root',
  parent: '',
  droppable: true,
  text: '',
  data: {
    editable: true,
    type: 'shortcuts',
  },
} as const

export const SettingPromptsEditContext = createContext<ISettingPromptsEditContextType>({
  node: emptyNode,
  editNode: emptyNode,
  setEditNode: () => {},
  setSelectedIcon: () => {},
  generateSaveActions: () => [],
  generatePreviewActions: () => [],
})

export const useSettingPromptsEditContext = () => useContext(SettingPromptsEditContext)
