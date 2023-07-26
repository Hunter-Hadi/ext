import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const SettingsCardLayout: FC<{
  title: string
  id: string
  children: React.ReactNode
}> = (props) => {
  const { id, title, children } = props
  return (
    <Stack spacing={2}>
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
      <Stack
        p={2}
        mb={4}
        sx={{
          borderRadius: '4px',
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(50, 50, 52, 1)'
              : 'rgba(245,246,247, 1)',
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
export default SettingsCardLayout
