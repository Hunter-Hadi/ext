import { ISetActionsType } from '@/features/shortcuts'
import { Box, Button, Paper, Stack } from '@mui/material'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Tree,
  getBackendOptions,
  MultiBackend,
} from '@minoru/react-dnd-treeview'
import { DndProvider } from 'react-dnd'
import ContextMenuItem from '@/pages/options/components/ContextMenuItem'
import { v4 } from 'uuid'
import ContextMenuEditFormModal from '@/pages/options/components/ContextMenuEditFormModal'
// import ContextMenuViewSource from '@/pages/options/components/ContextMenuViewSource'
import {
  getChromeExtensionContextMenu,
  IChromeExtensionSettingsKey,
  setChromeExtensionSettings,
} from '@/utils'
import { IContextMenuItem } from '@/features/contextMenu'
import ContextMenuPlaceholder from './components/ContextMenuPlaceholder'
import { EZMAIL_NEW_MAIL_GROUP_ID, EZMAIL_REPLY_GROUP_ID } from '@/types'
import ContextMenuViewSource from './components/ContextMenuViewSource'

const rootId = 'root'

const saveTreeData = async (
  key: IChromeExtensionSettingsKey,
  treeData: IContextMenuItem[],
) => {
  try {
    const success = await setChromeExtensionSettings({
      [key]: treeData,
    } as any)
    console.log(success)
  } catch (error) {
    console.log(error)
  }
}

const getDefaultActionWithTemplate = (
  settingsKey: IChromeExtensionSettingsKey,
  template: string,
  autoAskChatGPT: boolean,
) => {
  const actions: Record<IChromeExtensionSettingsKey, ISetActionsType> = {
    gmailToolBarContextMenu: [
      {
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template,
        },
      },
      {
        type: 'INSERT_USER_INPUT',
        parameters: {
          template: '{{LAST_ACTION_OUTPUT}}',
        },
      },
    ],
    contextMenus: [
      {
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template,
        },
      },
      {
        type: 'ASK_CHATGPT',
        parameters: {},
      },
    ],
  }

  const currentActions = actions[settingsKey]
  if (settingsKey === 'gmailToolBarContextMenu' && autoAskChatGPT) {
    currentActions.push({
      type: 'ASK_CHATGPT',
      parameters: {
        template: '{{LAST_ACTION_OUTPUT}}',
      },
    })
  }
  return currentActions
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
  while (parentNode && parentNode.parentId !== rootId) {
    if (parentNode.id === dragId) {
      return false
    }
    parentNode = treeData.find((item) => item.id === parentNode.parentId)
  }
  return true
}

const ContextMenuSettings: FC<{
  iconSetting?: boolean
  settingsKey: IChromeExtensionSettingsKey
  menuType?: 'reply' | 'new-email'
  defaultContextMenuJson: IContextMenuItem[]
}> = (props) => {
  const {
    settingsKey,
    defaultContextMenuJson,
    iconSetting = false,
    menuType,
  } = props
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [treeData, setTreeData] = useState<IContextMenuItem[]>([])
  const editNode = useMemo(() => {
    return treeData.find((item) => item.id === editId) || null
  }, [treeData, editId])
  const handleDrop = async (newTreeData: any[]) => {
    setTreeData(newTreeData)
  }
  const addNewMenuItem = async () => {
    const newEditId = v4()
    setTreeData((prev) =>
      prev.concat({
        id: newEditId,
        parent: rootId,
        droppable: true,
        text: 'New option item',
        data: {
          editable: true,
          type: 'shortcuts',
          actions: [],
        },
      }),
    )
    setEditId(newEditId)
  }

  const handleOnSave = useCallback(
    (newNode: IContextMenuItem, template: string, autoAskChatGPT: boolean) => {
      if (newNode.data.type === 'group') {
        updateMenuItem(newNode)
      } else {
        updateMenuItem({
          ...newNode,
          data: {
            ...newNode.data,
            actions: getDefaultActionWithTemplate(
              settingsKey,
              template,
              autoAskChatGPT,
            ),
          },
        })
      }
      setEditId(null)
    },
    [settingsKey],
  )

  const updateMenuItem = (newNode: IContextMenuItem) => {
    setTreeData((prev) =>
      prev.map((item) => {
        if (item.id === newNode.id) {
          return newNode
        }
        return item
      }),
    )
  }
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const menuList = await getChromeExtensionContextMenu(settingsKey)
      if (isDestroy) return
      if (settingsKey === 'gmailToolBarContextMenu') {
        // in ezmail diff reply group and new email group
        if (menuType === 'reply') {
          setTreeData(
            menuList.filter((item) => item.id !== EZMAIL_NEW_MAIL_GROUP_ID),
          )
        } else {
          setTreeData(
            menuList.filter((item) => item.id !== EZMAIL_REPLY_GROUP_ID),
          )
        }
      } else {
        setTreeData(menuList)
      }

      // setTreeData(defaultContextMenuJson)
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [])
  useEffect(() => {
    saveTreeData(settingsKey, treeData)
  }, [treeData])
  return (
    <Stack gap={3}>
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Box
          height={690}
          p={2}
          width={'50%'}
          flexShrink={0}
          overflow={'auto'}
          position={'relative'}
        >
          <Stack>
            <ContextMenuViewSource treeData={treeData} />
          </Stack>
          <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <Tree
              tree={treeData}
              rootId={'root'}
              onDrop={handleDrop}
              sort={false}
              classes={{
                placeholder: 'context-menu--placeholder',
              }}
              canDrag={(node) => !!node?.droppable}
              canDrop={(tree, { dragSource, dropTargetId }) => {
                if (!dragSource) return false
                return isTreeNodeCanDrop(
                  tree,
                  String(dragSource.id),
                  String(dropTargetId),
                )
              }}
              dropTargetOffset={10}
              placeholderRender={(node, params) => (
                <ContextMenuPlaceholder node={node} depth={params.depth} />
              )}
              insertDroppableFirst={false}
              render={(node, params) => (
                <ContextMenuItem
                  isActive={editId === node.id}
                  onEdit={setEditId}
                  onDelete={(id) => {
                    setTreeData((prev) => {
                      const newTree = prev.filter((item) => item.id !== id)
                      return newTree
                    })
                  }}
                  node={node as any}
                  params={params}
                />
              )}
            />
          </DndProvider>
        </Box>
      </Paper>
      {editNode && (
        <ContextMenuEditFormModal
          open={!!editNode}
          iconSetting={iconSetting}
          settingsKey={settingsKey}
          onSave={handleOnSave}
          onCancel={() => setEditId(null)}
          node={editNode}
        />
      )}

      <Stack direction={'row'} alignItems={'center'} mb={2} spacing={2}>
        <Button
          disableElevation
          variant={'contained'}
          onClick={addNewMenuItem}
          disabled={loading}
        >
          Add new option
        </Button>
        <Button
          disableElevation
          variant={'outlined'}
          disabled={loading}
          onClick={async () => {
            try {
              setLoading(true)
              setTreeData(defaultContextMenuJson || [])
            } catch (error) {
              console.log(error)
            } finally {
              setLoading(false)
            }
          }}
        >
          Reset options
        </Button>
      </Stack>
    </Stack>
  )
}
export default ContextMenuSettings
