import { Skeleton, Stack } from '@mui/material'
import React from 'react'

const AISearchingLoading = () => {
  return (
    <Stack spacing={0.5}>
      <Skeleton animation="wave" />
      <Skeleton animation="wave" />
      <Skeleton animation="wave" width={'50%'} />
    </Stack>
  )
}

export default AISearchingLoading
