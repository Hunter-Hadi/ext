import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, {useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import {
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import AIResponseLanguageEditor from '@/features/shortcuts/components/ShortcutsActionsEditor/components/AIResponseLanguageEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsContextProvider'
import {
  SettingPromptsEditButtonKeyAtom,
  specialInputAssistantButtonKeys,
} from '@/pages/settings/pages/prompts/store'

const ConfigurePanel = () => {
  const { t } = useTranslation(['settings', 'common'])
  const { editNode, selectedIcon, setEditNode, setSelectedIcon } =
    useSettingPromptsContext()

  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const { enabledAIResponseLanguage, toggleAIResponseLanguage } =
    useShortcutEditorActions()

  const isEditingSpecialButtonKey =
    settingPromptsEditButtonKey &&
    specialInputAssistantButtonKeys.includes(settingPromptsEditButtonKey) &&
    false

  const isDisabled = !editNode.data.editable

  return (
    <Stack spacing={2}>
      <Stack spacing={1} pb={1}>
        <Typography variant={'body1'}>
          {`${t(
            'settings:feature_card__prompts__edit_prompt__field_name__title',
          )} `}
          <span style={{ color: 'red' }}>*</span>
        </Typography>
        <TextField
          size={'small'}
          autoFocus
          value={editNode.text}
          placeholder={t(
            'settings:feature_card__prompts__edit_prompt__field_name__placeholder',
          )}
          onChange={(event) => {
            setEditNode((prev) => {
              return {
                ...prev,
                text: event.target.value,
              }
            })
          }}
        />
      </Stack>

      <Stack spacing={1} pb={1}>
        <Typography variant={'body1'}>
          {t('settings:feature_card__prompts__edit_prompt__field_icon__title')}
        </Typography>
        <Stack
          flexWrap={'wrap'}
          gap={1}
          direction={'row'}
          alignItems={'center'}
          sx={{ maxHeight: '72px', overflowY: 'scroll' }}
        >
          {CONTEXT_MENU_ICONS.filter((icon) => icon !== 'Empty').map((icon) => {
            return (
              <Button
                data-name={icon}
                sx={{ width: 32, minWidth: 'unset', height: 32 }}
                variant={
                  icon === (selectedIcon as string) ? 'contained' : 'outlined'
                }
                key={icon}
                onClick={() => {
                  setSelectedIcon((preIcon) =>
                    preIcon === icon ? undefined : icon,
                  )
                  setEditNode((prev) => {
                    return {
                      ...prev,
                      data: {
                        ...prev.data,
                        icon: prev.data.icon === icon ? undefined : icon,
                      },
                    }
                  })
                }}
              >
                <ContextMenuIcon icon={icon} sx={{ fontSize: 20 }} />
              </Button>
            )
          })}
        </Stack>
      </Stack>

      <AIResponseLanguageEditor
        checked={enabledAIResponseLanguage}
        onChange={() => toggleAIResponseLanguage()}
      />

      <Stack>
        <Stack direction={'row'} alignItems="center">
          <Typography variant={'body1'}>
            {t(
              'settings:feature_card__prompts__edit_prompt__field_visibility__title',
            )}
            {isEditingSpecialButtonKey && (
              <span style={{ color: 'red' }}>*</span>
            )}
          </Typography>
        </Stack>
        {editNode.data.visibility && (
          <VisibilitySettingCard
            mode={'white'}
            disabled={isDisabled}
            sx={{ mt: 2 }}
            defaultValue={editNode.data.visibility}
            onChange={async (newVisibilitySetting) => {
              setEditNode((prev) => {
                return {
                  ...prev,
                  data: {
                    ...prev.data,
                    visibility: newVisibilitySetting,
                  },
                }
              })
            }}
          />
        )}
      </Stack>
    </Stack>
  )
}

export default ConfigurePanel
