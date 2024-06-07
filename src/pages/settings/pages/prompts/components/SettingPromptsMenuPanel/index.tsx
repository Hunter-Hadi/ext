import {
  getBackendOptions,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview'
import Box from '@mui/material/Box'
import { type SxProps } from '@mui/material/styles'
import React, { type FC, memo } from 'react'
import { DndProvider } from 'react-dnd'

import { setChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import { type IChromeExtensionButtonSettingKey } from '@/background/utils/chromeExtensionStorage/type'
import { type IContextMenuItem } from '@/features/contextMenu/types'
import { PropsType } from '@/types'

import MenuDropDestinationPlaceholder from './components/MenuDropDestinationPlaceholder'
import SettingPromptsMenuItem from './components/SettingPromptsMenuItem'

type TreeProps = PropsType<typeof Tree>

interface ISettingPromptsMenuPanelProps {
  rootId: string
  initialOpen?: TreeProps['initialOpen']
  treeData: IContextMenuItem[]
  onChangeOpen: TreeProps['onChangeOpen']
  onDrop: TreeProps['onDrop']

  editNode: IContextMenuItem | null
  onEditNode: (node: IContextMenuItem) => any
  onDeleteNode: (nodeId: string) => any
  disabledDrag?: boolean
  sx?: SxProps
}

export const rootId = 'root'
/**
 * 用来在my own prompts渲染的虚拟节点，让用户设置preset prompt的位置
 */
export const PRESET_PROMPT_ID = 'PRESET_PROMPT_ID'
export const PRESET_PROMPT: [IContextMenuItem] = [
  {
    text: 'Preset prompts',
    id: PRESET_PROMPT_ID,
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
    },
  },
]

export const saveTreeData = async (
  key: IChromeExtensionButtonSettingKey,
  treeData: IContextMenuItem[],
) => {
  try {
    console.log('saveTreeData', key, treeData)
    const success = await setChromeExtensionDBStorage((settings) => {
      const newSettings = {
        ...settings,
        buttonSettings: {
          ...settings.buttonSettings,
          [key]: {
            ...settings.buttonSettings?.[key],
            contextMenu: treeData,
          },
        },
      } as any
      return newSettings
    })
    console.log(success)
  } catch (error) {
    console.log(error)
  }
}

const isTreeNodeCanDrop = (
  treeData: any[],
  dragId: string,
  dropId: string,
  rootId: string,
) => {
  if (dragId === dropId) {
    return false
  }
  const dropNode = treeData.find((item) => item.id === dropId)
  if (!dropNode) {
    return false
  }
  if (dropNode?.data?.type !== 'group') {
    return false
  }
  let parentNode = treeData.find((item) => item.id === dropNode.parent)
  while (parentNode && parentNode.parentId !== rootId) {
    if (parentNode.id === dragId) {
      return false
    }
    parentNode = treeData.find((item) => item.id === parentNode.parentId)
  }
  return true
}

const SettingPromptsMenuPanel: FC<ISettingPromptsMenuPanelProps> = ({
  rootId,
  initialOpen,
  treeData,
  onChangeOpen,
  onDrop,
  editNode,
  onEditNode,
  onDeleteNode,
  disabledDrag = false,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        p: 0.5,
        outline: 'none!important',
        width: 400,
        minHeight: 600,
        maxHeight: 600,
        boxSizing: 'border-box',
        overflowY: 'scroll',
        border: '1px solid',
        borderColor: 'customColor.borderColor',
        bgcolor: 'background.paper',
        borderRadius: '6px',
        boxShadow:
          'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
        // '& *': {
        //   outline: 'none!important',
        // },
        '&::-webkit-scrollbar': {
          webkitAppearance: 'none',
          width: '7px',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, .5)',
          boxShadow: '0 0 1px rgba(255, 255, 255, .5)',
        },
        li: {
          '&:has(> .dragTarget)': {
            outline: (t) =>
              t.palette.mode === 'dark'
                ? `3px solid rgb(216 167 255 / 45%)`
                : '3px solid rgba(118, 1, 211, 0.1)',
            borderRadius: '4px',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgb(115 61 158 / 10%)'
                : 'rgba(118, 1, 211, 0.04)',
          },
        },
        '.context-menu__root': {
          py: 1,
        },
        ...sx,
      }}
    >
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Tree
          onChangeOpen={onChangeOpen}
          initialOpen={initialOpen}
          tree={treeData}
          rootId={rootId}
          onDrop={onDrop}
          sort={false}
          classes={{
            root: 'context-menu__root',
            placeholder: 'context-menu__placeholder',
            dropTarget: 'context-menu__drop-target',
          }}
          canDrag={(node) => !!node?.droppable}
          canDrop={(tree, { dragSource, dropTargetId }) => {
            if (!dragSource) return false
            if (dropTargetId === rootId) return true
            return isTreeNodeCanDrop(
              tree,
              String(dragSource.id),
              String(dropTargetId),
              rootId,
            )
          }}
          dropTargetOffset={5}
          placeholderRender={(node, params) => (
            <MenuDropDestinationPlaceholder node={node} depth={params.depth} />
          )}
          insertDroppableFirst={false}
          render={(node, params) => (
            <SettingPromptsMenuItem
              isDropTarget={params.isDropTarget}
              isActive={editNode?.id === node.id}
              onEdit={onEditNode}
              onDelete={onDeleteNode}
              node={node as any}
              params={params}
              disabledDrag={disabledDrag}
            />
          )}
        />
      </DndProvider>
    </Box>
  )
}

export default memo(SettingPromptsMenuPanel)
