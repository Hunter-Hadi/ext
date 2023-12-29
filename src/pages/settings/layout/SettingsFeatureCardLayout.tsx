import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

const SettingsFeatureCardLayout: FC<{
  title: string
  tooltip?: React.ReactNode
  id: string
  children: React.ReactNode
}> = (props) => {
  const { id, title, children, tooltip } = props
  return (
    <Stack spacing={2}>
      <Stack direction={'row'} alignItems="center">
        <Typography
          id={id}
          component={'h2'}
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
          borderRadius: '4px',
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
