import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import React from 'react'

const Announcement = () => {
  // TODO: 以后有需要再用通告板块 - 2023-08-24
  return null
  return (
    <Stack
      direction="row"
      bgcolor="#DDB1FF"
      color="rgba(0,0,0,0.87)"
      p={1}
      alignItems="center"
    >
      <Stack
        direction="row"
        flex={1}
        fontSize={16}
        alignItems="center"
        justifyContent="center"
        maxWidth={395}
        mx={'auto'}
      ></Stack>
      <IconButton sx={{ flexShrink: 0, ml: 0.5, color: 'inherit' }}>
        <CloseIcon sx={{ fontSize: '24px' }} />
      </IconButton>
    </Stack>
  )
}

export default Announcement
