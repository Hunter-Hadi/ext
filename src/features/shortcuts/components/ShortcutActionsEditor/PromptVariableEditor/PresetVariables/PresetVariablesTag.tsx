import { Typography } from '@mui/material'
import React, { FC } from 'react'
import { IPresetActionSetVariable } from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActionsVariables'
import {
  generateRandomColor,
  hexChangeLightnessAndSaturation,
  setOpacity,
} from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
import { useCustomTheme } from '@/hooks/useCustomTheme'

const PresetVariablesTag: FC<{
  onClick?: (variable: IPresetActionSetVariable) => void
  presetVariable: IPresetActionSetVariable
}> = ({ onClick, presetVariable }) => {
  const theme = useCustomTheme()

  const color = theme.isDarkMode
    ? hexChangeLightnessAndSaturation(
        generateRandomColor(presetVariable.VariableName),
        0.75,
        0.9,
      )
    : hexChangeLightnessAndSaturation(
        generateRandomColor(presetVariable.VariableName),
        0.3,
        0.95,
      )
  return (
    <Typography
      sx={(t) => {
        return {
          fontSize: 14,
          lineHeight: 1.4,
          px: 0.6,
          py: '2px',
          // mr: 1,
          borderRadius: 1,
          cursor: onClick ? 'pointer' : 'auto',
          userSelect: 'none',
          color,
          bgcolor: setOpacity(color, 16),
        }
      }}
      onClick={() => {
        onClick && onClick(presetVariable)
      }}
    >
      {`{{${presetVariable.VariableName}}}`}
    </Typography>
  )
}

export default PresetVariablesTag
