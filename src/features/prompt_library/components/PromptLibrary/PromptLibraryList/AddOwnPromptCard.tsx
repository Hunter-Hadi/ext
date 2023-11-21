import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Stack, Typography } from '@mui/material'
import React, { FC } from 'react'

const AddOwnPromptCard: FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <Stack
      p={2}
      spacing={2}
      onClick={() => {
        onClick && onClick()
      }}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'
        const shadowColor = isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.16)'

        return {
          color: 'text.primary',
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 160,
          height: 'calc(100% - 16px - 16px)',
          userSelect: 'none',
          bgcolor: isDark ? '#3E3F4C' : '#fff',
          '&:hover': {
            boxShadow: `0px 4px 8px ${shadowColor}`,
          },
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} color="inherit">
        <AddOutlinedIcon
          sx={{
            fontSize: 20,
          }}
        />
        <Typography fontSize={16}>Add new prompt template</Typography>
      </Stack>
    </Stack>
  )
}

export default AddOwnPromptCard
