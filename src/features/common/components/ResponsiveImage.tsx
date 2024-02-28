import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

interface IProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  width: number
  height: number
  alt?: string
  sx?: SxProps
}

const ResponsiveImage: FC<IProps> = ({
  src,
  alt,
  width,
  height,
  sx,
  ...rest
}) => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      paddingTop: `${(height / width) * 100}%`,
      ...sx,
    }}
  >
    <img
      src={src}
      alt={alt}
      {...rest}
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        color: 'transparent',
        ...rest.style,
      }}
    />
  </Box>
)

export default ResponsiveImage
