import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import TemplateContentEditor from '@/features/shortcuts/components/ShortcutsActionsEditor/components/TemplateContentEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { PRESET_VARIABLES_GROUP_MAP } from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import {
  generateVariableHtmlContent,
  promptEditorAddHtmlToFocusNode,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { getMaxAISidebarSelection } from '@/features/sidebar/utils/chatMessagesHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import CustomVariable from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/CustomVariables'
import PresetVariables from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/PresetVariables'
import { useSettingPromptsEditContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useSettingPromptsEditContext'
import { EXAMPLE_PROMPT_TEMPLATE_MAPS } from '@/pages/settings/pages/prompts/store'

const PromptPanel = () => {
  const { t } = useTranslation(['settings', 'common', 'prompt_editor'])

  const { editButtonKey, errors, setErrors } = useSettingPromptsEditContext()
  const { editHTML, updateEditHTML } = useShortcutEditorActions()

  const editorPlaceholder = useMemo(() => {
    let placeholder = ''

    if (editButtonKey === 'textSelectPopupButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
      )
    } else if (editButtonKey === 'inputAssistantComposeReplyButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__compose_reply__field_template__placeholder',
      )
    } else if (editButtonKey === 'inputAssistantRefineDraftButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__refine_draft__field_template__placeholder',
      )
    } else if (editButtonKey === 'inputAssistantComposeNewButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__compose_new__field_template__placeholder',
      )
    } else if (editButtonKey === 'sidebarSummaryButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_summary_prompt__field_template__placeholder',
      )
    }

    if (placeholder) {
      const presetVariables =
        PRESET_VARIABLES_GROUP_MAP[
          'prompt_editor:preset_variables__system__title'
        ]
      presetVariables.forEach(({ variable, permissionKeys = [] }) => {
        if (
          permissionKeys.length === 0 ||
          permissionKeys.includes(editButtonKey!)
        ) {
          placeholder += `\n{{${variable?.label}}}`
        }
      })

      if (editButtonKey && EXAMPLE_PROMPT_TEMPLATE_MAPS[editButtonKey]) {
        placeholder +=
          `\n\n` +
          t(
            'settings:feature_card__prompts__edit_summary_prompt__field_template__placeholder__example',
          ) +
          `\n${EXAMPLE_PROMPT_TEMPLATE_MAPS[editButtonKey]}`
      }
    }

    return placeholder
  }, [t, editButtonKey])

  // TODO 这部分逻辑和ShortcutsActionsEditor里有重复，后续要优化
  const theme = useCustomTheme()
  const inputRef = useRef<HTMLDivElement>(null)
  const lastSelectionRangeRef = useRef<Range | null>(null)
  const addTextVariableToHTML = useCallback(
    (variable: IActionSetVariable) => {
      if (inputRef.current) {
        console.log('ContentEditable 什么情况啊!!!!!!!!!!!!!!')
        updateEditHTML(inputRef.current.innerHTML)
        setTimeout(() => {
          const addHtml = `${generateVariableHtmlContent(
            variable.VariableName,
            variable.label || '',
            theme.isDarkMode,
          )}`
          lastSelectionRangeRef.current = promptEditorAddHtmlToFocusNode(
            inputRef.current!,
            addHtml,
            lastSelectionRangeRef.current || undefined,
          )
          updateEditHTML(inputRef.current!.innerHTML)
        }, 0)
      }
    },
    [theme.isDarkMode],
  )
  const memoSx = useMemo<SxProps>(() => {
    return {
      flex: 1,
      '.prompt-template-input': {
        minHeight: '240px',
        maxHeight: 'auto',
        height: '100%',
      },
    }
  }, [])

  return (
    <Stack flex={1} spacing={2}>
      <Stack direction="row" alignItems="center">
        <Typography variant={'body1'}>
          {`${t(
            'settings:feature_card__prompts__edit_prompt__field_template__title',
          )} `}
          <span style={{ color: 'red' }}>*</span>
        </Typography>
      </Stack>

      <Stack
        bgcolor={theme.isDarkMode ? 'rgba(0, 0, 0, 0.2)' : '#F4F4F4'}
        borderRadius="8px"
        spacing={1}
        p={1}
      >
        <PresetVariables
          onClick={(variable) => {
            addTextVariableToHTML(variable)
          }}
        />
        <CustomVariable
          onAddTextVariable={(variable) => {
            addTextVariableToHTML(variable)
          }}
        />
      </Stack>

      <TemplateContentEditor
        innerRef={inputRef}
        html={editHTML}
        placeholder={editorPlaceholder}
        sx={memoSx}
        error={errors?.promptTemplate}
        onChange={(event) => {
          const newValue = event.target.value
          updateEditHTML(newValue)
          if (newValue.trim() !== '') {
            setErrors((prev) => ({ ...prev, promptTemplate: false }))
          }
        }}
        onMouseUp={(event) => {
          console.log(
            'ContentEditable onClick',
            event,
            getMaxAISidebarSelection()?.getRangeAt(0)?.cloneRange(),
          )
          // 保存光标位置
          lastSelectionRangeRef.current =
            getMaxAISidebarSelection()?.getRangeAt(0)?.cloneRange() || null
        }}
        onKeyUp={(event) => {
          console.log(
            'ContentEditable onKeyUp',
            event,
            getMaxAISidebarSelection()?.getRangeAt(0)?.cloneRange(),
          )
          // 保存光标位置
          lastSelectionRangeRef.current =
            getMaxAISidebarSelection()?.getRangeAt(0)?.cloneRange() || null
        }}
      />
    </Stack>
  )
}

export default PromptPanel
