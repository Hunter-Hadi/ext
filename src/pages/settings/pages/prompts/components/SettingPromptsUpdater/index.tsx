import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import React, { type Dispatch, type FC, memo, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'

import { IContextMenuItem } from '@/features/contextMenu/types'
import { rootId } from '@/pages/settings/pages/prompts/components/SettingPromptsMenuPanel'

import SettingPromptEditFormModal from '../SettingPromptsEditFormModal'

const addNewMenuItem = async (
  setEditNode: Dispatch<SetStateAction<IContextMenuItem | null>>,
) => {
  setEditNode({
    id: '',
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

const addNewMenuGroup = async (
  setEditNode: Dispatch<SetStateAction<IContextMenuItem | null>>,
) => {
  // setTreeData((prev) =>
  //   prev.concat(),
  // )
  setEditNode({
    id: '',
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

const SettingPromptsUpdater: FC<{
  disabled?: boolean
  node: IContextMenuItem | null
  iconSetting: boolean
  onSave?: (newNode: IContextMenuItem) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
  setEditNode: Dispatch<SetStateAction<IContextMenuItem | null>>
}> = ({
  disabled,
  node,
  setEditNode,
  iconSetting,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { t } = useTranslation(['settings'])
  return (
    <>
      <Button
        disableElevation
        variant={'contained'}
        onClick={() => addNewMenuItem(setEditNode)}
        disabled={disabled}
        startIcon={<AddIcon />}
        sx={{ borderRadius: '8px' }}
      >
        {t('settings:feature_card__prompts__new_option_button')}
      </Button>
      <Button
        disableElevation
        variant={'contained'}
        onClick={() => addNewMenuGroup(setEditNode)}
        disabled={disabled}
        startIcon={<AddIcon />}
        sx={{ borderRadius: '8px' }}
      >
        {t('settings:feature_card__prompts__new_option_group_button')}
      </Button>
      {node && (
        <SettingPromptEditFormModal
          open={!!node}
          iconSetting={iconSetting}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          node={node}
        />
      )}
    </>
  )
}

export default memo(SettingPromptsUpdater)
