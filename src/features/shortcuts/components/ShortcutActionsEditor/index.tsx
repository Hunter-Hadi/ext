import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ContentEditable from 'react-contenteditable'
import useShortcutEditorActionVariables, {
  PRESET_VARIABLES_GROUP_MAP,
  IPresetVariablesItem,
} from '@/features/shortcuts/components/ShortcutActionsEditor/useShortcutEditorActionVariables'
import { promptTemplateToHtml } from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import PresetVariablesTag from '@/features/shortcuts/components/ShortcutActionsEditor/PresetVariablesTag'

const ShortcutActionsEditor: FC<{
  defaultValue?: ISetActionsType
  disabled?: boolean
  placeholder?: string
  minHeight?: number
  onChange?: ISetActionsType
  onSave?: ISetActionsType
  sx?: SxProps
}> = (props) => {
  const { t } = useTranslation(['common', 'prompt_editor'])
  const { defaultValue, disabled, placeholder, sx, minHeight = 240 } = props
  const { variables } = useShortcutEditorActionVariables()
  const [inputHtml, setInputHtml] = useState('')
  const [plainText, setPlainText] = useState('')
  const inputRef = useRef<HTMLDivElement>(null)
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
  const [actions, setActions] = useState<ISetActionsType>([])
  useEffect(() => {
    console.log('defaultValue', defaultValue)
    if (defaultValue?.length && !inputHtml) {
      const findPrompt =
        defaultValue.find((action) => action.type === 'RENDER_TEMPLATE') ||
        defaultValue.find((action) => action.type === 'ASK_CHATGPT') ||
        defaultValue.find((action) => action.type === 'RENDER_CHATGPT_PROMPT')
      if (findPrompt?.parameters.template) {
        console.log('defaultValue', findPrompt?.parameters.template)
        setPlainText(findPrompt.parameters.template)
        setInputHtml(promptTemplateToHtml(findPrompt.parameters.template))
      }
      setActions(actions)
    }
  }, [defaultValue, inputHtml])
  return (
    <Stack>
      <Box sx={memoSx}>
        <ContentEditable
          innerRef={inputRef}
          className={'prompt-template-input'}
          id={'prompt-template-input'}
          html={inputHtml}
          // disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            setInputHtml(event.target.value)
            setPlainText(event.currentTarget.innerText)
          }}
          onFocus={() => {}}
        />
      </Box>
      <Stack>
        <Stack direction={'row'} alignItems={'center'} spacing={0.5} mb={1}>
          <Typography fontSize={'14px'}>Use preset variables</Typography>
        </Stack>
        <Stack
          sx={{
            border: '1px solid',
            borderColor: 'customColor.borderColor',
            bgcolor: 'customColor.paperBackground',
            borderRadius: 1,
            mb: 2,
          }}
        >
          {Object.keys(PRESET_VARIABLES_GROUP_MAP).map(
            (presetVariableGroupKey, index) => {
              const presetVariableGroupName = t(presetVariableGroupKey as any)
              const variables = PRESET_VARIABLES_GROUP_MAP[
                presetVariableGroupKey as any
              ] as IPresetVariablesItem[]
              return (
                <Stack
                  key={presetVariableGroupKey}
                  direction="row"
                  borderBottom={
                    index < Object.keys(PRESET_VARIABLES_GROUP_MAP).length - 1
                      ? '1px solid'
                      : 'none'
                  }
                  borderColor="inherit"
                  alignItems="center"
                >
                  <Stack
                    p={1}
                    flexBasis="15%"
                    flexDirection={'row'}
                    alignItems="center"
                  >
                    <Typography variant="body2">
                      {presetVariableGroupName}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    p={1}
                    spacing={1}
                    flexWrap="wrap"
                    alignItems="center"
                    borderLeft="1px solid"
                    borderColor="inherit"
                  >
                    {variables.map((variable) => (
                      <PresetVariablesTag
                        key={variable.value}
                        presetVariable={variable}
                        onClick={() => {}}
                      />
                    ))}
                  </Stack>
                </Stack>
              )
            },
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default ShortcutActionsEditor
