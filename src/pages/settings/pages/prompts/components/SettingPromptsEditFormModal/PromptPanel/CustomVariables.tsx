import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import PresetVariablesTag from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables/PresetVariablesTag'
import useShortcutEditorActionVariables from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import { promptNameToVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import VariableFormModel from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/PromptPanel/VariableFormModel'

export interface IPromptVariableEditorExposeRef {
  addVariable: (variableLabel: string) => void
}

export interface IPromptVariableEditorProps {
  onAddTextVariable?: (variable: IActionSetVariable) => void
}

// eslint-disable-next-line react/display-name
const CustomVariable = React.forwardRef<
  IPromptVariableEditorExposeRef,
  IPromptVariableEditorProps
>((props, ref) => {
  const { onAddTextVariable } = props
  const { t } = useTranslation(['prompt_editor'])
  const { isDarkMode } = useCustomTheme()

  const {
    filterVariables: variables,
    addVariable,
    updateVariable,
  } = useShortcutEditorActionVariables()

  const [editOpen, setEditOpen] = useState(false)
  const [editingVariable, setEditingVariable] =
    useState<IActionSetVariable | null>(null)

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center">
        <Typography fontSize="14px">
          {t('prompt_editor:add_variable__title')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          border: '1px solid',
          // borderColor: 'customColor.borderColor',
          borderColor: 'rgb(224, 224, 224)',
          bgcolor: 'customColor.paperBackground',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" borderColor="inherit" alignItems="center">
          <Stack
            p={1}
            flexBasis="15%"
            flexDirection="row"
            alignItems="center"
            bgcolor="rgba(0, 0, 0, 0.08)"
            borderRight="1px solid"
            borderColor="inherit"
            height="100%"
          >
            <Typography variant="body2">Variables</Typography>
          </Stack>

          <Stack
            direction="row"
            flex={1}
            p={1}
            gap={1}
            flexWrap="wrap"
            alignItems="center"
          >
            {variables.map((variable) => {
              return (
                <PresetVariablesTag
                  key={variable.VariableName}
                  presetVariable={variable}
                  onClick={() => {
                    if (variable.valueType === 'Text') {
                      onAddTextVariable?.(variable)
                    }
                  }}
                >
                  {`{{${variable.label}}}`}
                  <Box display="inline">
                    <Divider
                      orientation="vertical"
                      variant="middle"
                      sx={{
                        display: 'inline-block',
                        height: '12px',
                        verticalAlign: 'middle',
                        borderColor: 'inherit',
                        my: 0,
                        opacity: 0.6,
                        ml: '6px',
                      }}
                    />
                    <IconButton
                      color="inherit"
                      sx={{
                        p: 0,
                        ml: '2px',
                      }}
                      onClick={(event) => {
                        event.stopPropagation()
                        setEditingVariable(variable)
                        setEditOpen(true)
                      }}
                    >
                      <EditOutlinedIcon
                        sx={{
                          fontSize: '16px',
                        }}
                      />
                    </IconButton>
                  </Box>
                </PresetVariablesTag>
              )
            })}
          </Stack>

          <Button
            variant="text"
            startIcon={<AddIcon />}
            sx={{
              borderLeft: '1px solid',
              borderRadius: 0,
              height: '100%',
              color: 'inherit',
              borderColor: 'inherit',
            }}
            onClick={() => {
              setEditingVariable(null)
              setEditOpen(true)
            }}
          >
            Add
          </Button>
        </Stack>
      </Stack>

      <VariableFormModel
        type={editingVariable ? 'update' : 'add'}
        open={editOpen}
        variable={editingVariable}
        onSave={(name, placeholder) => {
          if (editingVariable) {
            updateVariable({
              ...editingVariable,
              label: name,
              placeholder,
            })
          } else {
            addVariable({
              label: name,
              placeholder,
              VariableName: promptNameToVariable(name),
              valueType: 'Text',
            })
          }
          setEditingVariable(null)
          setEditOpen(false)
        }}
        onClose={() => {
          setEditingVariable(null)
          setEditOpen(false)
        }}
      />
    </Stack>
  )
})

export default CustomVariable
