import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { v4 } from 'uuid'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { DropdownMenu } from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsContextProvider'
import {
  SettingPromptsEditButtonKeyAtom,
  specialInputAssistantButtonKeys,
} from '@/pages/settings/pages/prompts/store'
import cloneDeep from 'lodash-es/cloneDeep'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { IContextMenuItem } from '@/features/contextMenu/types'

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

  const { node, editNode, selectedIcon, onSave, onCancel, onDelete } = useSettingPromptsContext()
  const { editHTML, generateActions } = useShortcutEditorActions()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )

  const isEditingSpecialButtonKey =
    settingPromptsEditButtonKey &&
    specialInputAssistantButtonKeys.includes(settingPromptsEditButtonKey) &&
    false

  const isDisabled = !editNode.data.editable

  const modalTitle = useMemo(() => {
    if (editNode.data.type === 'group') {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt_group__title')
        : editNode.id === ''
        ? t('settings:feature_card__prompts__new_prompt_group__title')
        : <>
            {selectedIcon}
            {t('settings:feature_card__prompts__edit_prompt_group__title')}
          </>
    } else {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt__title')
        : editNode.id === ''
        ? t('settings:feature_card__prompts__new_prompt__title')
        : <>
            {selectedIcon}
            {t('settings:feature_card__prompts__edit_prompt__title')}
          </>
    }
  }, [editNode.data.type, editNode.id, isDisabled, t])

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
    settingPromptsEditButtonKey,
    editNode.text,
    editNode.data.visibility,
    editHTML,
  ])

  const handleSave = () => {
    if (editNode.id === '') {
      editNode.id = v4()
    }
    const actions = generateActions(
      editNode.text,
      settingPromptsEditButtonKey === 'sidebarSummaryButton',
    )
    // Summary custom prompts 需要特殊处理，将输出端转成 AI
    if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
      const askChatGPTAction = actions.find(
        (action) => action.type === 'ASK_CHATGPT',
      )
      if (askChatGPTAction) {
        const originalData = cloneDeep(editNode)
        delete originalData.data.actions
        askChatGPTAction.parameters.AskChatGPTActionQuestion = {
          meta: {
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            contextMenu: originalData,
          },
          text: askChatGPTAction.parameters.template || '',
        }
        askChatGPTAction.parameters.AskChatGPTActionType = 'ASK_CHAT_GPT_HIDDEN'
      }
    }
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
      <Typography variant="h6">{modalTitle}</Typography>

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
            onClick={() => onDelete(editNode.id)}
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
