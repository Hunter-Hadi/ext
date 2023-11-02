import React, { FC } from 'react'
import Stack from '@mui/material/Stack'

const SidebarHeader: FC = () => {
  return (
    <Stack
      sx={{
        width: '100%',
        position: 'sticky',
        top: 0,
        transform: `translateY(0%)`,
      }}
    ></Stack>
  )
}
export default SidebarHeader
