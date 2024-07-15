import Box from '@mui/material/Box'
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo } from 'react'

import { IS_UNLIMITED_FLAG } from '.'

interface IUsageProgressProps {
  value: number
  maxValue: number
  sx?: SxProps
}

const UsageProgress: FC<IUsageProgressProps> = ({
  value: propValue,
  maxValue: propMaxValue,
  sx,
}) => {
  // LinearProgress 的 value 是 0~100, 所以需要除以100
  const value = useMemo(() => {
    const newValue = (propValue / propMaxValue) * 100
    if (newValue === 0) {
      return 1
    }
    return newValue
  }, [propValue, propMaxValue])

  const barColor = useMemo(() => {
    // 100~60 green 60~30 yellow 30~0 red
    if (propValue >= propMaxValue * 0.6) {
      return '#34A853'
    }
    if (propValue >= propMaxValue * 0.3) {
      return '#FF9900'
    }
    return '#ED5050'
  }, [propValue, propMaxValue])

  if (propMaxValue === 0 || propValue === IS_UNLIMITED_FLAG) {
    return null
  }

  return (
    <Box
      sx={{
        // 由于需要让进度条 从右边往左边增长，所以需要旋转180度
        transform: 'rotateY(180deg)',
        ...sx,
      }}
    >
      <LinearProgress
        value={value}
        variant='determinate'
        sx={{
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? '#FFFFFF14' : '#00000014',
          borderRadius: 10,
          [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 10,
            bgcolor: barColor,
          },
        }}
      />
    </Box>
  )
}

export default UsageProgress
