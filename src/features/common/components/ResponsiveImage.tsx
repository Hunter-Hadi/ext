import React, { FC } from 'react'

interface IProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  width: number
  height: number
  alt?: string
}

const ResponsiveImage: FC<IProps> = ({ src, alt, width, height, ...rest }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      paddingTop: `${(height / width) * 100}%`,
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
  </div>
)

export default ResponsiveImage
