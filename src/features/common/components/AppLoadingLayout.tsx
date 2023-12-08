import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { SxProps } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
const AppLoadingLayout: FC<{
  loading: boolean
  loadingText?: string
  size?: number
  sx?: SxProps
  children?: React.ReactNode
}> = ({ loading, loadingText, size = 20, sx, children }) => {
  const { t } = useTranslation(['common'])
  const loadingTextMemo = React.useMemo(() => {
    return loadingText || t('common:loading')
  }, [loadingText, t])
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
          {loadingTextMemo && (
            <Typography
              mt={1.5}
              variant="body2"
              fontWeight={400}
              fontSize={'16px'}
              lineHeight={1.25}
              color={'text.primary'}
            >
              {loadingTextMemo}
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
