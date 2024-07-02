import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

const SettingsFeatureCardLayout: FC<{
  title: React.ReactNode
  tooltip?: React.ReactNode
  id: string
  children: React.ReactNode
  sx?: SxProps
}> = (props) => {
  const { id, title, children, tooltip, sx } = props
  return (
    <Stack
      spacing={2}
      sx={{
        ...sx,
      }}
    >
      <Stack direction={'row'} alignItems='center'>
        <Typography
          className={'maxai-settings--feature-card--title'}
          id={id}
          component={'div'}
          fontSize={'24px'}
          lineHeight={'28px'}
          fontWeight={800}
          color={'text.primary'}
        >
          {title}
        </Typography>
        {tooltip}
      </Stack>
      <Stack
        p={2}
        sx={{
          mb: '32px!important',
          borderRadius: '8px',
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(18, 18, 18, 1)'
              : 'rgba(245,246,247, 1)',
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
export default SettingsFeatureCardLayout
