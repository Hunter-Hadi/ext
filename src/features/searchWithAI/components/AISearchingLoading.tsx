import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import React from 'react'

const AISearchingLoading = () => {
  return (
    <Stack spacing={0.5}>
      <Skeleton animation='wave' />
      <Skeleton animation='wave' />
      <Skeleton animation='wave' width={'50%'} />
    </Stack>
  )
}

export default AISearchingLoading
