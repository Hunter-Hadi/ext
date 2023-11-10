import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ContentEditable from 'react-contenteditable'
import {
  generateVariableHtmlContent,
  promptEditorAddHtmlToFocusNode,
} from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActions'
import PresetVariables from '@/features/shortcuts/components/ShortcutActionsEditor/PromptVariableEditor/PresetVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import PromptVariableEditor from '@/features/shortcuts/components/ShortcutActionsEditor/PromptVariableEditor'

const ShortcutActionsEditor: FC<{
  defaultValue?: ISetActionsType
  disabled?: boolean
  placeholder?: string
  minHeight?: number
  onChange?: ISetActionsType
  onSave?: ISetActionsType
  sx?: SxProps
}> = (props) => {
  const { defaultValue, disabled, placeholder, sx, minHeight = 240 } = props
  const { setActions, editHTML, updateEditHTML } = useShortcutEditorActions()
  const theme = useCustomTheme()
  const inputRef = useRef<HTMLDivElement>(null)
  const lastSelectionRangeRef = useRef<Range | null>(null)
  const addTextVariableToHTML = useCallback(
    (variable: IActionSetVariable) => {
      if (inputRef.current) {
        const addHtml = `${generateVariableHtmlContent(
          variable.VariableName,
          variable.label,
          theme.isDarkMode,
        )}`
        lastSelectionRangeRef.current = promptEditorAddHtmlToFocusNode(
          inputRef.current,
          addHtml,
          lastSelectionRangeRef.current || undefined,
        )
        updateEditHTML(inputRef.current.innerHTML)
      }
    },
    [theme.isDarkMode],
  )
  const memoSx = useMemo<SxProps>(() => {
    return {
      pointerEvents: disabled ? 'none' : 'auto',
      '.prompt-template-input[contenteditable=true]:empty:before': {
        content: `"${placeholder}"`,
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
        maxHeight: '46vh',
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
    }
  }, [placeholder, minHeight, sx, disabled])
  useEffect(() => {
    if (defaultValue) {
      setActions(defaultValue)
    }
  }, [defaultValue])
  return (
    <Stack spacing={1}>
      <Box sx={memoSx}>
        <ContentEditable
          innerRef={inputRef}
          className={'prompt-template-input'}
          id={'prompt-template-input'}
          html={editHTML}
          // disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            updateEditHTML(event.target.value)
          }}
          onMouseUp={(event) => {
            console.log('onClick', event)
            // 保存光标位置
            lastSelectionRangeRef.current =
              window.getSelection()?.getRangeAt(0)?.cloneRange() || null
          }}
          onKeyUp={(event) => {
            console.log('onKeyUp', event)
            // 保存光标位置
            lastSelectionRangeRef.current =
              window.getSelection()?.getRangeAt(0)?.cloneRange() || null
          }}
        />
      </Box>
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
    </Stack>
  )
}

export default ShortcutActionsEditor
