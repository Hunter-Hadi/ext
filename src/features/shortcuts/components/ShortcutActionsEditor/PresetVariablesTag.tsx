import { Typography } from '@mui/material'
import React, { FC } from 'react'
import { IPresetVariablesItem } from '@/features/shortcuts/components/ShortcutActionsEditor/useShortcutEditorActionVariables'
import { generateRandomColor } from '@/features/shortcuts/components/ShortcutActionsEditor/utils'

function setOpacity(hexColor: string, opacity: number): string {
  // 去除颜色代码中的 #
  hexColor = hexColor.replace('#', '')

  // 将颜色代码转换为 RGB 值
  const r = parseInt(hexColor.substr(0, 2), 16)
  const g = parseInt(hexColor.substr(2, 2), 16)
  const b = parseInt(hexColor.substr(4, 2), 16)

  // 将不透明度转换为 0-1 范围
  const alpha = opacity / 100

  // 构建带有指定不透明度的 RGBA 颜色代码
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`

  return rgbaColor
}

/**
 * 调整颜色的亮度
 * @param hex
 * @param targetLightness
 */
function hexChangeLightness(hex: string, targetLightness: number): string {
  // 将Hex转换为RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // 将RGB转换为HSL
  const rNormalized = r / 255
  const gNormalized = g / 255
  const bNormalized = b / 255

  const max = Math.max(rNormalized, gNormalized, bNormalized)
  const min = Math.min(rNormalized, gNormalized, bNormalized)

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case rNormalized:
        h =
          (gNormalized - bNormalized) / d + (gNormalized < bNormalized ? 6 : 0)
        break
      case gNormalized:
        h = (bNormalized - rNormalized) / d + 2
        break
      case bNormalized:
        h = (rNormalized - gNormalized) / d + 4
        break
    }

    h /= 6
  }

  // 调整亮度
  const adjustedL = Math.max(0, Math.min(1, targetLightness))

  // 将HSL转换为Hex
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q =
    adjustedL < 0.5 ? adjustedL * (1 + s) : adjustedL + s - adjustedL * s
  const p = 2 * adjustedL - q

  const rAdjusted = Math.round(hueToRgb(p, q, h + 1 / 3) * 255)
  const gAdjusted = Math.round(hueToRgb(p, q, h) * 255)
  const bAdjusted = Math.round(hueToRgb(p, q, h - 1 / 3) * 255)

  const adjustedHex = `#${rAdjusted
    .toString(16)
    .padStart(2, '0')}${gAdjusted
    .toString(16)
    .padStart(2, '0')}${bAdjusted.toString(16).padStart(2, '0')}`

  return adjustedHex
}

const PresetVariablesTag: FC<{
  onClick?: (variable: IPresetVariablesItem) => void
  presetVariable: IPresetVariablesItem
}> = ({ onClick, presetVariable }) => {
  const color = hexChangeLightness(
    generateRandomColor(presetVariable.value),
    0.9,
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
      {`{{${presetVariable.value}}}`}
    </Typography>
  )
}

export default PresetVariablesTag
