import { createContext, Dispatch, SetStateAction, useContext } from 'react'

import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'

export type ISettingPromptsEditContextType = {
  node: IContextMenuItem
  editNode: IContextMenuItem
  errors?: Record<string, boolean>
  editButtonKey?: IChromeExtensionButtonSettingKey | null
  selectedIcon?: IContextMenuIconKey
  setEditNode: Dispatch<SetStateAction<IContextMenuItem>>
  setSelectedIcon: Dispatch<SetStateAction<IContextMenuIconKey | undefined>>
  setErrors: Dispatch<SetStateAction<Record<string, boolean>>>
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

export const SettingPromptsEditContext =
  createContext<ISettingPromptsEditContextType>({
    node: emptyNode,
    editNode: emptyNode,
    setEditNode: () => {},
    setSelectedIcon: () => {},
    setErrors: () => {},
  })

export const useSettingPromptsEditContext = () =>
  useContext(SettingPromptsEditContext)
