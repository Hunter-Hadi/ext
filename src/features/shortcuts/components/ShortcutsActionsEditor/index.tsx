import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import PromptVariableEditor from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor'
import PresetVariables from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables'
import TemplateContentEditor from '@/features/shortcuts/components/ShortcutsActionsEditor/components/TemplateContentEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import {
  generateVariableHtmlContent,
  promptEditorAddHtmlToFocusNode,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { getMaxAISidebarSelection } from '@/features/sidebar/utils/chatMessagesHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { chromeExtensionClientOpenPage } from '@/utils'

const ShortcutActionsEditor: FC<{
  error?: boolean
  errorText?: string
  disabled?: boolean
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onChange?: ISetActionsType
  onSave?: ISetActionsType
  sx?: SxProps
  disableCustomVariables?: boolean
}> = (props) => {
  const {
    error,
    errorText,
    disabled,
    placeholder,
    sx,
    minHeight = 240,
    maxHeight = 450,
    disableCustomVariables = false,
  } = props
  const { t } = useTranslation(['prompt_editor'])
  const {
    editHTML,
    updateEditHTML,
    enabledAIResponseLanguage,
    toggleAIResponseLanguage,
  } = useShortcutEditorActions()
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

  return (
    <Stack spacing={1}>
      <TemplateContentEditor
        innerRef={inputRef}
        html={editHTML}
        placeholder={placeholder}
        disabled={disabled}
        minHeight={minHeight}
        maxHeight={maxHeight}
        sx={sx}
        error={error}
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
      {error && (
        <Typography fontSize={'12px'} color={'error.main'}>
          {errorText || t('prompt_editor:template__error__title')}
        </Typography>
      )}
      <PresetVariables
        onClick={(variable) => {
          addTextVariableToHTML(variable)
        }}
      />
      {!disableCustomVariables && (
        <PromptVariableEditor
          onAddTextVariable={(variable) => {
            addTextVariableToHTML(variable)
          }}
        />
      )}
      <Stack spacing={1}>
        <Stack direction={'row'} alignItems="center">
          <Typography variant={'body1'}>
            {t('prompt_editor:ai_response_language__title')}
          </Typography>
        </Stack>
        <FormControlLabel
          sx={{
            p: '4px 16px',
            borderRadius: '4px',
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            border: `1px solid`,
            borderColor: 'customColor.borderColor',
          }}
          control={<Switch checked={enabledAIResponseLanguage} />}
          label={
            <Stack direction={'row'} alignItems="center" gap={1}>
              <Typography variant={'body1'}>
                {t('prompt_editor:ai_response_language__settings__label_1')}
              </Typography>
              <Link
                underline={'always'}
                color={'text.primary'}
                onClick={() => {
                  chromeExtensionClientOpenPage({
                    key: 'options',
                    query: '?id=ai-response-language#/language',
                  })
                }}
              >
                <Typography variant={'body1'}>
                  {t('prompt_editor:ai_response_language__settings__label_2')}
                </Typography>
              </Link>
            </Stack>
          }
          value={enabledAIResponseLanguage}
          onChange={(event: any) => {
            toggleAIResponseLanguage()
          }}
        />
      </Stack>
      {/*TODO: 先不展示给用户 2023-11-10*/}
      {/*TODO: 我们这一版能不能做一个这样的逻辑：*/}
      {/*TODO: 但凡这个prompt是需要用户使用的时候输入input的（比如含有variable、search等）（本质上就是使用的时候send to ai directly = false的），就默认都自动显示Output language & Tone & Writing style*/}
      {/*<Stack spacing={1}>*/}
      {/*  <Stack direction={'row'} alignItems="center">*/}
      {/*    <Typography variant={'body1'}>*/}
      {/*      {t(*/}
      {/*        'settings:feature_card__prompts__edit_prompt__field_advance__title',*/}
      {/*      )}*/}
      {/*    </Typography>*/}
      {/*    <RunPromptTooltip />*/}
      {/*  </Stack>*/}
      {/*  <FormControlLabel*/}
      {/*    sx={{*/}
      {/*      p: '4px 16px',*/}
      {/*      borderRadius: '4px',*/}
      {/*      justifyContent: 'space-between',*/}
      {/*      flexDirection: 'row-reverse',*/}
      {/*      border: `1px solid`,*/}
      {/*      borderColor: 'customColor.borderColor',*/}
      {/*    }}*/}
      {/*    control={<Switch checked={systemSelectVisible} />}*/}
      {/*    label={*/}
      {/*      <Stack direction={'row'} alignItems="center">*/}
      {/*        <Typography variant={'body1'}>*/}
      {/*          {t(*/}
      {/*            'settings:feature_card__prompts__edit_prompt__field_advance__system_select__title',*/}
      {/*          )}*/}
      {/*        </Typography>*/}
      {/*      </Stack>*/}
      {/*    }*/}
      {/*    value={systemSelectVisible}*/}
      {/*    onChange={(event: any) => {*/}
      {/*      toggleSystemSelectVisible()*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</Stack>*/}
    </Stack>
  )
}

export default ShortcutActionsEditor
