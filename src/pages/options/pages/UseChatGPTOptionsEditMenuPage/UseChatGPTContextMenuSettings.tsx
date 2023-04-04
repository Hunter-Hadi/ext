import { Box, Button, Stack, Typography } from '@mui/material'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
  IChromeExtensionSettingsContextMenuKey,
  setChromeExtensionSettings,
} from '@/utils'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu'
import ContextMenuPlaceholder from '@/pages/options/components/ContextMenuPlaceholder'
import ContextMenuViewSource from '@/pages/options/components/ContextMenuViewSource'
import ContextMenuActionConfirmModal, {
  IConfirmActionType,
} from '@/pages/options/components/ContextMenuActionConfirmModal'
import { getDefaultActionWithTemplate } from '@/features/shortcuts/utils'
import ContextMenuMockTextarea from '@/pages/options/components/ContextMenuMockTextarea'
import DevContent from '@/components/DevContent'
import { fuzzySearchContextMenuList } from '@/features/contextMenu/utils'
import AddIcon from '@mui/icons-material/Add'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import groupBy from 'lodash-es/groupBy'
import cloneDeep from 'lodash-es/cloneDeep'
import CloseAlert from '@/components/CloseAlert'

const rootId = 'root'

const saveTreeData = async (
  key: IChromeExtensionSettingsContextMenuKey,
  treeData: IContextMenuItem[],
) => {
  try {
    console.log('saveTreeData', key, treeData)
    const success = await setChromeExtensionSettings({
      [key]: treeData,
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
  settingsKey: IChromeExtensionSettingsContextMenuKey
  defaultContextMenuJson: IContextMenuItem[]
}> = (props) => {
  const { settingsKey, defaultContextMenuJson, iconSetting = false } = props
  const [loading, setLoading] = useState(false)
  const originalTreeMapRef = useRef<{ [key: string]: IContextMenuItem }>({})
  const [editNode, setEditNode] = useState<IContextMenuItem | null>(null)
  const [originalTreeData, setOriginalTreeData] = useState<IContextMenuItem[]>(
    [],
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmType, setconfirmType] = useState<IConfirmActionType | null>(
    null,
  )
  const [inputValue, setInputValue] = useState<string>('')
  const [openIds, setOpenIds] = useState<string[]>([])
  const currentOpenIds = useMemo(() => {
    // 恒定展开全部
    console.log(openIds)
    return originalTreeData
      .filter((item) => item.data.type === 'group')
      .map((item) => item.id)
    //
    // if (openIds.length) {
    //   return openIds
    // } else {
    //   return treeData
    //     .filter((item) => item.data.type === 'group')
    //     .map((item) => item.id)
    // }
  }, [originalTreeData])
  const defaultTreeDataRef = useRef<null | IContextMenuItem[]>(null)
  const handleDrop = async (newTreeData: any[], dragDetail: any) => {
    setOriginalTreeData(newTreeData)
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
      setEditNode(null)
    },
    [settingsKey],
  )

  const updateMenuItem = (newNode: IContextMenuItem) => {
    setOriginalTreeData((prev) => {
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
    const groupByParentMap = groupBy(cloneDeep(originalTreeData), 'parent')
    const deepDeleteIds: string[] = []
    const deepFindChild = (parentId: string) => {
      deepDeleteIds.push(parentId)
      if (groupByParentMap[parentId]) {
        groupByParentMap[parentId].forEach((item) =>
          deepFindChild(item.id as string),
        )
      }
    }
    deepFindChild(id)
    setOriginalTreeData((prev) => {
      const newTree = prev.filter((item) => !deepDeleteIds.includes(item.id))
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
        setOriginalTreeData(defaultContextMenuJson || [])
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (type === 'delete' && confirmId) {
      deleteMenuItemById(confirmId)
      setEditNode(null)
    }
    setConfirmOpen(false)
    setconfirmType(null)
  }

  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const menuList = await getChromeExtensionContextMenu(settingsKey)
      if (isDestroy) return
      setOriginalTreeData(menuList)
      defaultTreeDataRef.current = menuList
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [settingsKey])

  useEffect(() => {
    const searchTextMap: {
      [key: string]: string
    } = {}
    originalTreeMapRef.current = {}
    const findSearchText = (parent: string) => {
      const children = originalTreeData.filter((item) => item.parent === parent)
      if (children.length === 0) {
        return
      }
      children.forEach((item) => {
        const prefixText = searchTextMap[item.parent]
          ? `${searchTextMap[item.parent]} `
          : ''
        // 只拼接一层
        searchTextMap[item.id] = `${item.text}`.toLowerCase()
        item.data.searchText = prefixText + searchTextMap[item.id].toLowerCase()
        originalTreeMapRef.current[item.id] = item
        findSearchText(item.id)
      })
    }
    findSearchText(rootId)
    if (originalTreeData.length > 0) {
      saveTreeData(settingsKey, originalTreeData)
    }
  }, [originalTreeData])
  const filteredTreeData = useMemo(() => {
    if (!inputValue) {
      return originalTreeData
    }
    const result = fuzzySearchContextMenuList(originalTreeData, inputValue)
    const showIds: string[] = []
    // 返回的结果不一定到root了，需要一直找到root
    const findUntilRoot = (id: string) => {
      const item = originalTreeMapRef.current[id]
      if (item) {
        showIds.push(item.id)
        findUntilRoot(item.parent)
      }
    }
    result.forEach((item) => findUntilRoot(item.id))
    console.log(showIds, originalTreeMapRef.current)
    const deepFindId = (item: IContextMenuItemWithChildren) => {
      showIds.push(item.id)
      if (item.children && item.children.length > 0) {
        item.children.forEach(deepFindId)
      }
    }
    result.forEach(deepFindId)
    return originalTreeData.filter((item) => showIds.includes(item.id))
  }, [originalTreeData, inputValue])
  useEffect(() => {
    const hash = window.location.hash
    const timer = setTimeout(() => {
      document.getElementById(hash.replace('#', ''))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  return (
    <Stack spacing={3} height={'100%'} mb={4}>
      <Stack
        height={0}
        flex={1}
        // sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}
      >
        <Stack height={'100%'}>
          <DevContent>
            <Stack>
              <ContextMenuViewSource treeData={originalTreeData} />
            </Stack>
          </DevContent>
          <Typography
            fontSize={20}
            fontWeight={700}
            flexShrink={0}
            id={'edit-menu-options'}
          >
            Edit menu options
          </Typography>
          <CloseAlert
            icon={<></>}
            sx={{
              // bgcolor: '#E2E8F0',
              mt: 1,
              mb: 2,
            }}
          >
            <Stack
              sx={{
                b: {
                  fontSize: 16,
                  display: 'inline-flex',
                  minWidth: '28px',
                  justifyContent: 'center',
                  paddingRight: 1,
                },
              }}
              flexShrink={0}
            >
              <Typography fontSize={14} color={'text.primary'}>
                {`You can:`}
              </Typography>
              <Typography fontSize={14} color={'text.primary'}>
                <b>· </b>
                {`Add new options with your own prompt templates.`}
              </Typography>
              <Typography fontSize={14} color={'text.primary'}>
                <b>· </b>
                {`Create your own option groups for nested options.`}
              </Typography>
              <Typography fontSize={14} color={'text.primary'}>
                <b>· </b>
                {`Modify your own option's name, icon, and prompt template.`}
              </Typography>
              <Typography fontSize={14} color={'text.primary'}>
                <b>· </b>
                {`Drag your own options to reposition them.`}
              </Typography>
              <Typography fontSize={14} color={'text.primary'}>
                <b>📌 </b>
                {`Please note that the options marked as "Read only" cannot be edited or moved.`}
              </Typography>
            </Stack>
          </CloseAlert>
          <ContextMenuMockTextarea
            defaultValue={inputValue}
            onChange={setInputValue}
          />
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
                '-webkit-appearance': 'none',
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
            }}
          >
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
              <Tree
                onChangeOpen={(newOpenIds) => {
                  console.log('newOpenIds', newOpenIds)
                  setOpenIds(newOpenIds as string[])
                }}
                initialOpen={currentOpenIds}
                tree={filteredTreeData}
                rootId={rootId}
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
                  if (dropTargetId === rootId) return true
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
                render={(node, params) => (
                  <ContextMenuItem
                    isDropTarget={params.isDropTarget}
                    isActive={editNode?.id === node.id}
                    onEdit={setEditNode}
                    onDelete={(id) => handleActionConfirmOpen('delete', id)}
                    node={node as any}
                    params={params}
                    disabledDrag={inputValue !== ''}
                  />
                )}
              />
            </DndProvider>
          </Box>
        </Stack>
      </Stack>
      {editNode && (
        <ContextMenuEditFormModal
          open={!!editNode}
          iconSetting={iconSetting}
          settingsKey={settingsKey}
          onSave={handleOnSave}
          onCancel={() => setEditNode(null)}
          onDelete={(id) => {
            handleActionConfirmOpen('delete', id)
          }}
          node={editNode}
        />
      )}
      {confirmOpen && confirmType && (
        <ContextMenuActionConfirmModal
          open={confirmOpen}
          actionType={confirmType}
          onClose={handleActionConfirmClose}
          onConfirm={handleActionConfirmOnConfirm}
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
          Restore defaults
        </Button>
      </Stack>
    </Stack>
  )
}
export default ContextMenuSettings
