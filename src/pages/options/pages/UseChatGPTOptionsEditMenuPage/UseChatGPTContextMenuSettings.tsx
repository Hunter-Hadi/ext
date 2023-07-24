import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
// import ContextMenuViewSource from '@/pages/options/components/ContextMenuViewSource'
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
import {
  getChromeExtensionButtonContextMenu,
  setChromeExtensionSettings,
} from '@/background/utils'
import BulletList from '@/components/BulletList'
import ContextMenuEditFormModal from '@/pages/options/components/ContextMenuEditFormModal'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'

const rootId = 'root'

const saveTreeData = async (
  key: IChromeExtensionButtonSettingKey,
  treeData: IContextMenuItem[],
) => {
  try {
    console.log('saveTreeData', key, treeData)
    const success = await setChromeExtensionSettings((settings) => {
      return {
        ...settings,
        buttonSettings: {
          ...settings.buttonSettings,
          [key]: {
            ...settings.buttonSettings?.[key],
            contextMenu: treeData,
          },
        },
      } as any
    })
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
  buttonKey: IChromeExtensionButtonSettingKey
  defaultContextMenuJson: IContextMenuItem[]
  onUpdated?: () => void
}> = (props) => {
  const {
    buttonKey,
    defaultContextMenuJson,
    iconSetting = false,
    onUpdated,
  } = props
  const once = useRef(true)
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
  const memoAllGroupIds = useMemo(() => {
    return originalTreeData
      .filter((item) => item.data.type === 'group')
      .map((item) => item.id)
  }, [originalTreeData])
  useEffect(() => {
    // NOTE: 2023-05-05之前: 恒定展开全部
    if (openIds.length === 0) {
      // 展开第一层组
      const firstDeepGroupIds = originalTreeData
        .filter((item) => item.data.type === 'group' && item.parent === rootId)
        .map((item) => item.id)
      if (firstDeepGroupIds.length > 0) {
        setOpenIds(firstDeepGroupIds)
      }
    }
    return () => {
      // do nothing
    }
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
        visibility: {
          whitelist: [],
          blacklist: [],
          isWhitelistMode: false,
        },
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
              buttonKey,
              template,
              autoAskChatGPT,
            ),
          },
        })
      }
      setEditNode(null)
    },
    [buttonKey],
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
      const contextMenu = await getChromeExtensionButtonContextMenu(buttonKey)
      if (isDestroy) return
      setOriginalTreeData(contextMenu)
      defaultTreeDataRef.current = contextMenu
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [buttonKey])

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
      saveTreeData(buttonKey, originalTreeData).then(() => {
        console.log('saveTreeData success')
        if (once.current) {
          once.current = false
          return
        }
        onUpdated && onUpdated()
      })
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
            component={'h2'}
            id={'my-own-prompts'}
          >
            My own prompts
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
              <BulletList
                textProps={{
                  fontSize: 14,
                  color: 'text.primary',
                }}
                pointProps={{
                  mr: 2,
                }}
                textList={[
                  'Add new options with your own prompt templates.',
                  'Create your own option groups for nested options.',
                  'Modify your own option’s name, icon, and prompt template.',
                  'Drag your own options to reposition them.',
                ]}
              />
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
            }}
          >
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
              <Tree
                onChangeOpen={(newOpenIds) => {
                  if (inputValue.trim()) {
                    return
                  }
                  console.log('newOpenIds', newOpenIds)
                  setOpenIds(newOpenIds as string[])
                }}
                initialOpen={inputValue.trim() ? memoAllGroupIds : openIds}
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
          settingsKey={buttonKey}
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
        <PermissionWrapper
          TooltipProps={{
            placement: 'top',
          }}
          permissions={['pro']}
          sceneType={'CUSTOM_PROMPT'}
          onPermission={async () => {
            const userEditablePrompts = originalTreeData.filter((item) => {
              return item.data.editable && item.data.type === 'shortcuts'
            })
            return {
              success: userEditablePrompts.length < 1,
            }
          }}
        >
          <Button
            disableElevation
            variant={'contained'}
            onClick={addNewMenuItem}
            disabled={loading}
            startIcon={<AddIcon />}
          >
            New option
          </Button>
        </PermissionWrapper>
        <PermissionWrapper
          TooltipProps={{
            placement: 'top',
          }}
          permissions={['pro']}
          sceneType={'CUSTOM_PROMPT_GROUP'}
          onPermission={async () => {
            const userEditablePrompts = originalTreeData.filter((item) => {
              return item.data.editable && item.data.type === 'group'
            })
            return {
              success: userEditablePrompts.length < 1,
            }
          }}
        >
          <Button
            disableElevation
            variant={'contained'}
            onClick={addNewMenuGroup}
            disabled={loading}
            startIcon={<AddIcon />}
          >
            New option group
          </Button>
        </PermissionWrapper>
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
