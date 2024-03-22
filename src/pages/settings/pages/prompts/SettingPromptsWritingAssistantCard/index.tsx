

import Stack from '@mui/material/Stack'
import cloneDeep from 'lodash-es/cloneDeep'
import groupBy from 'lodash-es/groupBy'
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next'

import { type IChromeExtensionButtonSettingKey } from '@/background/utils'
import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import {
  getChromeExtensionDBStorageButtonContextMenu,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import DevContent from '@/components/DevContent'
import {
  type IContextMenuItem,
  type IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import { fuzzySearchContextMenuList } from '@/features/contextMenu/utils'
import useContextMenuSearchTextStore from '@/features/sidebar/hooks/useContextMenuSearchTextStore'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup';
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import SettingPromptsActionConfirmModal, { type IConfirmActionType } from '@/pages/settings/pages/prompts/components/SettingPromptsActionConfirmModal'
import SettingPromptsMenuPanel, { PRESET_PROMPT, PRESET_PROMPT_ID, rootId, saveTreeData } from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel'
import SettingPromptsViewSource from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel/components/SettingPromptsViewSource';
import SettingPromptsPositionSwitch from '@/pages/settings/pages/prompts/components/SettingPromptsPositionSwitch'
import SettingPromptsRestorer from '@/pages/settings/pages/prompts/components/SettingPromptsRestorer'
import SettingPromptsUpdater from '@/pages/settings/pages/prompts/components/SettingPromptsUpdater'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper';

const SettingPromptsWritingAssistantCard: FC = () => {
  const { syncLocalToServer } = useSyncSettingsChecker()
  const { t } = useTranslation(['settings'])
  const {
    contextMenuSearchTextWithCurrentLanguage,
  } = useContextMenuSearchTextStore()
  const {
    buttonSettings,
  } = useChromeExtensionButtonSettings()

  const loadedRef = useRef(false)
  const defaultTreeDataRef = useRef<null | IContextMenuItem[]>(null)
  const originalTreeMapRef = useRef<{ [key: string]: IContextMenuItem }>({})

  const [editButtonKey, setEditButtonKey] = useState<IChromeExtensionButtonSettingKey>('inputAssistantComposeReplyButton')
  const [loading, setLoading] = useState(false)
  const [editNode, setEditNode] = useState<IContextMenuItem | null>(null)
  const [originalTreeData, setOriginalTreeData] = useState<IContextMenuItem[]>(
    [],
  )

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmType, setConfirmType] = useState<IConfirmActionType | null>(
    null,
  )
  const [inputValue, setInputValue] = useState<string>('')
  const [openIds, setOpenIds] = useState<string[]>([])
  
  const position = useMemo(() =>  buttonSettings?.[editButtonKey].contextMenuPosition, [editButtonKey]);
  const currentConfirmNode = useMemo(() => {
    return originalTreeData.find((item) => item.id === confirmId)
  }, [confirmId, originalTreeData])
  const memoAllGroupIds = useMemo(() => {
    return originalTreeData
      .filter((item) => item.data.type === 'group')
      .map((item) => item.id)
  }, [originalTreeData])

  const handleOnSave = useCallback(
    (newNode: IContextMenuItem) => {
      if (newNode.data.type === 'group') {
        updateMenuItem(newNode)
      } else {
        updateMenuItem(newNode)
      }
      setEditNode(null)
    },
    [],
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
    newTreeData = newTreeData.filter((node) => node.id !== PRESET_PROMPT_ID)
    setOriginalTreeData(newTreeData)
  }

  useEffect(() => {
    let isDestroy = false
    console.log('testestasdasd', editButtonKey)
    if (editButtonKey) {
      const getList = async () => {
        const contextMenu = await getChromeExtensionDBStorageButtonContextMenu(
            editButtonKey,
        )
        console.log('testestcontextMenu', contextMenu)
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
    if (loadedRef.current) {
      saveTreeData(editButtonKey, originalTreeData).then(() => {
        console.log('saveTreeData success')
        syncLocalToServer()
      })
    }
  }, [originalTreeData])

  const filteredTreeData = useMemo(() => {
    if (!inputValue) {
      if (position === 'start') {
        return PRESET_PROMPT.concat(originalTreeData)
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

  return <>
    <RadioCardGroup
        onChange={async (key) => setEditButtonKey(key as IChromeExtensionButtonSettingKey)}
        options={[
          {
            label: t('settings:feature_card__prompts__writing_assistant__quick_reply_radio_title'),
            value: 'inputAssistantComposeReplyButton',
            image: getChromeExtensionAssetsURL(
              '/images/settings/prompts/quick-reply.png',
            ),
          },
          {
            label: t('settings:feature_card__prompts__writing_assistant__edit_or_review_draft_radio_title'),
            value: 'inputAssistantRefineDraftButton',
            image: getChromeExtensionAssetsURL(
              '/images/settings/prompts/edit-or-review-draft.png',
            ),
          },
          {
            label: t('settings:feature_card__prompts__writing_assistant__quick_compose_radio_title'),
            value: 'inputAssistantComposeNewButton',
            image: getChromeExtensionAssetsURL(
              '/images/settings/prompts/quick-compose.png',
            ),
          },
        ]}
        maxWidth={372}
      />

    <Stack sx={{ mt: '16px', p: '8px', border: '1px solid', borderColor: 'primary.main', borderRadius: '8px' }}>
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
        <SettingPromptsUpdater 
            disabled={loading}
            node={editNode}
            iconSetting={true}
            onSave={handleOnSave}
            onCancel={() => setEditNode(null)}
            onDelete={(id) => handleActionConfirmOpen('delete', id)}
            setEditNode={setEditNode}
        />
        <SettingPromptsRestorer 
            onRestore={async (snapshot) => {
            try {
                setLoading(true)
                setInputValue('')
                const buttonSettings = snapshot.settings.buttonSettings
                if (!buttonSettings) return
                const { contextMenu } = buttonSettings[editButtonKey]
                setOriginalTreeData(contextMenu)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
            }}
        />
        </Stack>
        
        <SettingPromptsPositionSwitch
        buttonKey={editButtonKey}
        checked={position === 'end'}
        label={t(
            'settings:feature_card__prompts__place_my_own_prompts_switch',
        )} 
        sx={{
            my: '16px'
        }}
        />
        
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
            initialOpen={inputValue.trim() ? memoAllGroupIds : openIds}
            treeData={filteredTreeData}
            editNode={editNode}
            onChangeOpen={(newOpenIds) => {
                if (inputValue.trim()) {
                return
                }
                console.log('newOpenIds', newOpenIds)
                setOpenIds(newOpenIds as string[])
            }}
            onDrop={handleDrop}
            onEditNode={setEditNode}
            onDeleteNode={(id) => handleActionConfirmOpen('delete', id)}
            disabledDrag={inputValue !== ''} 
            />
        </Stack>
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
}

export default SettingPromptsWritingAssistantCard;