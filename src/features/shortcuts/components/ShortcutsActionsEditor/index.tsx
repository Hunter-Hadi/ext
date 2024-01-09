import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useMemo, useRef } from 'react'
import ContentEditable from 'react-contenteditable'
import { useTranslation } from 'react-i18next'

import PromptVariableEditor from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor'
import PresetVariables from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import {
  generateVariableHtmlContent,
  promptEditorAddHtmlToFocusNode,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
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
}> = (props) => {
  const {
    error,
    errorText,
    disabled,
    placeholder,
    sx,
    minHeight = 240,
    maxHeight = 450,
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
      pointerEvents: disabled ? 'none' : 'auto',

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
        width: 'calc(100% - 4px)',
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
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
      ...sx,
      ...(error
        ? {
            '& .prompt-template-input': {
              '--borderColor': (t: Theme) =>
                `${t.palette.error.main}!important`,
            },
          }
        : {}),
    }
  }, [placeholder, minHeight, sx, disabled, error])

  return (
    <Stack spacing={1}>
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
            console.log('onClick', event)
            // 保存光标位置
            lastSelectionRangeRef.current =
              window.getSelection()?.getRangeAt(0)?.cloneRange() || null
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' || event.key === 'Enter') {
              const selection = window.getSelection()
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
            console.log('onKeyUp', event)
            // 保存光标位置
            lastSelectionRangeRef.current =
              window.getSelection()?.getRangeAt(0)?.cloneRange() || null
          }}
        />
      </Box>
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
      <PromptVariableEditor
        onAddTextVariable={(variable) => {
          addTextVariableToHTML(variable)
        }}
      />
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
