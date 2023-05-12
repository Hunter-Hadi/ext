import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React, { FC, Suspense } from 'react'
import { SxProps } from '@mui/material/styles'

const AppSuspenseLoadingLayout: FC<{
  loadingText?: string
  size?: number
  sx?: SxProps
  children?: React.ReactNode
}> = ({ loadingText = 'Loading...', size = 16, sx, children }) => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            my: 2,
            ...sx,
          }}
        >
          <CircularProgress size={size} sx={{ m: '0 auto' }} />
          <Typography
            mt={1.5}
            variant="body2"
            fontWeight={400}
            fontSize={'16px'}
            lineHeight={1.25}
            color={'text.primary'}
          >
            {loadingText}
          </Typography>
        </Box>
      }
    >
      {children}
    </Suspense>
  )
}
export default AppSuspenseLoadingLayout
