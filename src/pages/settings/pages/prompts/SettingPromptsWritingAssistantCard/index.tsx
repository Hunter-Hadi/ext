import Stack from '@mui/material/Stack'
import cloneDeep from 'lodash-es/cloneDeep'
import groupBy from 'lodash-es/groupBy'
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil';

import { type IChromeExtensionButtonSettingKey } from '@/background/utils'
import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import {
  getChromeExtensionDBStorageButtonContextMenu,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import DevContent from '@/components/DevContent'
import {
  type IContextMenuItem,
} from '@/features/contextMenu/types'
import useContextMenuSearchTextStore from '@/features/sidebar/hooks/useContextMenuSearchTextStore'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup';
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import SettingPromptsActionConfirmModal, { type IConfirmActionType } from '@/pages/settings/pages/prompts/components/SettingPromptsActionConfirmModal'
import SettingPromptsMenuPanel, { PRESET_PROMPT, PRESET_PROMPT_ID, rootId, saveTreeData } from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel'
import SettingPromptsViewSource from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel/components/SettingPromptsViewSource';
import SettingPromptsPositionSwitch from '@/pages/settings/pages/prompts/components/SettingPromptsPositionSwitch'
import SettingPromptsRestorer from '@/pages/settings/pages/prompts/components/SettingPromptsRestorer'
import SettingPromptsUpdater from '@/pages/settings/pages/prompts/components/SettingPromptsUpdater'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store';
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper';

import InputAssistantButtonExhibit from './InputAssistantButtonExhibit';

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

  const [editButtonKey, setEditButtonKey] = useRecoilState(SettingPromptsEditButtonKeyAtom)
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
  const [openIds, setOpenIds] = useState<string[]>([])
  const position = editButtonKey ? buttonSettings?.[editButtonKey]?.contextMenuPosition : 'end';

  const currentConfirmNode = useMemo(() => {
    return originalTreeData.find((item) => item.id === confirmId)
  }, [confirmId, originalTreeData])
  const radioCardOptions = useMemo(() => [
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
  ], [t])
  // const memoAllGroupIds = useMemo(() => {
  //   return originalTreeData
  //     .filter((item) => item.data.type === 'group')
  //     .map((item) => item.id)
  // }, [originalTreeData])

  const handleOnSave = useCallback(
    (newNode: IContextMenuItem) => {
      if (newNode.data.type === 'group') {
        updateMenuItem(newNode)
      } else {
        // 240323: yangger 说 template 中没有对应的 capability context 就不需要抓取页面内容
        // newNode.data.actions?.unshift(
        //   getInputAssistantAction(newNode.data.visibility?.whitelist[0] as InputAssistantButtonGroupConfigHostType),
        // )
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
    if (!['inputAssistantComposeReplyButton', 'inputAssistantRefineDraftButton', 'inputAssistantComposeNewButton'].includes(editButtonKey!)) {
      setEditButtonKey('inputAssistantComposeReplyButton')
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
    if (editButtonKey && loadedRef.current) {
      saveTreeData(editButtonKey, originalTreeData).then(() => {
        console.log('saveTreeData success')
        syncLocalToServer()
      })
    }
  }, [originalTreeData])

  const filteredTreeData = useMemo(() => {
    if (position === 'start') {
      return PRESET_PROMPT.concat(originalTreeData)
    } else {
      return originalTreeData.concat(PRESET_PROMPT)
    }
  }, [
    originalTreeData,
    contextMenuSearchTextWithCurrentLanguage,
    position,
  ])

  return <>
    <RadioCardGroup
      control={<div style={{ paddingTop: '32px', paddingBottom: '8px', paddingLeft: '8px' }} />}
      onChange={async (key) => {
        loadedRef.current = false;
        setEditButtonKey(key as IChromeExtensionButtonSettingKey)
      }}
      options={radioCardOptions}
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
            if (editButtonKey) {
              try {
                setLoading(true)
                const buttonSettings = snapshot.settings.buttonSettings
                if (!buttonSettings) return
                const { contextMenu } = buttonSettings[editButtonKey!]
                setOriginalTreeData(contextMenu)
              } catch (e) {
                console.error(e)
              } finally {
                setLoading(false)
              }
            }
          }}
        />
      </Stack>

      <SettingPromptsPositionSwitch
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
          <InputAssistantButtonExhibit highlight={editButtonKey === 'inputAssistantRefineDraftButton'} />
          <SettingPromptsMenuPanel
            rootId={rootId}
            initialOpen={openIds}
            treeData={filteredTreeData}
            editNode={editNode}
            onChangeOpen={(newOpenIds) => {
              console.log('newOpenIds', newOpenIds)
              setOpenIds(newOpenIds as string[])
            }}
            onDrop={handleDrop}
            onEditNode={setEditNode}
            onDeleteNode={(id) => handleActionConfirmOpen('delete', id)}
            sx={{
              width: editButtonKey === 'inputAssistantRefineDraftButton' ? 'calc(50% - 12px)' : 'calc(50% + 12px)',
              mt: '4px',
              ml: editButtonKey === 'inputAssistantRefineDraftButton' ? 'auto' : 0,
            }}
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