import { cloneDeep } from 'lodash-es'
import React, { FC, useEffect, useState } from 'react'
import { createContext, Dispatch, SetStateAction, useContext } from 'react'

import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'

export type SettingPromptsContextType = {
  node: IContextMenuItem
  editNode: IContextMenuItem
  selectedIcon?: IContextMenuIconKey
  setEditNode: Dispatch<SetStateAction<IContextMenuItem>>
  setSelectedIcon: Dispatch<SetStateAction<IContextMenuIconKey | undefined>>
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

export const SettingPromptsContext = createContext<SettingPromptsContextType>({
  node: emptyNode,
  editNode: emptyNode,
  setEditNode: () => {},
  setSelectedIcon: () => {},
})

export const useSettingPromptsContext = () => useContext(SettingPromptsContext)

const SettingPromptsContextProvider: FC<{
  node: IContextMenuItem
  onSave?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  onCancel?: () => void
  children: React.ReactNode
}> = ({ node, onSave, onDelete, onCancel, children }) => {
  const { setActions } = useShortcutEditorActions()

  const [editNode, setEditNode] = useState(cloneDeep(node))
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey>()

  useEffect(() => {
    const cloneNode: IContextMenuItem = cloneDeep(node)
    // 兼容旧版本，设置默认值
    if (!cloneNode.data.visibility) {
      cloneNode.data.visibility = {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      }
    }
    setEditNode(cloneNode)
    setSelectedIcon(cloneNode.data?.icon as any)
    setActions(node.data.actions || [])
  }, [node])

  return (
    <SettingPromptsContext.Provider
      value={{
        node,
        editNode,
        selectedIcon,
        setEditNode,
        setSelectedIcon,
        onSave,
        onDelete,
        onCancel,
      }}
    >
      {children}
    </SettingPromptsContext.Provider>
  )
}
export default SettingPromptsContextProvider
