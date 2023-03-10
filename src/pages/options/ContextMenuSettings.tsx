import { Box, Button, Paper, Stack } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'
import {
  Tree,
  getBackendOptions,
  MultiBackend,
} from '@minoru/react-dnd-treeview'
import { DndProvider } from 'react-dnd'
import ContextMenuItem from '@/pages/options/components/ContextMenuItem'
import { v4 } from 'uuid'
import ContextMenuEditForm from '@/pages/options/components/ContextMenuEditForm'
import ContextMenuViewSource from '@/pages/options/components/ContextMenuViewSource'
import {
  getEzMailChromeExtensionSettings,
  IEzMailChromeExtensionSettingsKey,
  setEzMailChromeExtensionSettings,
} from '@/utils'
import { IContextMenuItem } from '@/features/contextMenu'
import ContextMenuPlaceholder from './components/ContextMenuPlaceholder'
const rootId = 'root'

const saveTreeData = async (
  key: IEzMailChromeExtensionSettingsKey,
  treeData: IContextMenuItem[],
) => {
  try {
    const success = await setEzMailChromeExtensionSettings({
      [key]: treeData,
    } as any)
    console.log(success)
  } catch (error) {
    console.log(error)
  }
}
const ContextMenuSettings: FC<{
  settingsKey: IEzMailChromeExtensionSettingsKey
  defaultContextMenuJson: IContextMenuItem[]
}> = (props) => {
  const { settingsKey, defaultContextMenuJson } = props
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
      const settings = await getEzMailChromeExtensionSettings()
      if (isDestroy) return
      console.log(settings)
      console.log(defaultContextMenuJson)
      if (settings[settingsKey] && (settings[settingsKey] || []).length > 0) {
        setTreeData(settings[settingsKey] as IContextMenuItem[])
        return
      }
      setTreeData(defaultContextMenuJson)
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
    <Paper>
      <Stack direction={'row'} alignItems={'center'}>
        <Box
          height={800}
          p={2}
          width={'50%'}
          flexShrink={0}
          overflow={'auto'}
          position={'relative'}
        >
          <Stack direction={'row'} alignItems={'center'} mb={2} spacing={2}>
            <Button
              disableElevation
              variant={'contained'}
              onClick={addNewMenuItem}
              disabled={loading}
            >
              Add new option
            </Button>
            {/*<Button*/}
            {/*  variant={'outlined'}*/}
            {/*  disabled={loading}*/}
            {/*  onClick={async () => {*/}
            {/*    try {*/}
            {/*      setLoading(true)*/}
            {/*      const success = await setEzMailChromeExtensionSettings({*/}
            {/*        contextMenus: treeData,*/}
            {/*      })*/}
            {/*      console.log(success)*/}
            {/*    } catch (error) {*/}
            {/*      console.log(error)*/}
            {/*    } finally {*/}
            {/*      setLoading(false)*/}
            {/*    }*/}
            {/*  }}*/}
            {/*>*/}
            {/*  Save Settings*/}
            {/*</Button>*/}
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
                placeholder: 'ezmail-ai-context-menu--placeholder',
              }}
              canDrop={(tree, { dragSource, dropTargetId }) => {
                return (
                  tree.find((item) => item.id === dropTargetId)?.data?.type ===
                  'group'
                )
              }}
              dropTargetOffset={10}
              placeholderRender={(node, params) => (
                <ContextMenuPlaceholder node={node} depth={params.depth} />
              )}
              insertDroppableFirst={false}
              render={(node, params) => (
                <ContextMenuItem
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
        <Stack borderLeft={1} flex={1} width={0} height={800}>
          {editNode && (
            <ContextMenuEditForm
              settingsKey={settingsKey}
              onSave={async (newNode) => {
                updateMenuItem(newNode)
                setEditId(null)
              }}
              onCancel={() => setEditId(null)}
              node={editNode}
            />
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
export default ContextMenuSettings
