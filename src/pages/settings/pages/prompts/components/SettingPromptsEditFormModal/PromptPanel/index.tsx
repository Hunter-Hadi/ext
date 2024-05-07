import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useCallback, useMemo, useRef } from 'react'
import ContentEditable from 'react-contenteditable'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import {
  generateVariableHtmlContent,
  promptEditorAddHtmlToFocusNode,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { getMaxAISidebarSelection } from '@/features/sidebar/utils/chatMessagesHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import CustomVariable from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/PromptPanel/CustomVariables'
import PresetVariables from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/PromptPanel/PresetVariables'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsContextProvider'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

const PromptPanel = () => {
  const { t } = useTranslation(['settings', 'common', 'prompt_editor'])

  const { editNode, selectedIcon } = useSettingPromptsContext()
  const {
    editHTML,
    updateEditHTML,
    enabledAIResponseLanguage,
    toggleAIResponseLanguage,
  } = useShortcutEditorActions()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )

  const placeholder = useMemo(() => {
    switch (settingPromptsEditButtonKey) {
      // instant reply
      case 'inputAssistantComposeReplyButton':
        return t(
          'settings:feature_card__prompts__edit_instant_reply_prompt__compose_reply__field_template__placeholder',
        )

      // refine draft
      case 'inputAssistantRefineDraftButton':
        return t(
          'settings:feature_card__prompts__edit_instant_reply_prompt__refine_draft__field_template__placeholder',
        )

      // compose new
      case 'inputAssistantComposeNewButton':
        return t(
          'settings:feature_card__prompts__edit_instant_reply_prompt__compose_new__field_template__placeholder',
        )

      // summary
      case 'sidebarSummaryButton':
        return t(
          'settings:feature_card__prompts__edit_summary_prompt__field_template__placeholder',
        )

      // context menu
      case 'textSelectPopupButton':
      default:
        return t(
          'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
        )
    }
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
      pointerEvents: 'auto',
      flex: 1,
      '.prompt-template-input[contenteditable=true]:empty:before': {
        content: 'attr(data-placeholder)',
        display: 'block',
        color: '#aaa',
      },
      '.prompt-template-input': {
        '--borderColor': 'rgb(208, 208, 208)',
        bgcolor: (t: Theme) => (t.palette.mode === 'dark' ? '#3E3F4C' : '#fff'),
        display: 'block',
        boxSizing: 'border-box',
        minHeight: '240px',
        height: '100%',
        overflow: 'auto',
        borderRadius: '4px',
        border: '1px solid',
        outline: '0px solid',
        outlineColor: 'var(--borderColor)',
        borderColor: 'var(--borderColor)',
        p: 1,
        fontSize: 16,
        lineHeight: 1.4,
        letterSpacing: '0.4px',
        WebkitUserModify: 'read-write-plaintext-only',
        '&:hover': {
          '--borderColor': (t: Theme) =>
            t.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0,.87)',
        },
        '&:focus': {
          '--borderColor': (t: Theme) => t.palette.primary.main,
          outlineWidth: 1,
        },
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
        bgcolor="#F4F4F4"
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

      <Box sx={memoSx}>
        <ContentEditable
          innerRef={inputRef}
          className={'prompt-template-input'}
          id={'prompt-template-input'}
          html={editHTML}
          // disabled={disabled}
          data-placeholder={placeholder}
          onChange={(event) => {
            updateEditHTML(event.target.value)
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
          onKeyDown={(event) => {
            console.log(
              'ContentEditable onKeyUp',
              event,
              getMaxAISidebarSelection()?.getRangeAt(0)?.cloneRange(),
            )
            if (
              event.key === 'ContentEditable Backspace' ||
              event.key === 'Enter'
            ) {
              const selection = getMaxAISidebarSelection()
              if (selection && selection.toString() && selection.focusNode) {
                if (event.currentTarget.contains(selection.focusNode)) {
                  // 删除选中的内容
                  const range = selection.getRangeAt(0)
                  range.deleteContents()
                  if (event.key === 'Enter') {
                    // 添加换行符
                    const br = document.createElement('br')
                    range.insertNode(br)
                    range.setStartAfter(br)
                    range.setEndAfter(br)
                  }
                  // 阻止默认的删除事件
                  event.preventDefault()
                }
              }
            }
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
      </Box>
    </Stack>
  )
}

export default PromptPanel
