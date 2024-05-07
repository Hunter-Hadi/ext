import Stack from '@mui/material/Stack'
import cloneDeep from 'lodash-es/cloneDeep'
import groupBy from 'lodash-es/groupBy'
import React, {
  type FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRecoilState } from 'recoil'

import { type IChromeExtensionButtonSettingKey } from '@/background/utils'
import {
  getChromeExtensionDBStorageButtonContextMenu,
  setChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import DevContent from '@/components/DevContent'
import {
  type IContextMenuItem,
} from '@/features/contextMenu/types'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import SettingPromptsActionConfirmModal, {
  type IConfirmActionType,
} from '@/pages/settings/pages/prompts/components/SettingPromptsActionConfirmModal'
import SettingPromptsMenuPanel, {
  rootId,
} from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel'
import SettingPromptsViewSource from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel/components/SettingPromptsViewSource'
import SettingPromptsUpdater from '@/pages/settings/pages/prompts/components/SettingPromptsUpdater'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

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

const buttonSettingKeys = new Set(['sidebarSummaryButton'])

const SettingPrompsSummaryCard: FC = () => {
  const [editButtonKey, setEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const { syncLocalToServer } = useSyncSettingsChecker()

  const loadedRef = useRef(false)
  const defaultTreeDataRef = useRef<null | IContextMenuItem[]>(null)
  const originalTreeMapRef = useRef<{ [key: string]: IContextMenuItem }>({})

  const [editNode, setEditNode] = useState<IContextMenuItem | null>(null)
  const [originalTreeData, setOriginalTreeData] = useState<IContextMenuItem[]>(
    [],
  )

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmType, setConfirmType] = useState<IConfirmActionType | null>(
    null,
  )
  const [openIds, setOpenIds] = useState<string[]>([])

  const currentConfirmNode = useMemo(() => {
    return originalTreeData.find((item) => item.id === confirmId)
  }, [confirmId, originalTreeData])

  const handleOnSave = useCallback((newNode: IContextMenuItem) => {
    if (newNode.data.type === 'group') {
      updateMenuItem(newNode)
    } else {
      updateMenuItem(newNode)
    }
    setEditNode(null)
  }, [])

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

  const handleDrop = async (newTreeData: any[], dragDetail: any) => {
    setOriginalTreeData(newTreeData)
  }

  useEffect(() => {
    if (!buttonSettingKeys.has(editButtonKey!)) {
      setEditButtonKey(buttonSettingKeys.values().next().value)
    }
    return () => setEditButtonKey(null)
  }, [])

  useEffect(() => {
    let isDestroy = false
    if (editButtonKey) {
      const getList = async () => {
        const contextMenu = await getChromeExtensionDBStorageButtonContextMenu(
          editButtonKey,
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
  }, [editButtonKey])

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
    if (loadedRef.current && editButtonKey) {
      saveTreeData(editButtonKey, originalTreeData).then(() => {
        console.log('saveTreeData success')
        syncLocalToServer()
      })
    }
  }, [originalTreeData])

  return (
    <>
      <Stack direction={'row'} alignItems={'center'} spacing={2} mb={'16px'}>
        <SettingPromptsUpdater
          node={editNode}
          iconSetting={true}
          onSave={handleOnSave}
          onCancel={() => setEditNode(null)}
          onDelete={(id) => handleActionConfirmOpen('delete', id)}
          setEditNode={setEditNode}
        />
      </Stack>

      <Stack
        height={0}
        flex={1}
      // sx={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}
      >
        <Stack height={'100%'}>
          <DevContent>
            <SettingPromptsViewSource treeData={originalTreeData} />
          </DevContent>

          <SettingPromptsMenuPanel
            rootId={rootId}
            initialOpen={openIds}
            treeData={originalTreeData}
            editNode={editNode}
            onChangeOpen={(newOpenIds) => {
              setOpenIds(newOpenIds as string[])
            }}
            onDrop={handleDrop}
            onEditNode={setEditNode}
            onDeleteNode={(id) => handleActionConfirmOpen('delete', id)}
          />
        </Stack>
      </Stack>
      {confirmOpen && confirmType && (
        <SettingPromptsActionConfirmModal
          open={confirmOpen}
          actionType={confirmType}
          nodeType={currentConfirmNode?.data?.type || 'shortcuts'}
          onClose={handleActionConfirmClose}
          onConfirm={handleActionConfirmOnConfirm}
        />
      )}
    </>
  )
}

export default memo(SettingPrompsSummaryCard)
