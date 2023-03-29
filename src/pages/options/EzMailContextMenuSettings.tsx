import { Box, Button, Paper, Stack } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import React, { FC, useCallback, useEffect, useState } from 'react'
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
  // filteredTypeGmailToolBarContextMenu,
  IChromeExtensionSettingsContextMenuKey,
  setChromeExtensionSettings,
} from '@/utils'
import { IContextMenuItem } from '@/features/contextMenu'
import ContextMenuPlaceholder from './components/ContextMenuPlaceholder'
// import {
//   EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
//   EZMAIL_REPLY_CTA_BUTTON_ID,
// } from '@/types'
import ContextMenuViewSource from './components/ContextMenuViewSource'
// import { IInboxMessageType } from '@/features/gmail'
import ContextMenuActionConfirmModal, {
  IConfirmActionType,
} from './components/ContextMenuActionConfirmModal'
import { getDefaultActionWithTemplate } from '@/features/shortcuts/utils'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'

const rootId = 'root'

const saveTreeData = async (
  key: IChromeExtensionSettingsContextMenuKey,
  treeData: IContextMenuItem[],
) => {
  try {
    console.log('saveTreeData', key, treeData)
    let newTreeData = [...treeData]
    // overlary cache tree data by default json
    if (key === 'gmailToolBarContextMenu') {
      newTreeData = treeData.map((item) => {
        const defaultItem = defaultGmailToolbarContextMenuJson.find(
          (defaultItem) => defaultItem.id === item.id,
        )
        if (defaultItem && defaultItem.data.editable === false) {
          return defaultItem
        }
        return item
      })
    }
    const success = await setChromeExtensionSettings({
      [key]: newTreeData,
    } as any)
    console.log(success)
  } catch (error) {
    console.log(error)
  }
}

