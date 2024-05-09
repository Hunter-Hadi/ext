import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 } from 'uuid'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { DropdownMenu } from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { IContextMenuItem } from '@/features/contextMenu/types'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsContextProvider'
import { specialInputAssistantButtonKeys } from '@/pages/settings/pages/prompts/store'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const DropDownMenuItem: FC<{
  label: string
  color?: string
  onClick?: () => void
}> = (props) => {
  const { label, color = 'text.primary', onClick } = props
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        borderRadius: '3px',
        height: '28px',
        fontSize: '14px',
        width: '100%',
        cursor: 'pointer',
        '&.floating-context-menu-item--active': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(55, 53, 47, 0.08)',
          '& .floating-context-menu-item__footer-icon': {
            display: 'flex',
          },
        },
        '& .floating-context-menu-item__footer-icon': {
          display: 'none',
          flexShrink: 0,
        },
        '& .floating-context-menu-item__footer-icon--active': {
          display: 'flex',
        },
        '&:hover': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(55, 53, 47, 0.08)',
          '& .floating-context-menu-item__footer-icon': {
            display: 'flex',
          },
        },
      }}
      component="div"
      role="menuitem"
      onClick={onClick}
    >
      <Stack direction={'row'} spacing={1} px={1} alignItems={'center'}>
        <Typography
          fontSize={14}
          textAlign={'left'}
          color={color}
          width={0}
          noWrap
          flex={1}
          lineHeight={'28px'}
        >
          {label}
        </Typography>
      </Stack>
    </Box>
  )
}

const TitleBar = () => {
  const { t } = useTranslation(['settings', 'common'])

  const {
    node,
    editNode,
    editButtonKey,
    generateSaveActions,
    onSave,
    onCancel,
    onDelete,
  } = useSettingPromptsContext()
  const { editHTML } = useShortcutEditorActions()

  const isEditingSpecialButtonKey =
    editButtonKey &&
    specialInputAssistantButtonKeys.includes(editButtonKey) &&
    false

  const isDisabled = !editNode.data.editable

  const modalTitle = useMemo(() => {
    if (editNode.data.type === 'group') {
      if (isDisabled) {
        return t('settings:feature_card__prompts__read_prompt_group__title')
      }
      if (editNode.id === '') {
        return t('settings:feature_card__prompts__new_prompt_group__title')
      }
      return (
        node.text ||
        t('settings:feature_card__prompts__edit_prompt_group__title')
      )
    } else {
      if (isDisabled) {
        return t('settings:feature_card__prompts__read_prompt__title')
      }
      if (editNode.id === '') {
        return t('settings:feature_card__prompts__new_prompt__title')
      }
      return (
        node.text || t('settings:feature_card__prompts__edit_prompt__title')
      )
    }
  }, [
    editNode.data.type,
    editNode.id,
    node.data.icon,
    node.text,
    isDisabled,
    t,
  ])

  const isDisabledSave = useMemo(() => {
    if (isDisabled) {
      return true
    }
    let disabledSave = editNode.text === ''
    if (!disabledSave && editNode.data.type === 'shortcuts') {
      disabledSave = disabledSave || editHTML.trim() === ''
      if (isEditingSpecialButtonKey) {
        disabledSave = Boolean(
          disabledSave || !editNode?.data?.visibility?.whitelist?.length,
        )
      }
    }
    return disabledSave
  }, [
    isDisabled,
    editButtonKey,
    editNode.text,
    editNode.data.visibility,
    editHTML,
  ])

  const handleSave = () => {
    if (editNode.id === '') {
      editNode.id = v4()
    }
    const actions = generateSaveActions()
    onSave?.(
      mergeWithObject([
        editNode,
        {
          data: {
            actions,
          },
        } as IContextMenuItem,
      ]),
    )
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="customColor.borderColor"
      spacing={1}
      py={1}
      px={2}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {node.data?.icon && (
          <ContextMenuIcon
            icon={node.data.icon}
            sx={{ fontSize: 24, color: 'primary.main' }}
          />
        )}
        <Typography variant="h6">{modalTitle}</Typography>
      </Stack>

      <DropdownMenu
        defaultPlacement="bottom-end"
        zIndex={2147483630}
        hoverOpen
        menuSx={{
          width: 200,
        }}
        referenceElement={
          <Button
            variant="text"
            sx={{
              width: '36px',
              height: '36px',
              color: 'inherit',
              minWidth: 'unset',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              ml: 'auto!important',
            }}
          >
            <ContextMenuIcon
              icon={'More'}
              sx={{ color: 'text.primary', fontSize: '16px' }}
            />
          </Button>
        }
        label=""
      >
        <DropDownMenuItem label={t('common:cancel')} onClick={onCancel} />
        {editNode.id && (
          <DropDownMenuItem
            label={t('common:delete')}
            color="error"
            onClick={() => onDelete?.(editNode.id)}
          />
        )}
      </DropdownMenu>

      <Button
        variant="contained"
        disabled={isDisabledSave}
        sx={{ borderRadius: '8px' }}
        onClick={handleSave}
      >
        {t('common:save')}
      </Button>
    </Stack>
  )
}

export default TitleBar
