import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
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
import ContextMenuItem from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuItem'
import { v4 } from 'uuid'
// import ContextMenuViewSource from '@/pages/settings/components/ContextMenuViewSource'
import ContextMenuPlaceholder from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuPlaceholder'
import ContextMenuViewSource from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuViewSource'
import ContextMenuActionConfirmModal, {
  IConfirmActionType,
} from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuActionConfirmModal'
import { getDefaultActionWithTemplate } from '@/features/shortcuts/utils'
import ContextMenuMockTextarea from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuMockTextarea'
import DevContent from '@/components/DevContent'
import { fuzzySearchContextMenuList } from '@/features/contextMenu/utils'
import AddIcon from '@mui/icons-material/Add'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import groupBy from 'lodash-es/groupBy'
import cloneDeep from 'lodash-es/cloneDeep'
import {
  getChromeExtensionButtonContextMenu,
  setChromeExtensionSettings,
} from '@/background/utils'
import ContextMenuEditFormModal from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuEditFormModal'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'
import { useTranslation } from 'react-i18next'
import ContextMenuRestoreDialog from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuRestoreDialog'
import {
  ContextMenuSearchTextStore,
  removeContextMenuSearchTextStore,
  setContextMenuSearchTextStore,
  useContextMenuSearchTextStore,
} from '@/features/sidebar/store/contextMenuSearchTextStore'

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
  const { t, i18n } = useTranslation(['settings', 'prompt'])
  const tRef = useRef(t)
  const once = useRef(true)
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
  const { contextMenuSearchTextWithCurrentLanguage } =
    useContextMenuSearchTextStore()
  const memoAllGroupIds = useMemo(() => {
    return originalTreeData
      .filter((item) => item.data.type === 'group')
      .map((item) => item.id)
  }, [originalTreeData])
  const currentConfirmNode = useMemo(() => {
    return originalTreeData.find((item) => item.id === confirmId)
  }, [confirmId, defaultContextMenuJson])
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
    originalTreeMapRef.current = {}
    const language = i18n.language
    const searchTextPrefixMap: ContextMenuSearchTextStore = {
      en: {} as any,
      [language]: {} as any,
    }
    const saveSearchTextData: ContextMenuSearchTextStore = {
      en: {} as any,
      [language]: {} as any,
    }
    const findSearchText = (parent: string) => {
      const children = originalTreeData.filter((item) => item.parent === parent)
      if (children.length === 0) {
        return
      }
      children.forEach((item) => {
        // 拼接parent的前缀
        const enPrefix = searchTextPrefixMap['en'][parent] || ''
        const currentLanguagePrefix =
          searchTextPrefixMap[language][parent] || ''
        // 当前的text
        const enItemText = item.text
        let currentLanguageItemText = enItemText
        // 只拼接一层
        const enSearchText = `${enPrefix} ${item.text}`.trimStart()
        let currentLanguageSearchText = enSearchText
        if (
          language !== 'en' &&
          tRef.current(`prompt:${item.id}` as any) !== item.id
        ) {
          currentLanguageItemText = tRef.current(`prompt:${item.id}` as any)
          currentLanguageSearchText =
            `${currentLanguagePrefix} ${currentLanguageItemText} ${enSearchText}`.trimStart()
        }
        searchTextPrefixMap.en[item.id] = enItemText.toLowerCase()
        searchTextPrefixMap[language][item.id] =
          currentLanguageItemText.toLowerCase()
        saveSearchTextData.en[item.id] = enSearchText.toLowerCase()
        saveSearchTextData[language][item.id] =
          currentLanguageSearchText.toLowerCase()
        item.data.searchText = enSearchText
        originalTreeMapRef.current[item.id] = item
        findSearchText(item.id)
      })
    }
    if (originalTreeData.length > 0) {
      findSearchText(rootId)
      Promise.all([
        removeContextMenuSearchTextStore('en'),
        removeContextMenuSearchTextStore(language),
      ]).then(() => {
        setContextMenuSearchTextStore('en', saveSearchTextData.en)
        setContextMenuSearchTextStore(language, saveSearchTextData[language])
      })
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
  }, [originalTreeData, inputValue, contextMenuSearchTextWithCurrentLanguage])
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
          onRestore={(snapshot) => {
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
        <PermissionWrapper
          TooltipProps={{
            placement: 'top',
          }}
          allowedRoles={['pro', 'pro_gift', 'new_user']}
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
            {t('settings:feature_card__prompts__new_option_button')}
          </Button>
        </PermissionWrapper>
        <PermissionWrapper
          TooltipProps={{
            placement: 'top',
          }}
          allowedRoles={['pro', 'pro_gift', 'new_user']}
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
            {t('settings:feature_card__prompts__new_option_group_button')}
          </Button>
        </PermissionWrapper>
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
export default ContextMenuSettings
