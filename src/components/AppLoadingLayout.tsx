import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { SxProps } from '@mui/material/styles'
const AppLoadingLayout: FC<{
  loading: boolean
  loadingText?: string
  size?: number
  sx?: SxProps
  children?: React.ReactNode
}> = ({ loading, loadingText = 'Loading...', size = 20, sx, children }) => {
  return (
    <React.Fragment>
      {loading ? (
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
          {loadingText && (
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
          )}
        </Box>
      ) : (
        children
      )}
    </React.Fragment>
  )
}
export default AppLoadingLayout