const isTreeNodeCanDrop = (treeData: any[], dragId: string, dropId: string) => {
  if (dragId === dropId) {
    return false
  }

  if (dropId === rootId) {
    return true
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

// const getTreeDataFilteredByMenuType = (
//   menuType: IInboxMessageType,
//   sourceTreeData?: IContextMenuItem[],
// ) => {
//   let filterdList = filteredTypeGmailToolBarContextMenu(
//     menuType,
//     false,
//     sourceTreeData || defaultGmailToolbarContextMenuJson,
//   )
//   if (menuType === 'reply') {
//     filterdList = filterdList.filter(
//       (item) => item.id !== EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
//     )
//   } else {
//     filterdList = filterdList.filter(
//       (item) => item.id !== EZMAIL_REPLY_CTA_BUTTON_ID,
//     )
//   }
//   return filterdList
// }

const ContextMenuSettings: FC<{
  iconSetting?: boolean
  settingsKey: IChromeExtensionSettingsContextMenuKey
  // menuType: IInboxMessageType
  defaultContextMenuJson: IContextMenuItem[]
}> = (props) => {
  const {
    settingsKey,
    defaultContextMenuJson,
    iconSetting = false,
    // menuType,
  } = props
  const [loading, setLoading] = useState(false)
  const [editNode, setEditNode] = useState<IContextMenuItem | null>(null)
  const [treeData, setTreeData] = useState<IContextMenuItem[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmType, setconfirmType] = useState<IConfirmActionType | null>(
    null,
  )
  const handleDrop = async (newTreeData: any[]) => {
    setTreeData(newTreeData)
  }
  const addNewMenuItem = async () => {
    const newEditId = v4()
    setEditNode({
      id: newEditId,
      parent: rootId,
      droppable: true,
      text: '',
      data: {
        editable: true,
        type: 'shortcuts',
        actions: [],
      },
    })
  }
  const addNewMenuGroup = async () => {
    const newEditId = v4()
    // setTreeData((prev) =>
    //   prev.concat(),
    // )
    setEditNode({
      id: newEditId,
      parent: rootId,
      droppable: true,
      text: '',
      data: {
        editable: true,
        type: 'group',
        actions: [],
      },
    })
  }

  const handleOnSave = useCallback(
    (newNode: IContextMenuItem, template: string, autoAskChatGPT: boolean) => {
      if (newNode.data.type === 'group') {
        updateMenuItem({
          ...newNode,
          text: newNode.text ? newNode.text : 'New group',
        })
      } else {
        updateMenuItem({
          ...newNode,
          text: newNode.text ? newNode.text : 'New option',
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
      setEditNode(null)
    },
    [settingsKey],
  )

  const updateMenuItem = (newNode: IContextMenuItem) => {
    setTreeData((prev) => {
      let hasId = false
      const newTreeData = prev.map((item) => {
        if (item.id === newNode.id) {
          hasId = true
          return newNode
        }
        return item
      })

      if (!hasId) {
        newTreeData.push(newNode)
      }
      return newTreeData
    })
  }

  const deleteMenuItemById = (id: string) => {
    const findDeleteIds = (data: IContextMenuItem[], id: string): string[] => {
      return data.reduce<string[]>(
        (acc, item) =>
          item.parent === id
            ? [...acc, item.id, ...findDeleteIds(data, item.id)]
            : acc,
        [],
      )
    }

    setTreeData((prev) => {
      const deleteIds = findDeleteIds(treeData, id).concat([id])
      const newTree = prev.filter((item) => !deleteIds.includes(item.id))
      return newTree
    })
  }

  const handleActionConfirmOpen = (type: IConfirmActionType, id?: string) => {
    setconfirmType(type)
    if (id) {
      setConfirmId(id)
    }
    setConfirmOpen(true)
  }
  const handleActionConfirmClose = () => {
    setConfirmOpen(false)
    setconfirmType(null)
  }

  const handleActionConfirmOnConfirm = (type: IConfirmActionType) => {
    if (type === 'reset') {
      try {
        setLoading(true)
        setTreeData(defaultContextMenuJson || [])
        // treeDataFilterByMenuType()
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (type === 'delete' && confirmId) {
      deleteMenuItemById(confirmId)
    }
    setConfirmOpen(false)
    setconfirmType(null)
  }

  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const menuList = await getChromeExtensionContextMenu(settingsKey)
      if (isDestroy) return
      setTreeData(menuList)
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [settingsKey])

  // const treeDataFilterByMenuType = useMemo(
  //   () => getTreeDataFilteredByMenuType(menuType, treeData),
  //   [treeData, menuType],
  // )

  useEffect(() => {
    saveTreeData(settingsKey, treeData)
  }, [treeData])
  return (
    <Stack gap={3}>
      <Paper elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Box
          height={640}
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
                  isActive={editNode?.id === node.id}
                  onEdit={setEditNode}
                  onDelete={(id) => handleActionConfirmOpen('delete', id)}
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
          onCancel={() => setEditNode(null)}
          onDelete={(id) => handleActionConfirmOpen('delete', id)}
          node={editNode}
        />
      )}

      <Stack direction={'row'} alignItems={'center'} mb={2} spacing={2}>
        <Button
          disableElevation
          variant={'contained'}
          onClick={addNewMenuItem}
          disabled={loading}
          startIcon={<AddIcon />}
        >
          New option
        </Button>
        <Button
          disableElevation
          variant={'contained'}
          onClick={addNewMenuGroup}
          disabled={loading}
          startIcon={<AddIcon />}
        >
          New option group
        </Button>
        <Button
          disableElevation
          variant={'outlined'}
          disabled={loading}
          onClick={() => handleActionConfirmOpen('reset')}
          startIcon={<RestartAltIcon />}
        >
          Reset options
        </Button>
      </Stack>

      {confirmOpen && confirmType && (
        <ContextMenuActionConfirmModal
          open={confirmOpen}
          nodeType={editNode?.data.type}
          actionType={confirmType}
          onClose={handleActionConfirmClose}
          onConfirm={handleActionConfirmOnConfirm}
        />
      )}
    </Stack>
  )
}
export default ContextMenuSettings
