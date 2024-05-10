import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import PresetVariablesTag from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables/PresetVariablesTag'
import PresetVariablesTooltip from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PresetVariables/PresetVariablesTooltip'
import useShortcutEditorActionsVariables, {
  IPresetVariablesGroupItem,
  PRESET_VARIABLES_GROUP_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

const PresetVariables: FC<{
  onClick?: (variable: IActionSetVariable) => void
}> = (props) => {
  const { onClick } = props
  const { t } = useTranslation(['common', 'prompt_editor'])
  const { addVariable } = useShortcutEditorActionsVariables()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const { isDarkMode } = useCustomTheme()

  const borderColor = isDarkMode
    ? 'customColor.borderColor'
    : 'rgb(224, 224, 224)'

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography fontSize="14px">
          {t('prompt_editor:preset_variables__title')}
        </Typography>
        <PresetVariablesTooltip sx={{ p: 0 }} />
      </Stack>

      <Stack
        sx={{
          border: '1px solid',
          borderColor,
          bgcolor: 'customColor.paperBackground',
          borderRadius: '8px',
          overflow: 'hidden',
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
                  flexDirection="row"
                  alignItems="center"
                  bgcolor="rgba(0, 0, 0, 0.08)"
                  height="100%"
                >
                  <Typography variant="body2">
                    {presetVariableGroupName}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  flex={1}
                  p={1}
                  gap={1}
                  flexWrap="wrap"
                  alignItems="center"
                  borderLeft="1px solid"
                  borderColor={borderColor}
                >
                  {presetVariables.map(
                    ({
                      variable,
                      permissionKeys = [],
                      requiredInSettingEditor,
                    }) => {
                      if (
                        permissionKeys.length === 0 ||
                        permissionKeys.includes(settingPromptsEditButtonKey!)
                      ) {
                        return (
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
                          >
                            {`{{${variable.label}}}`}
                            {requiredInSettingEditor && (
                              <span style={{ marginLeft: '1px', color: 'red' }}>
                                *
                              </span>
                            )}
                          </PresetVariablesTag>
                        )
                      }
                      return null
                    },
                  )}
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
