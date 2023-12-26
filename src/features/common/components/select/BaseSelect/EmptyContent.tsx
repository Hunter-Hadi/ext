import SearchIcon from '@mui/icons-material/Search'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

const EmptyContent: FC<{
  emptyText?: string
  sx?: SxProps
}> = ({ emptyText = 'No Results Found', sx }) => {
  return (
    <Stack alignItems={'center'} sx={sx}>
      <Stack
        width={'56px'}
        height={'56px'}
        justifyContent={'center'}
        alignItems={'center'}
        borderRadius={4}
        sx={{
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, .04)'
              : 'rgba(0, 0, 0, .04)',
        }}
      >
        <SearchIcon width={24} height={24} />
      </Stack>
      <Typography variant={'body1'}>{emptyText}</Typography>
    </Stack>
  )
}
export default EmptyContent
