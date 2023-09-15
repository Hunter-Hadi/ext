import React, { FC, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import defaultInputAssistantComposeNewContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantComposeNewContextMenuJson'
import defaultEditAssistantComposeReplyContextMenuJson from '@/background/defaultPromptsData/defaultEditAssistantComposeReplyContextMenuJson'
import defaultInputAssistantRefineDraftContextMenuJson from '@/background/defaultPromptsData/defaultInputAssistantRefineDraftContextMenuJson'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import groupBy from 'lodash-es/groupBy'
import forEach from 'lodash-es/forEach'
import {
  getBackendOptions,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview'
import ContextMenuPlaceholder from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuPlaceholder'
import { DndProvider } from 'react-dnd'

const promptsMap = {
  textSelectPopupButton: defaultContextMenuJson,
  inputAssistantComposeNewButton:
    defaultInputAssistantComposeNewContextMenuJson,
  inputAssistantComposeReplyButton:
    defaultEditAssistantComposeReplyContextMenuJson,
  inputAssistantRefineDraftButton:
    defaultInputAssistantRefineDraftContextMenuJson,
}
type PromptsMapKey = IChromeExtensionButtonSettingKey

const systemPrompts = [
  {
    label: 'textSelectPopup',
    value: 'textSelectPopupButton',
  },
  {
    label: 'ComposeNew',
    value: 'inputAssistantComposeNewButton',
  },
  {
    label: 'ComposeReply',
    value: 'inputAssistantComposeReplyButton',
  },
  {
    label: 'RefineDraft',
    value: 'inputAssistantRefineDraftButton',
  },
] as Array<{
  label: string
  value: PromptsMapKey
}>
const groupByContextMenuItem = (
  items: IContextMenuItem[],
): IContextMenuItemWithChildren[] => {
  const result: IContextMenuItemWithChildren[] = []
  const groups = groupBy(items, 'parent')
  const createChildren = (node: IContextMenuItemWithChildren) => {
    node.children = (groups[node.id] as IContextMenuItemWithChildren[]) || []
    if (node.children.length > 0) {
      forEach(node.children, createChildren)
    }
  }
  forEach(groups['root'], (node: any) => {
    createChildren(node as IContextMenuItemWithChildren)
    result.push(node as IContextMenuItemWithChildren)
  })
  return result
}
const isTreeNodeCanDrop = (treeData: any[], dragId: string, dropId: string) => {
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
  while (parentNode && parentNode.parentId !== 'root') {
    if (parentNode.id === dragId) {
      return false
    }
    parentNode = treeData.find((item) => item.id === parentNode.parentId)
  }
  return true
}
const SystemPromptEditor: FC = () => {
  const [editPrompt, setEditPrompt] =
    useState<IChromeExtensionButtonSettingKey>('textSelectPopupButton')
  const [listTreeData, setListTreeData] = useState<IContextMenuItem[]>([])
  const handleDrop = (tree: any[]) => {
    setListTreeData(tree)
  }
  useEffect(() => {
    setListTreeData(promptsMap[editPrompt])
  }, [editPrompt])
  return (
    <Stack spacing={2}>
      <Tabs
        value={editPrompt}
        onChange={(event, value) => {
          setEditPrompt(value)
        }}
      >
        {systemPrompts.map((prompt) => {
          return (
            <Tab label={prompt.label} value={prompt.value} key={prompt.value} />
          )
        })}
      </Tabs>
      <Stack direction={'row'}>
        <Stack width={400} flexShrink={0}>
          <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <Tree
              initialOpen={[]}
              tree={listTreeData}
              rootId={'root'}
              onDrop={handleDrop}
              sort={false}
              classes={{
                root: 'context-menu__root',
                placeholder: 'context-menu__placeholder',
                dropTarget: 'context-menu__drop-target',
              }}
              canDrag={(node) => !!node?.droppable}
              canDrop={(tree, { dragSource, dropTargetId }) => {
                if (!dragSource) return false
                if (dropTargetId === 'root') return true
                return isTreeNodeCanDrop(
                  tree,
                  String(dragSource.id),
                  String(dropTargetId),
                )
              }}
              dropTargetOffset={5}
              placeholderRender={(node, params) => (
                <ContextMenuPlaceholder node={node} depth={params.depth} />
              )}
              insertDroppableFirst={false}
              render={(node, params) => {
                return <span>{node.text}</span>
              }}
            />
          </DndProvider>
        </Stack>
      </Stack>
    </Stack>
  )
}
export default SystemPromptEditor
