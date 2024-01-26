import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'

interface IProps {
  src: string
  sx?: SxProps
}

const IframeBox: FC<IProps> = ({ src, sx }) => {
  const [iframeLoading, setIframeLoading] = React.useState(true)

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',

        '& > iframe': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        },

        ...sx,
      }}
    >
      {iframeLoading && <AppLoadingLayout loading />}

      <iframe
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        onLoad={() => {
          setIframeLoading(true)
        }}
      ></iframe>
    </Box>
  )
}

export default IframeBox
