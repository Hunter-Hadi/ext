import {
  getBackendOptions,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview'
import AddIcon from '@mui/icons-material/Add'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import cloneDeep from 'lodash-es/cloneDeep'
import groupBy from 'lodash-es/groupBy'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DndProvider } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { v4 } from 'uuid'

import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import {
  getChromeExtensionDBStorageButtonContextMenu,
  setChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import DevContent from '@/components/DevContent'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import { fuzzySearchContextMenuList } from '@/features/contextMenu/utils'
import { useContextMenuSearchTextStore } from '@/features/sidebar/store/contextMenuSearchTextStore'
import ContextMenuActionConfirmModal, {
  IConfirmActionType,
} from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuActionConfirmModal'
import ContextMenuEditFormModal from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuEditFormModal'
import ContextMenuItem from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuItem'
import ContextMenuMockTextarea from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuMockTextarea'
// import ContextMenuViewSource from '@/pages/settings/components/ContextMenuViewSource'
import ContextMenuPlaceholder from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuPlaceholder'
import ContextMenuRestoreDialog from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuRestoreDialog'
import ContextMenuViewSource from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuViewSource'

const rootId = 'root'

const saveTreeData = async (
  key: IChromeExtensionButtonSettingKey,
  treeData: IContextMenuItem[],
) => {
  try {
    console.log('saveTreeData', key, treeData)
    const success = await setChromeExtensionDBStorage((settings) => {
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

/**
 * 用来在my own prompts渲染的虚拟节点，让用户设置preset prompt的位置
 */
export const PRESET_PROMPT_ID = 'PRESET_PROMPT_ID'
export const PRESET_PROMPT: IContextMenuItem = {
  text: 'Preset prompts',
  id: PRESET_PROMPT_ID,
  parent: 'root',
  droppable: false,
  data: {
    type: 'shortcuts',
    editable: false,
  },
}

const ContextMenuEditCard: FC<{
  position: 'start' | 'end'
  iconSetting?: boolean
  buttonKey: IChromeExtensionButtonSettingKey
  onUpdated?: () => void
}> = (props) => {
  const { position, buttonKey, iconSetting = false, onUpdated } = props
  const { t } = useTranslation(['settings', 'prompt'])
  const tRef = useRef(t)
  const loadedRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const originalTreeMapRef = useRef<{ [key: string]: IContextMenuItem }>({})
  const [editNode, setEditNode] = useState<IContextMenuItem | null>(null)
  const [originalTreeData, setOriginalTreeData] = useState<IContextMenuItem[]>(
    [],
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmType, setConfirmType] = useState<IConfirmActionType | null>(
    null,
  )
  const [inputValue, setInputValue] = useState<string>('')
  const [openIds, setOpenIds] = useState<string[]>([])
  const {
    contextMenuSearchTextWithCurrentLanguage,
  } = useContextMenuSearchTextStore()
  const memoAllGroupIds = useMemo(() => {
    return originalTreeData
      .filter((item) => item.data.type === 'group')
      .map((item) => item.id)
  }, [originalTreeData])
  const currentConfirmNode = useMemo(() => {
    return originalTreeData.find((item) => item.id === confirmId)
  }, [confirmId, originalTreeData])
  useEffect(() => {
    // 为了保证每次都是最新的t
    tRef.current = t
  }, [t])
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
    newTreeData = newTreeData.filter((node) => node.id !== PRESET_PROMPT_ID)
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
    (newNode: IContextMenuItem) => {
      if (newNode.data.type === 'group') {
        updateMenuItem(newNode)
      } else {
        updateMenuItem(newNode)
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
    setConfirmType(type)
    if (id) {
      setConfirmId(id)
    }
    setConfirmOpen(true)
  }
  const handleActionConfirmClose = () => {
    setConfirmOpen(false)
    setConfirmType(null)
  }

  const handleActionConfirmOnConfirm = (type: IConfirmActionType) => {
    if (type === 'delete' && confirmId) {
      deleteMenuItemById(confirmId)
      setEditNode(null)
    }
    setConfirmOpen(false)
    setConfirmType(null)
  }

  useEffect(() => {
    let isDestroy = false
    if (buttonKey) {
      const getList = async () => {
        const contextMenu = await getChromeExtensionDBStorageButtonContextMenu(
          buttonKey,
        )
        if (isDestroy) return
        setOriginalTreeData(contextMenu)
        setTimeout(() => {
          // 防止直接触发保存
          loadedRef.current = true
        }, 0)
        defaultTreeDataRef.current = contextMenu
      }
      getList()
    }
    return () => {
      isDestroy = true
    }
  }, [buttonKey])

  useEffect(() => {
    const searchTextMap: {
      [key: string]: string
    } = {}
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
    if (loadedRef.current) {
      saveTreeData(buttonKey, originalTreeData).then(() => {
        console.log('saveTreeData success')
        onUpdated && onUpdated()
      })
    }
  }, [originalTreeData])
  const filteredTreeData = useMemo(() => {
    if (!inputValue) {
      if (position === 'start') {
        return [PRESET_PROMPT].concat(originalTreeData)
      } else {
        return originalTreeData.concat(PRESET_PROMPT)
      }
    }
    const result = fuzzySearchContextMenuList(
      originalTreeData,
      inputValue,
      contextMenuSearchTextWithCurrentLanguage,
    )
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
  }, [
    originalTreeData,
    inputValue,
    contextMenuSearchTextWithCurrentLanguage,
    position,
  ])
  return (
    <Stack spacing={2} height={'100%'}>
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
          <ContextMenuMockTextarea
            defaultValue={inputValue}
            onChange={setInputValue}
            placeholder={t(
              'feature_card__prompts__edit_prompt__mock_input__placeholder',
            )}
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
          nodeType={currentConfirmNode?.data?.type || 'shortcuts'}
          onClose={handleActionConfirmClose}
          onConfirm={handleActionConfirmOnConfirm}
        />
      )}
      {restoreDialogOpen && (
        <ContextMenuRestoreDialog
          onRestore={async (snapshot) => {
            try {
              setLoading(true)
              setInputValue('')
              const buttonSettings = snapshot.settings.buttonSettings
              if (!buttonSettings) return
              const { contextMenu } = buttonSettings[buttonKey]
              setOriginalTreeData(contextMenu)
            } catch (e) {
              console.error(e)
            } finally {
              setLoading(false)
            }
          }}
          onClose={() => {
            setRestoreDialogOpen(false)
          }}
        />
      )}
      <Stack direction={'row'} alignItems={'center'} spacing={2}>
        <Button
          disableElevation
          variant={'contained'}
          onClick={addNewMenuItem}
          disabled={loading}
          startIcon={<AddIcon />}
        >
          {t('settings:feature_card__prompts__new_option_button')}
        </Button>

        <Button
          disableElevation
          variant={'contained'}
          onClick={addNewMenuGroup}
          disabled={loading}
          startIcon={<AddIcon />}
        >
          {t('settings:feature_card__prompts__new_option_group_button')}
        </Button>
        <Button
          disableElevation
          variant={'outlined'}
          disabled={loading}
          onClick={() => {
            setRestoreDialogOpen(true)
          }}
          startIcon={<RestartAltIcon />}
        >
          {t('settings:feature_card__prompts__restore_button')}
        </Button>
      </Stack>
    </Stack>
  )
}
export default ContextMenuEditCard
