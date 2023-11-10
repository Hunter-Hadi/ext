import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IPresetVariablesItem,
  PRESET_VARIABLES_GROUP_MAP,
} from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActionsVariables'
import PresetVariablesTag from '@/features/shortcuts/components/ShortcutActionsEditor/PromptVariableEditor/PresetVariables/PresetVariablesTag'
import { useTranslation } from 'react-i18next'
import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'

const PresetVariables: FC<{
  onClick?: (variable: IActionSetVariable) => void
}> = (props) => {
  const { onClick } = props
  const { t } = useTranslation(['common', 'prompt_editor'])
  return (
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
                      key={variable.VariableName}
                      presetVariable={variable}
                      onClick={(clickVariable) => {
                        onClick?.({
                          VariableName: clickVariable.VariableName,
                          label: clickVariable.VariableName,
                          valueType: 'Text',
                        })
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            )
          },
        )}
      </Stack>
    </Stack>
  )
}
export default PresetVariables
