import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import PresetVariablesTag from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables/PresetVariablesTag'
import PresetVariablesTooltip from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables/PresetVariablesTooltip'
import useShortcutEditorActionsVariables, {
  IPresetVariablesGroupItem,
  PRESET_VARIABLES_GROUP_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'

const PresetVariables: FC<{
  onClick?: (variable: IActionSetVariable) => void
}> = (props) => {
  const { onClick } = props
  const { t } = useTranslation(['common', 'prompt_editor'])
  const { addVariable } = useShortcutEditorActionsVariables()
  return (
    <Stack>
      <Stack direction={'row'} alignItems={'center'} spacing={0.5} mb={1}>
        <Typography fontSize={'14px'}>
          {t('prompt_editor:preset_variables__title')}
        </Typography>
        <PresetVariablesTooltip />
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
            const presetVariables = PRESET_VARIABLES_GROUP_MAP[
              presetVariableGroupKey as any
            ] as IPresetVariablesGroupItem[]
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
                  gap={1}
                  flexWrap="wrap"
                  alignItems="center"
                  borderLeft="1px solid"
                  borderColor="inherit"
                >
                  {presetVariables.map(({ variable }) => (
                    <PresetVariablesTag
                      key={variable.VariableName}
                      presetVariable={variable}
                      onClick={(clickVariable) => {
                        addVariable(clickVariable)
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
