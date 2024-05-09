import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

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
import CustomVariable from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/PromptPanel/CustomVariables'
import PresetVariables from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/PromptPanel/PresetVariables'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

const PromptPanel = () => {
  const { t } = useTranslation(['settings', 'common', 'prompt_editor'])

  const { editHTML, updateEditHTML } = useShortcutEditorActions()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )

  const editorPlaceholder = useMemo(() => {
    let placeholder = ''

    if (settingPromptsEditButtonKey === 'textSelectPopupButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
      )
    } else if (
      settingPromptsEditButtonKey === 'inputAssistantComposeReplyButton'
    ) {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__compose_reply__field_template__placeholder',
      )
    } else if (
      settingPromptsEditButtonKey === 'inputAssistantRefineDraftButton'
    ) {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__refine_draft__field_template__placeholder',
      )
    } else if (
      settingPromptsEditButtonKey === 'inputAssistantComposeNewButton'
    ) {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__compose_new__field_template__placeholder',
      )
    } else if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
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
          permissionKeys.includes(settingPromptsEditButtonKey!)
        ) {
          placeholder += `\n{{${variable?.label}}}`
        }
      })

      if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
        placeholder +=
          `\n\n` +
          t(
            'settings:feature_card__prompts__edit_summary_prompt__field_template__placeholder__example',
          ) +
          `\nOutput a summary of the {{PAGE_CONTENT}} on {{CURRENT_WEBPAGE_DOMAIN}}.`
      }
    }

    return placeholder
  }, [t, settingPromptsEditButtonKey])

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

      <Stack bgcolor="#F4F4F4" borderRadius="8px" spacing={1} p={1}>
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
        onChange={(event) => updateEditHTML(event.target.value)}
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
