import {createContext, Dispatch, SetStateAction, useContext} from 'react'

import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'

export type SettingPromptsContextType = {
  editNode?: IContextMenuItem
  selectedIcon?: IContextMenuIconKey
  setEditNode:  Dispatch<SetStateAction<IContextMenuItem>>
  setSelectedIcon:  Dispatch<SetStateAction<IContextMenuIconKey | undefined>>
}

export const SettingPromptsContext = createContext<SettingPromptsContextType>(
  {
    setEditNode: () => {},
    setSelectedIcon: () => {}
  },
)

export const useSettingPromptsContext = () => useContext(SettingPromptsContext)
